import React, { useState } from 'react';
import type { EventResponse } from '../api/client';
import { 
  AlertCircle, 
  Activity, 
  X, 
  SlidersHorizontal,
  Database,
  Cpu
} from 'lucide-react';

interface Props {
  events: EventResponse[];
  isBackendUp: boolean | null;
}

const LiveDetection: React.FC<Props> = ({ events, isBackendUp }) => {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'BENIGN' | 'ANOMALY' | 'ATTACK'>('ALL');

  if (isBackendUp === false) {
    return (
      <div className="bg-surface border border-status-threat-border rounded p-8 flex flex-col items-center justify-center text-center shadow-panel my-6">
        <div className="p-2.5 rounded-full bg-status-threat-subtle text-status-threat border border-status-threat-border mb-3">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
          Detection Service Offline
        </h2>
        <p className="text-xs text-text-muted max-w-md mt-1 mb-4 leading-relaxed">
          The dashboard cannot poll live events from the backend at <code className="text-text-secondary font-mono">127.0.0.1:8000</code>. Verify that the FastAPI uvicorn daemon is running.
        </p>
        <span className="font-mono text-[11px] text-text-secondary bg-surface-subtle px-3 py-1 rounded border border-surface-border">
          HTTP 503 · Service Unavailable
        </span>
      </div>
    );
  }

  const filteredEvents = events.filter(e => {
    if (filterType === 'ANOMALY') return e.is_anomaly;
    if (filterType === 'ATTACK') return e.rf_prediction_class !== 'BENIGN';
    if (filterType === 'BENIGN') return e.rf_prediction_class === 'BENIGN' && !e.is_anomaly;
    return true;
  });

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-130px)]">
      {/* Header & Controls Toolbar */}
      <div className="bg-surface border border-surface-border rounded px-4 py-3 shadow-panel flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Live Flow Event Log
            </h2>
            <p className="text-[11px] text-text-muted mt-0.5">
              Chronological feed of classified network flows evaluated by the dual-model pipeline
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-0.5 rounded bg-surface-subtle border border-surface-border text-text-secondary">
            <span>Buffer:</span>
            <span className="text-text-primary font-semibold tabular-nums">{events.length}</span>
            <span className="text-text-muted">records</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 bg-surface-subtle border border-surface-border p-1 rounded">
          <span className="text-[10px] font-mono text-text-muted px-2 uppercase select-none flex items-center gap-1">
            <SlidersHorizontal size={11} /> Filter:
          </span>
          {(['ALL', 'BENIGN', 'ANOMALY', 'ATTACK'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                filterType === f 
                  ? 'bg-surface text-text-primary border border-surface-border-active shadow-sm font-medium' 
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Investigation Split View */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
        {/* Events Table Container */}
        <div className={`bg-surface border border-surface-border rounded shadow-panel flex flex-col overflow-hidden transition-all duration-150 ${
          selectedEvent ? 'w-full lg:w-7/12' : 'w-full'
        }`}>
          {filteredEvents.length > 0 ? (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-subtle sticky top-0 border-b border-surface-border text-text-muted font-mono uppercase text-[10px] z-10 select-none">
                  <tr>
                    <th className="px-3.5 py-2.5 font-medium w-16">ID</th>
                    <th className="px-3 py-2.5 font-medium w-32">Timestamp (UTC)</th>
                    <th className="px-3 py-2.5 font-medium w-32">RF Class</th>
                    <th className="px-3 py-2.5 font-medium w-36">IF Score / Flag</th>
                    <th className="px-3 py-2.5 font-medium w-28">Verdict</th>
                    <th className="px-3.5 py-2.5 font-medium text-right w-24">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60">
                  {filteredEvents.map(e => {
                    const isSelected = e.id === selectedEventId;
                    return (
                      <tr 
                        key={e.id}
                        onClick={() => setSelectedEventId(isSelected ? null : e.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-surface-active border-l-2 border-l-accent' 
                            : 'hover:bg-surface-hover/75'
                        }`}
                        title="Click to inspect extracted flow features"
                      >
                        {/* Event ID */}
                        <td className="px-3.5 py-2 font-mono text-[11px] text-text-muted tabular-nums">
                          #{e.id}
                        </td>

                        {/* Timestamp */}
                        <td className="px-3 py-2 font-mono text-[11px] text-text-secondary whitespace-nowrap tabular-nums">
                          {new Date(e.timestamp).toISOString().replace('T', ' ').slice(11, 23)}
                        </td>

                        {/* RF Prediction Class */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                            e.rf_prediction_class === 'BENIGN'
                              ? 'text-status-normal bg-status-normal-subtle border-status-normal-border'
                              : 'text-status-threat bg-status-threat-subtle border-status-threat-border'
                          }`}>
                            {e.rf_prediction_class}
                          </span>
                        </td>

                        {/* IF Anomaly Score & Outlier Flag */}
                        <td className="px-3 py-2 font-mono text-[11px] tabular-nums whitespace-nowrap">
                          <span className={e.is_anomaly ? 'text-status-anomaly font-semibold' : 'text-text-secondary'}>
                            {e.anomaly_score.toFixed(4)}
                          </span>
                          {e.is_anomaly ? (
                            <span className="ml-1.5 font-mono text-[9px] px-1 py-0.2 rounded bg-status-anomaly-subtle text-status-anomaly border border-status-anomaly-border">
                              OUTLIER
                            </span>
                          ) : (
                            <span className="ml-1.5 font-mono text-[9px] text-text-dim">
                              NORM
                            </span>
                          )}
                        </td>

                        {/* Consolidated Verdict */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          {e.overall_status === 'NORMAL' && (
                            <span className="font-mono text-[10px] text-status-normal flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-status-normal"></span>
                              NORMAL
                            </span>
                          )}
                          {e.overall_status === 'ANOMALY_DETECTED' && (
                            <span className="font-mono text-[10px] text-status-anomaly flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-status-anomaly"></span>
                              ANOMALY
                            </span>
                          )}
                          {e.overall_status === 'ATTACK_DETECTED' && (
                            <span className="font-mono text-[10px] text-status-threat flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-status-threat"></span>
                              ATTACK
                            </span>
                          )}
                        </td>

                        {/* Provenance: Synthetic vs Live */}
                        <td className="px-3.5 py-2 text-right whitespace-nowrap">
                          {e.is_simulated ? (
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-status-simulated-subtle text-status-simulated border border-status-simulated-border tracking-wider font-medium">
                              SYNTHETIC
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-accent-subtle text-accent border border-accent-border tracking-wider font-medium">
                              LIVE
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-text-muted text-xs">
              <Activity size={24} className="mb-2 text-text-dim" />
              <span>No events match the current filter selection ({filterType}).</span>
            </div>
          )}
        </div>

        {/* Event Detail Inspector Drawer (Appears when row is selected) */}
        {selectedEvent && (
          <div className="w-full lg:w-5/12 bg-surface border border-surface-border rounded shadow-panel flex flex-col overflow-y-auto">
            {/* Drawer Title Bar */}
            <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between bg-surface-subtle shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Flow Investigation
                </span>
                <span className="font-mono text-xs text-accent font-semibold">
                  #{selectedEvent.id}
                </span>
              </div>
              <button 
                onClick={() => setSelectedEventId(null)}
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-surface-border transition-colors cursor-pointer"
                title="Close inspector"
                aria-label="Close inspector"
              >
                <X size={14} />
              </button>
            </div>

            {/* Inspector Body */}
            <div className="p-4 space-y-4 text-xs overflow-y-auto">
              {/* Event Metadata Banner */}
              <div className="flex items-center justify-between font-mono text-[11px] text-text-muted pb-3 border-b border-surface-border">
                <span>Timestamp (UTC):</span>
                <span className="text-text-primary">{new Date(selectedEvent.timestamp).toUTCString()}</span>
              </div>

              {/* Model Decision Dissection */}
              <div className="rounded bg-surface-subtle border border-surface-border p-3 space-y-2.5">
                <div className="text-[10px] font-mono uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                  <Cpu size={12} className="text-text-secondary" />
                  Model Pipeline Evaluation
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-surface border border-surface-border/60">
                    <span className="text-text-muted block text-[10px] uppercase font-mono">Stage 1: RF Classifier</span>
                    <span className="font-mono font-semibold text-text-primary mt-0.5 block">
                      {selectedEvent.rf_prediction_class}
                    </span>
                    <span className="text-[10px] text-text-dim block mt-0.5">
                      Supervised Signature Tag
                    </span>
                  </div>

                  <div className="p-2 rounded bg-surface border border-surface-border/60">
                    <span className="text-text-muted block text-[10px] uppercase font-mono">Stage 2: IF Outlier</span>
                    <span className={`font-mono font-semibold mt-0.5 block ${selectedEvent.is_anomaly ? 'text-status-anomaly' : 'text-status-normal'}`}>
                      {selectedEvent.is_anomaly ? 'ANOMALOUS' : 'NORMAL PROFILE'}
                    </span>
                    <span className="text-[10px] text-text-dim block mt-0.5">
                      Score: {selectedEvent.anomaly_score.toFixed(4)} (Threshold: {selectedEvent.anomaly_threshold.toFixed(4)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-surface-border/40 text-[11px] font-mono">
                  <span className="text-text-muted">Synthesized Verdict:</span>
                  <span className="text-text-primary font-bold">
                    {selectedEvent.overall_status}
                  </span>
                </div>
              </div>

              {/* Six Extracted Features Section */}
              <div>
                <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Database size={12} className="text-text-muted" />
                  Extracted Flow Features (ml/feature_schema.py)
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <FeatureRow label="Total Packets" value={selectedEvent.total_packets.toLocaleString()} />
                  <FeatureRow label="Total Bytes" value={`${formatBytes(selectedEvent.total_bytes)} (${selectedEvent.total_bytes.toLocaleString()} B)`} />
                  <FeatureRow label="Duration" value={`${selectedEvent.duration_s.toFixed(4)}s (${selectedEvent.duration_us.toLocaleString()} µs)`} />
                  <FeatureRow label="Packet Velocity" value={`${selectedEvent.packets_per_sec.toFixed(2)} pps`} />
                  <FeatureRow label="Byte Throughput" value={`${selectedEvent.bytes_per_sec.toFixed(2)} B/s`} />
                  <FeatureRow label="Avg Packet Size" value={`${selectedEvent.avg_packet_size.toFixed(2)} bytes`} />
                </div>
              </div>

              {/* Provenance Footer */}
              <div className="pt-2 border-t border-surface-border text-[10px] text-text-muted leading-relaxed font-mono">
                Source Type: <span className="text-text-secondary">{selectedEvent.is_simulated ? 'SYNTHETIC_GENERATED' : 'LIVE_OBSERVED'}</span> · Persisted in SQLite <code className="text-text-dim">routesense.db</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FeatureRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-1.5 px-2.5 rounded bg-surface-subtle border border-surface-border/40">
    <span className="text-text-muted">{label}</span>
    <span className="text-text-primary font-medium tabular-nums">{value}</span>
  </div>
);

export default LiveDetection;
