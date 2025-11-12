export type Alert = {
  id: number;
  person_id: number;
  behaviour_type: 'fall' | 'lying_motionless' | 'loitering';
  confidence: number;
  timestamp: string;
  camera_id: string;
  snapshot_path: string;
  metadata?: Record<string, any>;
};

export type BehaviorStats = {
  fall: number;
  lying_motionless: number;
  loitering: number;
};

export type Stats = {
  total_alerts: number;
  alerts_today: number;
  active_cameras: number;
  average_confidence: number;
  behaviors_detected: BehaviorStats;
  alerts_per_hour: { hour: string; count: number }[];
};

export type Config = {
  detection: {
    confidence: number;
  };
  behavior: {
    fall: { enabled: boolean; velocity_threshold: number };
    lying: { enabled: boolean; seconds: number };
    loitering: { enabled: boolean; seconds: number };
  };
  camera: {
    source: string;
    fps: number;
  };
};
