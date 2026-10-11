import React from 'react';
import { API_BASE_URL } from '../api/client';
import { 
  Server, 
  Database, 
  Cpu, 
  ShieldAlert
} from 'lucide-react';

interface Props {
  isBackendUp: boolean | null;
  modelsLoaded: boolean;
  lastRefreshed: Date | null;
}

const SystemStatus: React.FC<Props> = ({ isBackendUp, modelsLoaded, lastRefreshed }) => {
  return (
    <div className="space-y-5">
      {/* Primary Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend API Service */}
        <div className="bg-surface border border-surface-border rounded p-5 shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-surface-subtle text-accent border border-surface-border">
                  <Server size={16} />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  FastAPI Backend
                </h3>
              </div>
              <StatusIndicator active={isBackendUp === true} pending={isBackendUp === null} />
            </div>

            <div className="mt-3.5 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-surface-border/50">
                <span className="text-text-muted">Host Binding</span>
                <span className="text-text-primary truncate max-w-[150px]">{API_BASE_URL}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border/50">
                <span className="text-text-muted">Health Probe</span>
                <span className="text-text-secondary">GET /api/health</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">CORS Policy</span>
                <span className="text-status-normal">Active (All Origins)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-surface-border text-[10px] text-text-muted flex items-center justify-between font-mono">
            <span>Last Sync Probe:</span>
            <span className="text-text-secondary">
              {lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Pending'}
            </span>
          </div>
        </div>

        {/* Machine Learning Models */}
        <div className="bg-surface border border-surface-border rounded p-5 shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-surface-subtle text-status-anomaly border border-surface-border">
                  <Cpu size={16} />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Inference Pipeline
                </h3>
              </div>
              <StatusIndicator active={modelsLoaded} />
            </div>

            <div className="mt-3.5 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-surface-border/50">
                <span className="text-text-muted">Stage 1 Classifier</span>
                <span className="text-text-primary">random_forest_v1.joblib</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border/50">
                <span className="text-text-muted">Stage 2 Detector</span>
                <span className="text-text-primary">isolation_forest_v1.joblib</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Anomaly Cutoff</span>
                <span className="text-text-secondary">threshold = 0.6868</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-surface-border text-[10px] text-text-muted flex items-center justify-between font-mono">
            <span>Model Loading:</span>
            <span className={modelsLoaded ? "text-status-normal" : "text-status-threat"}>
              {modelsLoaded ? 'Loaded in RAM (Startup)' : 'Artifacts Missing'}
            </span>
          </div>
        </div>

        {/* SQLite Database Store */}
        <div className="bg-surface border border-surface-border rounded p-5 shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-surface-subtle text-status-normal border border-surface-border">
                  <Database size={16} />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Event Persistence
                </h3>
              </div>
              <StatusIndicator active={isBackendUp === true} pending={isBackendUp === null} />
            </div>

            <div className="mt-3.5 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-surface-border/50">
                <span className="text-text-muted">Storage Engine</span>
                <span className="text-text-primary">SQLite 3</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border/50">
                <span className="text-text-muted">Database File</span>
                <span className="text-text-secondary">routesense.db</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Access Interface</span>
                <span className="text-text-secondary">REST API (Read/Write)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-surface-border text-[10px] text-text-muted flex items-center justify-between font-mono">
            <span>Simulation Flag:</span>
            <span className="text-status-simulated">is_simulated column active</span>
          </div>
        </div>
      </div>

      {/* Diagnostics / Troubleshooting Panel */}
      {isBackendUp === false && (
        <div className="bg-surface border border-status-threat-border rounded p-5 shadow-panel">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-status-threat-subtle text-status-threat shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-status-threat uppercase tracking-wider">
                Backend Connection Failure Diagnostic
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                The frontend web application is failing to connect to the FastAPI REST API at <code className="text-text-primary font-mono">{API_BASE_URL}</code>. In Phase 1, the backend runs as a local Python process.
              </p>
              <div className="rounded bg-surface-subtle border border-surface-border p-3 font-mono text-[11px] text-text-secondary space-y-1">
                <div className="text-text-muted"># To restore backend service:</div>
                <div className="text-accent">cd /Users/rohithatmakuri/Documents/PROJECTS/Routesense</div>
                <div className="text-accent">source backend/.venv/bin/activate</div>
                <div className="text-accent">python -m uvicorn backend.main:app --reload --port 8000</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Architecture Environment Inventory */}
      <div className="bg-surface border border-surface-border rounded p-5 shadow-panel">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary pb-3 border-b border-surface-border mb-3.5">
          Runtime Architecture & Technical Environment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-surface-subtle p-3 rounded border border-surface-border">
            <span className="text-text-muted text-[10px] block uppercase">Frontend UI</span>
            <span className="text-text-primary font-semibold mt-1 block">React 19 + TypeScript</span>
            <span className="text-[10px] text-text-muted">Vite Build Tooling</span>
          </div>
          <div className="bg-surface-subtle p-3 rounded border border-surface-border">
            <span className="text-text-muted text-[10px] block uppercase">REST API</span>
            <span className="text-text-primary font-semibold mt-1 block">FastAPI + Uvicorn</span>
            <span className="text-[10px] text-text-muted">Python 3.14 Environment</span>
          </div>
          <div className="bg-surface-subtle p-3 rounded border border-surface-border">
            <span className="text-text-muted text-[10px] block uppercase">ML Framework</span>
            <span className="text-text-primary font-semibold mt-1 block">scikit-learn 1.9.1</span>
            <span className="text-[10px] text-text-muted">pandas + numpy + joblib</span>
          </div>
          <div className="bg-surface-subtle p-3 rounded border border-surface-border">
            <span className="text-text-muted text-[10px] block uppercase">Schema Baseline</span>
            <span className="text-text-primary font-semibold mt-1 block">CICIDS2017 Mapping</span>
            <span className="text-[10px] text-text-muted">6 Flow Velocity Features</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusIndicator = ({ active, pending }: { active: boolean; pending?: boolean }) => {
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] text-status-anomaly bg-status-anomaly-subtle border border-status-anomaly-border">
        <span className="w-1.5 h-1.5 rounded-full bg-status-anomaly animate-pulse"></span>
        PROBING
      </span>
    );
  }
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] text-status-normal bg-status-normal-subtle border border-status-normal-border">
        <span className="w-1.5 h-1.5 rounded-full bg-status-normal"></span>
        HEALTHY
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] text-status-threat bg-status-threat-subtle border border-status-threat-border">
      <span className="w-1.5 h-1.5 rounded-full bg-status-threat"></span>
      UNAVAILABLE
    </span>
  );
};

export default SystemStatus;
