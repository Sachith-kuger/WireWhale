import os
import requests
import sys
from pathlib import Path

from ryu.base import app_manager
from ryu.controller import ofp_event
from ryu.controller.handler import CONFIG_DISPATCHER, MAIN_DISPATCHER, set_ev_cls
from ryu.ofproto import ofproto_v1_3
from ryu.lib import hub
from ryu.lib.packet import packet, ethernet, ether_types

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "backend"))

from ml_service import MLService


class WireWhaleController(app_manager.RyuApp):
    OFP_VERSIONS = [ofproto_v1_3.OFP_VERSION]

    POLL_INTERVAL = 2
    API_URL = "http://127.0.0.1:8000/api/predict"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.ml_service = MLService()
        if not self.ml_service.is_loaded:
            raise RuntimeError("WireWhale ML models failed to load")

        self.datapaths = {}
        self.mac_to_port = {}
        self.logger.info("WireWhale ML models loaded successfully")

        self.monitor_thread = hub.spawn(self._monitor)

    @set_ev_cls(ofp_event.EventOFPSwitchFeatures, CONFIG_DISPATCHER)
    def switch_features_handler(self, ev):
        datapath = ev.msg.datapath
        parser = datapath.ofproto_parser
        ofproto = datapath.ofproto

        # Table-miss rule: send unknown packets to the controller.
        match = parser.OFPMatch()
        actions = [
            parser.OFPActionOutput(
                ofproto.OFPP_CONTROLLER,
                ofproto.OFPCML_NO_BUFFER,
            )
        ]
        instructions = [
            parser.OFPInstructionActions(
                ofproto.OFPIT_APPLY_ACTIONS, actions
            )
        ]
        flow_mod = parser.OFPFlowMod(
            datapath=datapath,
            priority=0,
            match=match,
            instructions=instructions,
        )
        datapath.send_msg(flow_mod)

        self.datapaths[datapath.id] = datapath
        self.logger.info(
            "Switch connected: dpid=%016x, OpenFlow=%s",
            datapath.id,
            ofproto.OFP_VERSION,
        )

    @set_ev_cls(ofp_event.EventOFPStateChange, [MAIN_DISPATCHER, CONFIG_DISPATCHER])
    def state_change_handler(self, ev):
        datapath = ev.datapath

        if ev.state == MAIN_DISPATCHER:
            self.datapaths[datapath.id] = datapath
        elif ev.state == CONFIG_DISPATCHER:
            self.datapaths.pop(datapath.id, None)

    def _monitor(self):
        while True:
            for datapath in list(self.datapaths.values()):
                parser = datapath.ofproto_parser
                request = parser.OFPFlowStatsRequest(datapath)
                datapath.send_msg(request)

            hub.sleep(self.POLL_INTERVAL)

    def _send_to_backend(self, record):
        try:
            response = requests.post(
                self.API_URL,
                json={**record, "is_simulated": False},
                timeout=2,
            )
            response.raise_for_status()
            self.logger.info(
                "Backend event saved: status=%s",
                response.json().get("status", "unknown"),
            )
        except Exception:
            self.logger.exception("Failed to send flow data to FastAPI")

    @set_ev_cls(ofp_event.EventOFPFlowStatsReply, MAIN_DISPATCHER)
    def flow_stats_reply_handler(self, ev):
        msg = ev.msg

        for flow in msg.body:
            # Ignore the table-miss rule and empty-duration entries.
            if flow.priority == 0 or flow.duration_sec <= 0:
                continue

            # OpenFlow counters are per flow entry. For this initial
            # prototype, evaluate each entry separately.
            record = {
                "total_packets": int(flow.packet_count),
                "total_bytes": int(flow.byte_count),
                "duration_us": (
                    int(flow.duration_sec) * 1_000_000
                    + int(flow.duration_nsec) // 1_000
                ),
            }

            try:
                result = self.ml_service.predict(record)
            except Exception:
                self.logger.exception("Prediction failed for flow: %s", record)
                continue

            self._send_to_backend(record)

            self.logger.info(
                "WireWhale | switch=%016x | packets=%s | bytes=%s "
                "| RF=%s | anomaly_score=%.6f | threshold=%.6f | status=%s",
                msg.datapath.id,
                record["total_packets"],
                record["total_bytes"],
                result["rf_prediction"],
                result["anomaly_score"],
                result["anomaly_threshold"],
                result["status"],
            )

    @set_ev_cls(ofp_event.EventOFPErrorMsg, [CONFIG_DISPATCHER, MAIN_DISPATCHER])
    def error_handler(self, ev):
        self.logger.error(
            "OpenFlow error: type=%s code=%s",
            ev.msg.type,
            ev.msg.code,
        )

    @set_ev_cls(ofp_event.EventOFPPacketIn, MAIN_DISPATCHER)
    def packet_in_handler(self, ev):
        msg = ev.msg
        datapath = msg.datapath
        ofproto = datapath.ofproto
        parser = datapath.ofproto_parser
        in_port = msg.match["in_port"]

        pkt = packet.Packet(msg.data)
        eth = pkt.get_protocol(ethernet.ethernet)

        if eth is None or eth.ethertype == ether_types.ETH_TYPE_LLDP:
            return

        dpid = datapath.id
        self.mac_to_port.setdefault(dpid, {})
        self.mac_to_port[dpid][eth.src] = in_port

        out_port = self.mac_to_port[dpid].get(
            eth.dst, ofproto.OFPP_FLOOD
        )
        actions = [parser.OFPActionOutput(out_port)]

        if out_port != ofproto.OFPP_FLOOD:
            match = parser.OFPMatch(
                in_port=in_port,
                eth_src=eth.src,
                eth_dst=eth.dst,
            )
            instructions = [
                parser.OFPInstructionActions(
                    ofproto.OFPIT_APPLY_ACTIONS, actions
                )
            ]
            datapath.send_msg(
                parser.OFPFlowMod(
                    datapath=datapath,
                    priority=10,
                    match=match,
                    instructions=instructions,
                    idle_timeout=30,
                )
            )

        data = msg.data if msg.buffer_id == ofproto.OFP_NO_BUFFER else None
        datapath.send_msg(
            parser.OFPPacketOut(
                datapath=datapath,
                buffer_id=msg.buffer_id,
                in_port=in_port,
                actions=actions,
                data=data,
            )
        )
