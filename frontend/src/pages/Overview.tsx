import React from 'react';
import type { EventResponse } from '../api/client';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Activity } from 'lucide-react';

interface Props {
  events: EventResponse[];
}

const Overview: React.FC<Props> = ({ events }) => {
  const totalFlows = events.length;
  const benign = events.filter(e => e.rf_prediction_class === 'BENIGN').length;
  const anomalies = events.filter(e => e.is_anomaly).length;
  const suspicious = events.filter(e => e.rf_prediction_class !== 'BENIGN').length;
  const simulatedCount = events.filter(e => e.is_simulated).length;
  const liveCount = totalFlows - simulatedCount;

  // Chronological order for time series (last 20 events)
  const chartData = [...events].reverse().slice(-20).map(e => ({
    time: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    packets: e.total_packets,
    bytes: e.total_bytes,
    pps: Math.round(e.packets_per_sec)
  }));

  const formatBytes = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="space-y-4">
      {/* 1. Summary Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard 
          label="Total Flows"
          value={totalFlows}
          subtext={`${simulatedCount} simulated · ${liveCount} live`}
          accentColor="bg-accent"
        />
        <MetricCard 
          label="Benign Traffic"
          value={benign}
          subtext="Random Forest: BENIGN"
          valueColor="text-status-normal"
          accentColor="bg-status-normal"
        />
        <MetricCard 
          label="Anomalies"
          value={anomalies}
          subtext="Isolation Forest outliers"
          valueColor="text-status-anomaly"
          accentColor="bg-status-anomaly"
        />
        <MetricCard 
          label="Attacks"
          value={suspicious}
          subtext="Non-benign signatures"
          valueColor={suspicious > 0 ? "text-status-threat" : "text-text-primary"}
          accentColor="bg-status-threat"
        />
      </div>

      {/* 2. Prominent Network Traffic Volume Chart */}
      <div className="bg-surface border border-surface-border rounded p-4 shadow-panel">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Network Traffic Volume (Bytes)
            </h2>
            <p className="text-[11px] text-text-muted mt-0.5">
              Sequential byte throughput across evaluated flow records
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
            <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
            <span>Flow Bytes</span>
          </div>
        </div>

        <div className="pt-3 w-full h-[210px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="overviewFlowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#78AFA9" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#78AFA9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2D3540" strokeDasharray="2 2" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#39414B" 
                  tick={{ fill: '#7F8996', fontSize: 10, fontFamily: 'monospace' }} 
                  tickLine={false}
                  axisLine={{ stroke: '#2D3540' }}
                />
                <YAxis 
                  stroke="#39414B" 
                  tick={{ fill: '#7F8996', fontSize: 10, fontFamily: 'monospace' }} 
                  tickFormatter={formatBytes}
                  tickLine={false}
                  axisLine={{ stroke: '#2D3540' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#222830', 
                    borderColor: '#39414B', 
                    borderRadius: '4px',
                    color: '#E0E5EB',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)'
                  }}
                  formatter={(val: any) => [formatBytes(Number(val)), 'Total Bytes']}
                  labelStyle={{ color: '#A2ABB7', marginBottom: '2px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="bytes" 
                  stroke="#78AFA9" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#overviewFlowGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[210px] flex flex-col items-center justify-center text-text-muted border border-dashed border-surface-border rounded text-xs">
              <Activity size={20} className="mb-2 text-text-dim" />
              <span>No flow records available yet. Start simulation to generate telemetry.</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Recent Detection Events Table */}
      <div className="bg-surface border border-surface-border rounded shadow-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Recent Detection Events
            </h2>
            <p className="text-[11px] text-text-muted mt-0.5">
              Latest flow records processed by the inference engine
            </p>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            Displaying {Math.min(events.length, 6)} of {events.length} records
          </span>
        </div>

        {events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-subtle border-b border-surface-border text-text-muted font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Timestamp</th>
                  <th className="px-3 py-2.5 font-medium">Event ID</th>
                  <th className="px-3 py-2.5 font-medium">Flow Volume</th>
                  <th className="px-3 py-2.5 font-medium">RF Prediction</th>
                  <th className="px-3 py-2.5 font-medium">IF Score</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {events.slice(0, 6).map(e => (
                  <tr key={e.id} className="hover:bg-surface-hover/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-text-secondary text-[11px] whitespace-nowrap">
                      {new Date(e.timestamp).toLocaleTimeString([], { hour12: false })}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-text-muted text-[11px]">
                      #{e.id}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-text-secondary text-[11px] whitespace-nowrap">
                      {e.total_packets.toLocaleString()} pkts · {formatBytes(e.total_bytes)}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                        e.rf_prediction_class === 'BENIGN'
                          ? 'text-status-normal bg-status-normal-subtle border-status-normal-border'
                          : 'text-status-threat bg-status-threat-subtle border-status-threat-border'
                      }`}>
                        {e.rf_prediction_class}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] tabular-nums whitespace-nowrap">
                      <span className={e.is_anomaly ? 'text-status-anomaly font-medium' : 'text-text-muted'}>
                        {e.anomaly_score.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {e.overall_status === 'NORMAL' && (
                        <span className="font-mono text-[10px] text-status-normal">NORMAL</span>
                      )}
                      {e.overall_status === 'ANOMALY_DETECTED' && (
                        <span className="font-mono text-[10px] text-status-anomaly">ANOMALY</span>
                      )}
                      {e.overall_status === 'ATTACK_DETECTED' && (
                        <span className="font-mono text-[10px] text-status-threat">ATTACK</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      {e.is_simulated ? (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-status-simulated-subtle text-status-simulated border border-status-simulated-border">
                          SYNTHETIC
                        </span>
                      ) : (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-accent-subtle text-accent border border-accent-border">
                          LIVE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-text-muted text-xs">
            No events logged yet. Use the simulation controls in the header to transmit flows.
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ 
  label, 
  value, 
  subtext,
  valueColor = "text-text-primary",
  accentColor
}: { 
  label: string; 
  value: number; 
  subtext: string;
  valueColor?: string;
  accentColor: string;
}) => (
  <div className="bg-surface border border-surface-border rounded p-3.5 shadow-panel flex flex-col justify-between relative overflow-hidden">
    <div className={`absolute top-0 left-0 right-0 h-[2px] ${accentColor}`} />
    <div>
      <span className="text-[11px] font-medium tracking-wide text-text-muted uppercase">
        {label}
      </span>
      <div className={`text-2xl font-bold font-mono tracking-tight tabular-nums mt-1 ${valueColor}`}>
        {value.toLocaleString()}
      </div>
    </div>
    <div className="text-[11px] text-text-muted font-mono mt-2 truncate">
      {subtext}
    </div>
  </div>
);

export default Overview;
