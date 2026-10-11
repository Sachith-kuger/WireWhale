import React from 'react';
import type { EventResponse } from '../api/client';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { Radio } from 'lucide-react';

interface Props {
  events: EventResponse[];
}

const ThreatAnalysis: React.FC<Props> = ({ events }) => {
  // Map events for scatter chart (max last 50 events)
  const chartData = events.slice(0, 50).map((e, index) => ({
    id: e.id,
    timeIndex: events.length - index, // Chronological x-axis
    anomalyScore: Number(e.anomaly_score.toFixed(4)),
    rfClass: e.rf_prediction_class,
    isAnomaly: e.is_anomaly,
    threshold: Number(e.anomaly_threshold.toFixed(4)),
    timeStr: new Date(e.timestamp).toLocaleTimeString()
  }));

  const threshold = events.length > 0 ? Number(events[0].anomaly_threshold.toFixed(4)) : 0.6868;

  // Correlation metrics
  const bothAgreeThreat = events.filter(e => e.rf_prediction_class !== 'BENIGN' && e.is_anomaly).length;
  const bothAgreeNormal = events.filter(e => e.rf_prediction_class === 'BENIGN' && !e.is_anomaly).length;
  const anomalyOnly = events.filter(e => e.rf_prediction_class === 'BENIGN' && e.is_anomaly).length;
  const attackOnly = events.filter(e => e.rf_prediction_class !== 'BENIGN' && !e.is_anomaly).length;

  return (
    <div className="space-y-5">
      {/* Concept Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-surface-border rounded p-4 shadow-panel">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary mb-1">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            Stage 1: Random Forest Classifier
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Supervised multi-class decision trees trained on known signature patterns from CICIDS2017. Categorizes flows into discrete classes (e.g., <code className="text-text-secondary font-mono">BENIGN</code>, <code className="text-status-threat font-mono">DDoS</code>, <code className="text-status-threat font-mono">PortScan</code>).
          </p>
        </div>

        <div className="bg-surface border border-surface-border rounded p-4 shadow-panel">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary mb-1">
            <span className="w-2 h-2 rounded-full bg-status-anomaly"></span>
            Stage 2: Isolation Forest Anomaly Scorer
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Unsupervised tree ensemble scoring structural distance from expected baseline traffic. A score exceeding the trained threshold (<code className="text-status-anomaly font-mono">{threshold}</code>) indicates an unusual profile, regardless of whether a signature matches.
          </p>
        </div>
      </div>

      {/* Isolation Forest Scoring Scatter Plot */}
      <div className="bg-surface border border-surface-border rounded p-5 shadow-panel flex flex-col">
        <div className="flex items-center justify-between pb-3.5 border-b border-surface-border">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Isolation Forest Anomaly Distribution
            </h2>
            <p className="text-[11px] text-text-muted mt-0.5">
              Flow score vs calibrated cutoff threshold ({threshold}). Points above the line trigger anomaly flags.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-text-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-normal"></span>
              <span>Normal (&le; {threshold})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-anomaly"></span>
              <span>Anomalous (&gt; {threshold})</span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex-1 min-h-[260px]">
          {events.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 15, right: 15, bottom: 5, left: -10 }}>
                <CartesianGrid stroke="#2D3540" strokeDasharray="2 2" />
                <XAxis 
                  dataKey="timeIndex" 
                  type="number" 
                  name="Event Sequence" 
                  stroke="#39414B"
                  tick={{ fill: '#7F8996', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: '#2D3540' }}
                />
                <YAxis 
                  dataKey="anomalyScore" 
                  type="number" 
                  name="Anomaly Score" 
                  stroke="#39414B"
                  domain={[0.4, 0.9]}
                  tick={{ fill: '#7F8996', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: '#2D3540' }}
                />
                <Tooltip 
                  cursor={{ stroke: '#39414B', strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload || !payload[0]) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-surface border border-surface-border p-2.5 rounded shadow-xl text-xs font-mono space-y-1">
                        <div className="text-text-primary font-semibold">Event #{data.id}</div>
                        <div className="text-text-muted">Time: {data.timeStr}</div>
                        <div className="text-text-secondary">RF Class: {data.rfClass}</div>
                        <div className="text-accent">Score: {data.anomalyScore}</div>
                        <div className={data.isAnomaly ? "text-status-anomaly font-bold" : "text-status-normal"}>
                          Status: {data.isAnomaly ? 'ANOMALOUS' : 'NORMAL'}
                        </div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine 
                  y={threshold} 
                  stroke="#C4A36A" 
                  strokeDasharray="4 4" 
                  label={{ 
                    position: 'top', 
                    value: `Threshold: ${threshold}`, 
                    fill: '#C4A36A', 
                    fontSize: 10,
                    fontFamily: 'monospace'
                  }} 
                />
                <Scatter data={chartData} animationDuration={300}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isAnomaly ? '#C4A36A' : '#7FA68A'} 
                      stroke={entry.isAnomaly ? '#9E814E' : '#688F73'}
                      strokeWidth={1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex flex-col items-center justify-center text-text-muted border border-dashed border-surface-border rounded text-xs">
              <Radio size={24} className="mb-2 text-text-dim" />
              No inference data available to plot.
            </div>
          )}
        </div>
      </div>

      {/* Model Agreement & Disagreement Matrix */}
      <div className="bg-surface border border-surface-border rounded shadow-panel overflow-hidden">
        <div className="px-5 py-3.5 border-b border-surface-border flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Multi-Model Correlation Matrix
            </h2>
            <p className="text-[11px] text-text-muted mt-0.5">
              Comparison between Random Forest signature recognition and Isolation Forest outlier scoring
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-status-normal">{bothAgreeNormal} Concordant Normal</span>
            <span className="text-text-muted">·</span>
            <span className="text-status-threat">{bothAgreeThreat} Concordant Threat</span>
            <span className="text-text-muted">·</span>
            <span className="text-status-anomaly">{anomalyOnly + attackOnly} Discordant</span>
          </div>
        </div>

        {events.length > 0 ? (
          <div className="overflow-x-auto max-h-[360px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-subtle sticky top-0 border-b border-surface-border text-text-muted font-mono uppercase text-[10px] z-10">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Event ID</th>
                  <th className="px-4 py-2.5 font-medium">Stage 1: RF Prediction</th>
                  <th className="px-4 py-2.5 font-medium">Stage 2: IF Score</th>
                  <th className="px-4 py-2.5 font-medium">Model Correlation State</th>
                  <th className="px-4 py-2.5 font-medium text-right">Analyst Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {events.slice(0, 30).map(e => {
                  const rfAttack = e.rf_prediction_class !== 'BENIGN';
                  const ifAnomaly = e.is_anomaly;

                  let correlationLabel = 'Concordant Normal';
                  let correlationBadge = 'text-status-normal bg-status-normal-subtle border-status-normal-border';
                  let interpretation = 'Standard benign operating profile';

                  if (rfAttack && ifAnomaly) {
                    correlationLabel = 'Concordant Threat';
                    correlationBadge = 'text-status-threat bg-status-threat-subtle border-status-threat-border';
                    interpretation = 'Both models confirm known attack profile';
                  } else if (!rfAttack && ifAnomaly) {
                    correlationLabel = 'Novel Anomaly';
                    correlationBadge = 'text-status-anomaly bg-status-anomaly-subtle border-status-anomaly-border';
                    interpretation = 'Unusual flow volume without matching signature';
                  } else if (rfAttack && !ifAnomaly) {
                    correlationLabel = 'Signature Alert (Normal Vol)';
                    correlationBadge = 'text-status-threat bg-status-threat-subtle border-status-threat-border';
                    interpretation = 'Signature matched, but metrics fit within baseline density';
                  }

                  return (
                    <tr key={e.id} className="hover:bg-surface-hover/70 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-text-muted text-[11px]">
                        #{e.id}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded border ${
                          e.rf_prediction_class === 'BENIGN'
                            ? 'text-status-normal bg-status-normal-subtle border-status-normal-border'
                            : 'text-status-threat bg-status-threat-subtle border-status-threat-border'
                        }`}>
                          {e.rf_prediction_class}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] tabular-nums whitespace-nowrap">
                        <span className={ifAnomaly ? 'text-status-anomaly font-medium' : 'text-text-muted'}>
                          {e.anomaly_score.toFixed(4)}
                        </span>{' '}
                        <span className="text-[10px] text-text-dim">(&gt; {threshold})</span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${correlationBadge}`}>
                          {correlationLabel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-[11px] text-text-secondary whitespace-nowrap">
                        {interpretation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-text-muted text-xs">
            No events available for cross-model correlation.
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreatAnalysis;
