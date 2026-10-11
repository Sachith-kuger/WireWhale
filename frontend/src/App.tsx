import { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Radio, 
  BarChart3, 
  Network, 
  Server, 
  RefreshCw,
  Play,
  Square,
  AlertTriangle,
  Cpu,
  ChevronDown
} from 'lucide-react';
import { fetchHealth, fetchEvents, simulateFlow } from './api/client';
import type { EventResponse } from './api/client';
import Overview from './pages/Overview';
import LiveDetection from './pages/LiveDetection';
import TrafficAnalysis from './pages/TrafficAnalysis';
import ThreatAnalysis from './pages/ThreatAnalysis';
import NetworkTopology from './pages/NetworkTopology';
import SystemStatus from './pages/SystemStatus';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isBackendUp, setIsBackendUp] = useState<boolean | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simInterval, setSimInterval] = useState(2000);
  const [simError, setSimError] = useState<string | null>(null);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const health = await fetchHealth();
      setIsBackendUp(health.status === 'up');
      setModelsLoaded(health.models_loaded);
      
      const eventData = await fetchEvents();
      setEvents(eventData);
      setLastRefreshed(new Date());
    } catch {
      setIsBackendUp(false);
      setModelsLoaded(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulation Loop with cancellation protection
  useEffect(() => {
    if (!isSimulating) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let isCancelled = false;
    
    const runSim = async () => {
      try {
        setSimError(null);
        // Generate sensible synthetic flow parameters
        const packets = Math.floor(Math.random() * 5000) + 10;
        const bytes = packets * (Math.floor(Math.random() * 1000) + 50);
        // duration between 10ms and 10s in microseconds
        const duration_us = Math.floor(Math.random() * 10_000_000) + 10_000;
        
        await simulateFlow(packets, bytes, duration_us);
        
        if (!isCancelled) {
          await loadData();
        }
      } catch (err: any) {
        if (!isCancelled) {
          setSimError(err.message || 'Simulation error');
          setIsSimulating(false);
        }
      }
      
      if (!isCancelled) {
        timeoutId = setTimeout(runSim, simInterval);
      }
    };

    timeoutId = setTimeout(runSim, simInterval);
    
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isSimulating, simInterval]);

  const navItems = [
    { 
      id: 'overview', 
      icon: Shield, 
      label: 'Overview', 
      desc: 'Network flow telemetry, model classifications, and recent event activity' 
    },
    { 
      id: 'live', 
      icon: Activity, 
      label: 'Live Detection', 
      desc: 'Real-time flow event stream' 
    },
    { 
      id: 'traffic', 
      icon: BarChart3, 
      label: 'Traffic Analysis', 
      desc: 'Throughput & rate telemetry' 
    },
    { 
      id: 'threat', 
      icon: Radio, 
      label: 'Threat Analysis', 
      desc: 'Dual-model correlation & scoring' 
    },
    { 
      id: 'topology', 
      icon: Network, 
      label: 'Network Topology', 
      desc: 'SDN simulated switch architecture' 
    },
    { 
      id: 'system', 
      icon: Server, 
      label: 'System Status', 
      desc: 'Engine readiness & API diagnostics' 
    },
  ];

  const currentNav = navItems.find(i => i.id === activeTab) || navItems[0];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview events={events} />;
      case 'live': return <LiveDetection events={events} isBackendUp={isBackendUp} />;
      case 'traffic': return <TrafficAnalysis events={events} />;
      case 'threat': return <ThreatAnalysis events={events} />;
      case 'topology': return <NetworkTopology />;
      case 'system': return <SystemStatus isBackendUp={isBackendUp} modelsLoaded={modelsLoaded} lastRefreshed={lastRefreshed} />;
      default: return <Overview events={events} />;
    }
  };

  return (
    <div className="flex h-screen bg-canvas text-text-primary font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-surface-border flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-surface border border-surface-border flex items-center justify-center text-accent">
              <Shield size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-text-primary flex items-center gap-1.5">
                RouteSense <span className="text-accent">AI</span>
              </div>
              <div className="text-[10px] font-mono tracking-wider text-text-muted uppercase">
                SDN NIDS Console
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-surface-border text-text-muted">
            v0.5
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-mono font-medium tracking-wider text-text-muted uppercase">
            Navigation
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-surface-active text-text-primary font-medium border border-surface-border-active shadow-panel'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/60'
                }`}
              >
                <Icon 
                  size={17} 
                  className={`transition-colors shrink-0 ${
                    isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <div className="truncate">
                  <div className="text-xs leading-none">{item.label}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Runtime Health */}
        <div className="p-3.5 border-t border-surface-border bg-surface-subtle">
          <div className="rounded p-2.5 bg-surface border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted flex items-center gap-1.5">
                <Cpu size={12} className="text-text-secondary" /> Inference Engine
              </span>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                modelsLoaded 
                  ? 'text-status-normal bg-status-normal-subtle border border-status-normal-border' 
                  : 'text-status-threat bg-status-threat-subtle border border-status-threat-border'
              }`}>
                {modelsLoaded ? 'RF + IF Active' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">Database</span>
              <span className="font-mono text-[10px] text-text-secondary">SQLite Store</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Bar */}
        <header className="h-16 px-6 bg-surface/90 backdrop-blur-sm border-b border-surface-border flex items-center justify-between shrink-0 z-10">
          {/* Page Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-text-primary leading-none">
                {currentNav.label}
              </h1>
              <p className="text-[11px] text-text-muted mt-1 leading-none truncate">
                {currentNav.desc}
              </p>
            </div>
          </div>

          {/* Right Control Group */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Simulation Controller */}
            <div className="flex items-center bg-surface-subtle rounded border border-surface-border p-1 gap-2">
              <span className="text-[11px] font-mono text-text-muted px-1.5 select-none font-medium">
                Simulation:
              </span>

              {/* Robust Dark Select with Chevron */}
              <div className="relative flex items-center">
                <select 
                  value={simInterval} 
                  onChange={e => setSimInterval(Number(e.target.value))}
                  disabled={isSimulating}
                  className="appearance-none bg-surface-elevated text-text-primary border border-surface-border text-xs rounded pl-2.5 pr-6 h-7 font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed hover:border-surface-border-active cursor-pointer transition-colors"
                  title="Simulation interval"
                  aria-label="Simulation cadence interval"
                >
                  <option value={1000} className="bg-[#222830] text-[#E0E5EB]">1.0s</option>
                  <option value={2000} className="bg-[#222830] text-[#E0E5EB]">2.0s</option>
                  <option value={5000} className="bg-[#222830] text-[#E0E5EB]">5.0s</option>
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2 text-text-muted" />
              </div>

              {isSimulating ? (
                <button 
                  onClick={() => setIsSimulating(false)}
                  className="h-7 px-3 rounded bg-status-threat-subtle text-status-threat border border-status-threat-border text-xs font-mono font-medium hover:bg-status-threat/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Stop simulation loop"
                >
                  <Square size={10} fill="currentColor" />
                  <span>Stop</span>
                </button>
              ) : (
                <button 
                  onClick={() => setIsSimulating(true)}
                  disabled={!isBackendUp}
                  className="h-7 px-3 rounded bg-accent-subtle text-accent border border-accent-border text-xs font-mono font-medium hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Start simulation loop"
                >
                  <Play size={10} fill="currentColor" />
                  <span>Start</span>
                </button>
              )}
            </div>

            {simError && (
              <div className="flex items-center gap-1.5 text-xs text-status-threat bg-status-threat-subtle border border-status-threat-border px-2.5 h-7 rounded">
                <AlertTriangle size={12} />
                <span className="truncate max-w-[140px] font-mono text-[11px]">{simError}</span>
              </div>
            )}

            {/* Backend Connectivity Status */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 h-7 rounded bg-surface border border-surface-border text-xs">
              <span className="text-text-muted text-[11px]">Backend:</span>
              {isBackendUp === null ? (
                <span className="text-status-anomaly text-[11px] font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-anomaly animate-pulse"></span>
                  Checking
                </span>
              ) : isBackendUp ? (
                <span className="text-status-normal text-[11px] font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-normal"></span>
                  Connected
                </span>
              ) : (
                <span className="text-status-threat text-[11px] font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-threat"></span>
                  Offline
                </span>
              )}
            </div>

            {/* Last Refreshed & Refresh Action */}
            <div className="flex items-center gap-1.5 pl-0.5">
              {lastRefreshed && (
                <span className="hidden md:inline font-mono text-[11px] text-text-muted tabular-nums">
                  {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
              <button 
                onClick={loadData}
                disabled={isRefreshing}
                className="h-7 w-7 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-surface-border transition-colors cursor-pointer"
                title="Manual data refresh"
                aria-label="Refresh data"
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-accent' : ''} />
              </button>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 bg-canvas">
          <div className="max-w-[1440px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
