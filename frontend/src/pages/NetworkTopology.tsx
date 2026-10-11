import React from 'react';
import { Server, Monitor, Shield } from 'lucide-react';

const NetworkTopology: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* Topology Context Banner */}
      <div className="bg-surface border border-surface-border rounded p-4 shadow-panel flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-simulated-subtle text-status-simulated border border-status-simulated-border font-medium uppercase tracking-wider">
              Simulated Reference Architecture
            </span>
            <span className="text-xs text-text-muted">Phase 1 Target Topology</span>
          </div>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">
            This schematic models the target Software-Defined Networking (SDN) data-plane and control-plane deployment. In Phase 1, flow records are injected synthetically or from recorded traces; live OpenFlow switch socket integration is slated for Phase 2.
          </p>
        </div>
        <div className="hidden sm:block text-right font-mono text-[11px] text-text-muted shrink-0">
          <div>Switch: <span className="text-text-primary">OpenFlow 1.3</span></div>
          <div>Plane: <span className="text-text-primary">Mininet Virtual</span></div>
        </div>
      </div>

      {/* Main Diagram Canvas */}
      <div className="bg-surface border border-surface-border rounded p-8 shadow-panel flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
        {/* Subtle grid background for technical blueprint aesthetic */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#e6edf5 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
          {/* Level 1: SDN Controller */}
          <div className="flex flex-col items-center">
            <div className="px-5 py-3 rounded bg-surface-subtle border border-accent-border shadow-md flex items-center gap-3">
              <div className="p-1.5 rounded bg-accent-subtle text-accent border border-accent/20">
                <Shield size={18} />
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary">
                  SDN Controller
                </div>
                <div className="font-mono text-[10px] text-text-muted">
                  Ryu / OpenFlow Controller
                </div>
              </div>
            </div>
            <span className="font-mono text-[9px] text-accent mt-1 tracking-wider uppercase">
              Control Plane
            </span>
          </div>

          {/* Connection Channel: Controller -> Switch */}
          <div className="flex flex-col items-center my-2">
            <div className="w-px h-10 border-l border-dashed border-accent/40" />
            <div className="font-mono text-[9px] text-text-muted bg-surface px-2 py-0.5 rounded border border-surface-border">
              OpenFlow 1.3 Channel (Stats Requests / Replies)
            </div>
            <div className="w-px h-10 border-l border-dashed border-accent/40" />
          </div>

          {/* Level 2: Core OpenFlow Switch */}
          <div className="flex flex-col items-center">
            <div className="px-7 py-3.5 rounded bg-surface-active border border-surface-border-active shadow-md flex items-center gap-3.5">
              <div className="p-2 rounded bg-surface border border-surface-border text-text-primary">
                <Server size={22} />
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary flex items-center gap-2">
                  <span>Open vSwitch (s1)</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-subtle text-text-secondary border border-surface-border">
                    DPID: 0001
                  </span>
                </div>
                <div className="font-mono text-[10px] text-text-muted mt-0.5">
                  Flow Table 0 · Counter Extraction Point
                </div>
              </div>
            </div>
            <span className="font-mono text-[9px] text-text-muted mt-1 tracking-wider uppercase">
              Data Plane Forwarding
            </span>
          </div>

          {/* Connection Channel: Switch -> Hosts Bus */}
          <div className="w-full flex justify-center items-center my-3">
            <div className="w-px h-8 bg-surface-border" />
          </div>

          {/* Host Links SVG */}
          <div className="w-full relative h-10">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 40">
              <path d="M 300 0 L 300 15 L 75 15 L 75 40" stroke="#39414B" strokeWidth="1.5" fill="none" />
              <path d="M 300 0 L 300 40" stroke="#39414B" strokeWidth="1.5" fill="none" />
              <path d="M 300 0 L 300 15 L 525 15 L 525 40" stroke="#39414B" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          {/* Level 3: Connected Virtual Hosts */}
          <div className="w-full grid grid-cols-3 gap-6 pt-1">
            {/* Host 1 */}
            <div className="bg-surface-subtle border border-surface-border rounded p-3 flex flex-col items-center text-center">
              <div className="p-1.5 rounded bg-surface border border-surface-border text-text-secondary mb-1.5">
                <Monitor size={16} />
              </div>
              <div className="text-xs font-semibold text-text-primary font-mono">h1</div>
              <div className="text-[10px] font-mono text-text-muted">10.0.0.1 / Port 1</div>
              <div className="text-[9px] font-mono text-text-dim mt-1">Normal Traffic Source</div>
            </div>

            {/* Host 2 */}
            <div className="bg-surface-subtle border border-surface-border rounded p-3 flex flex-col items-center text-center">
              <div className="p-1.5 rounded bg-surface border border-surface-border text-text-secondary mb-1.5">
                <Monitor size={16} />
              </div>
              <div className="text-xs font-semibold text-text-primary font-mono">h2</div>
              <div className="text-[10px] font-mono text-text-muted">10.0.0.2 / Port 2</div>
              <div className="text-[9px] font-mono text-text-dim mt-1">Simulated Threat Vector</div>
            </div>

            {/* Host 3 */}
            <div className="bg-surface-subtle border border-surface-border rounded p-3 flex flex-col items-center text-center">
              <div className="p-1.5 rounded bg-surface border border-surface-border text-text-secondary mb-1.5">
                <Monitor size={16} />
              </div>
              <div className="text-xs font-semibold text-text-primary font-mono">h3</div>
              <div className="text-[10px] font-mono text-text-muted">10.0.0.3 / Port 3</div>
              <div className="text-[9px] font-mono text-text-dim mt-1">Target Workstation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-surface border border-surface-border rounded p-3.5 shadow-panel">
          <div className="font-semibold text-text-primary mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            1. Flow Stats Polling
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            The SDN Controller periodically queries Open vSwitch flow entries (<code className="text-text-secondary font-mono">OFPFlowStatsRequest</code>) to sample <code className="text-text-secondary font-mono">packet_count</code>, <code className="text-text-secondary font-mono">byte_count</code>, and <code className="text-text-secondary font-mono">duration_sec</code>.
          </p>
        </div>

        <div className="bg-surface border border-surface-border rounded p-3.5 shadow-panel">
          <div className="font-semibold text-text-primary mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-anomaly"></span>
            2. Feature Normalization
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            The controller pushes raw counters to the RouteSense API, where <code className="text-text-secondary font-mono">ml/feature_schema.py</code> computes velocity metrics like <code className="text-text-secondary font-mono">bytes_per_sec</code> and <code className="text-text-secondary font-mono">avg_packet_size</code>.
          </p>
        </div>

        <div className="bg-surface border border-surface-border rounded p-3.5 shadow-panel">
          <div className="font-semibold text-text-primary mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-normal"></span>
            3. Real-Time Inference
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            In-memory Random Forest and Isolation Forest models evaluate the flow within milliseconds. Results persist immediately to the local SQLite database for analyst review.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkTopology;
