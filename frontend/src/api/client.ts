export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export interface HealthResponse {
  status: string;
  models_loaded: boolean;
}

export interface Features {
  total_packets: number;
  total_bytes: number;
  duration_s: number;
  packets_per_sec: number;
  bytes_per_sec: number;
  avg_packet_size: number;
}

export interface EventResponse {
  id: number;
  timestamp: string;
  total_packets: number;
  total_bytes: number;
  duration_us: number;
  duration_s: number;
  packets_per_sec: number;
  bytes_per_sec: number;
  avg_packet_size: number;
  rf_prediction_class: string;
  anomaly_score: number;
  anomaly_threshold: number;
  is_anomaly: boolean;
  overall_status: string;
  is_simulated: boolean;
}

export const fetchHealth = async (): Promise<HealthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
};

export const fetchEvents = async (): Promise<EventResponse[]> => {
  const res = await fetch(`${API_BASE_URL}/api/events?limit=100`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
};

export const simulateFlow = async (total_packets: number, total_bytes: number, duration_us: number) => {
  const res = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ total_packets, total_bytes, duration_us, is_simulated: true })
  });
  if (!res.ok) throw new Error('Simulation request failed');
  return res.json();
};
