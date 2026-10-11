import React from 'react';
import type { EventResponse } from '../api/client';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { BarChart2, Info, Activity, Database, AlertCircle } from 'lucide-react';

interface Props {
  events: EventResponse[];
}

const TrafficAnalysis: React.FC<Props> = ({ events }) => {
  // Chronological order for time series (last 30 events)
  const chartData = [...events].reverse().slice(-30).map(e => ({
    time: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    pps: Math.round(e.packets_per_sec),
    bps: Math.round(e.bytes_per_sec),
    rawBytes: e.total_bytes,
    rawPackets: e.total_packets,
  }));

  const benignCount = events.filter(e => e.rf_prediction_class === 'BENIGN').length;
  const suspiciousCount = events.length - benignCount;

  const avgPPS = events.length > 0 
    ? Math.round(events.reduce((acc, curr) => acc + curr.packets_per_sec, 0) / events.length) 
    : 0;

  const avgBPS = events.length > 0 
    ? Math.round(events.reduce((acc, curr) => acc + curr.bytes_per_sec, 0) / events.length) 
    : 0;

  const formatBps = (val: number) => {
    if (val >= 1048576) return `${(val / 1048576).toFixed(1)} MB/s`;
    if (val >= 1024) return `${(val / 1024).toFixed(1)} KB/s`;
    return `${val} B/s`;
  };

  return (
    <div className="space-y-5">
      {/* Scope Disclaimer Banner */}
      <div className="bg-surface border border-surface-border rounded p-3.5 flex items-start gap-3 shadow-panel">
        <Info size={16} className="text-accent shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold text-text-primary">Observation Scope Note:</span>{' '}
          <span className="text-text-muted">
            The telemetry graphs below illustrate flow-rate parameters derived strictly from records passed through the ML inference pipeline (<code className="text-text-secondary font-mono">POST /api/predict</code>). They do not represent a wiretap of all ambient network packets on a live interface.
          </span>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Packets per Second (PPS) Chart */}
        <div className="bg-surface border border-surface-border rounded p-5 shadow-panel flex flex-col">
          <div className="flex items-center justify-between pb-3.5 border-b border-surface-border">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                Packet Velocity (Packets / Second)
              </h2>
              <p className="text-[11px] text-text-muted mt-0.5">
                Calculated as (total_packets / duration_s) per flow record
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-text-muted block">MEAN RATE</span>
              <span className="text-xs font-semibold text-accent">{avgPPS.toLocaleString()} pps</span>
            </div>
          </div>

          <div className="pt-4 flex-1 min-h-[260px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                    formatter={(val: any) => [`${Number(val).toLocaleString()} pps`, 'Rate']}
                    labelStyle={{ color: '#A2ABB7' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pps" 
                    stroke="#78AFA9" 
                    strokeWidth={1.75} 
                    dot={false}
                    activeDot={{ r: 4, stroke: '#78AFA9', strokeWidth: 2, fill: '#171B20' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No packet rate measurements logged." />
            )}
          </div>
        </div>

        {/* Bytes per Second (BPS) Chart */}
        <div className="bg-surface border border-surface-border rounded p-5 shadow-panel flex flex-col">
          <div className="flex items-center justify-between pb-3.5 border-b border-surface-border">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                Bandwidth Throughput (Bytes / Second)
              </h2>
              <p className="text-[11px] text-text-muted mt-0.5">
                Calculated as (total_bytes / duration_s) per flow record
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-text-muted block">MEAN BANDWIDTH</span>
              <span className="text-xs font-semibold text-accent-secondary">{formatBps(avgBPS)}</span>
            </div>
          </div>

          <div className="pt-4 flex-1 min-h-[260px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
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
                    tickFormatter={formatBps}
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
                    formatter={(val: any) => [formatBps(Number(val)), 'Throughput']}
                    labelStyle={{ color: '#A2ABB7' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bps" 
                    stroke="#6F9EBA" 
                    strokeWidth={1.75} 
                    dot={false}
                    activeDot={{ r: 4, stroke: '#6F9EBA', strokeWidth: 2, fill: '#171B20' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No throughput measurements logged." />
            )}
          </div>
        </div>
      </div>

      {/* Flow Classification Distribution & Proposed Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-surface border border-surface-border rounded p-4 shadow-panel flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-text-muted">Benign Records</div>
            <div className="text-xl font-bold font-mono text-status-normal mt-1 tabular-nums">
              {benignCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              Normal operating baseline
            </div>
          </div>
          <div className="p-2 rounded bg-status-normal-subtle border border-status-normal-border text-status-normal">
            <Activity size={18} />
          </div>
        </div>

        <div className="bg-surface border border-surface-border rounded p-4 shadow-panel flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-text-muted">Signature Hits</div>
            <div className="text-xl font-bold font-mono text-status-threat mt-1 tabular-nums">
              {suspiciousCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              Random Forest attack flags
            </div>
          </div>
          <div className="p-2 rounded bg-status-threat-subtle border border-status-threat-border text-status-threat">
            <AlertCircle size={18} />
          </div>
        </div>

        <div className="bg-surface border border-surface-border rounded p-4 shadow-panel flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-text-muted">Feature Pipeline</div>
            <div className="text-xs font-mono font-semibold text-text-primary mt-1">
              6 Extracted Metrics
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              Calculated on-the-fly per flow
            </div>
          </div>
          <div className="p-2 rounded bg-surface-subtle border border-surface-border text-text-secondary">
            <Database size={18} />
          </div>
        </div>
      </div>

      {/* Minimal API Extension Specification */}
      <div className="bg-surface-subtle border border-surface-border rounded p-4 text-xs space-y-2">
        <div className="font-semibold text-text-primary text-[11px] uppercase tracking-wider flex items-center gap-2">
          <span>Architecture Note: Proposed Phase 2 API Extension</span>
        </div>
        <p className="text-text-muted leading-relaxed text-[11px]">
          To support unbroken time-series telemetry without requiring every packet to trigger an inference request, the backend should expose a streaming metrics endpoint such as <code className="text-accent font-mono">GET /api/metrics/traffic?window=5m</code> backed by sliding-window counters gathered directly from the OpenFlow switch statistics collector.
        </p>
      </div>
    </div>
  );
};

const EmptyChart = ({ message }: { message: string }) => (
  <div className="h-[260px] flex flex-col items-center justify-center text-text-muted border border-dashed border-surface-border rounded text-xs">
    <BarChart2 size={24} className="mb-2 text-text-dim" />
    <span>{message}</span>
  </div>
);

export default TrafficAnalysis;
