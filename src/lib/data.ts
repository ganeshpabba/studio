import { type Alert, type Stats, type Config } from '@/lib/types';

const now = new Date();

export const mockAlerts: Alert[] = [
  {
    id: 1,
    person_id: 3,
    behaviour_type: 'fall',
    confidence: 0.95,
    timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
    camera_id: 'cam-01',
    snapshot_path: 'https://images.unsplash.com/photo-1605548587049-8bda5bfdbbf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxwZXJzb24lMjBmYWxsaW5nfGVufDB8fHx8MTc2Mjg2NjY4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    person_id: 1,
    behaviour_type: 'loitering',
    confidence: 0.82,
    timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    camera_id: 'cam-02',
    snapshot_path: 'https://images.unsplash.com/photo-1666342873508-453f4b7883b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBzdGFuZGluZ3xlbnwwfHx8fDE3NjI4NDQ5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    person_id: 5,
    behaviour_type: 'lying_motionless',
    confidence: 0.99,
    timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    camera_id: 'cam-01',
    snapshot_path: 'https://images.unsplash.com/photo-1605548587049-8bda5bfdbbf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxwZXJzb24lMjBmYWxsaW5nfGVufDB8fHx8MTc2Mjg2NjY4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 4,
    person_id: 2,
    behaviour_type: 'loitering',
    confidence: 0.78,
    timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    camera_id: 'cam-03',
    snapshot_path: 'https://images.unsplash.com/photo-1666342873508-453f4b7883b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBzdGFuZGluZ3xlbnwwfHx8fDE3NjI4NDQ5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 5,
    person_id: 8,
    behaviour_type: 'fall',
    confidence: 0.91,
    timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    camera_id: 'cam-01',
    snapshot_path: 'https://images.unsplash.com/photo-1605548587049-8bda5bfdbbf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxwZXJzb24lMjBmYWxsaW5nfGVufDB8fHx8MTc2Mjg2NjY4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export const mockStats: Stats = {
  total_alerts: 125,
  alerts_today: 5,
  active_cameras: 3,
  average_confidence: 0.89,
  behaviors_detected: {
    fall: 2,
    lying_motionless: 1,
    loitering: 2,
  },
  alerts_per_hour: [
    { hour: '00:00', count: 0 },
    { hour: '01:00', count: 0 },
    { hour: '02:00', count: 1 },
    { hour: '03:00', count: 0 },
    { hour: '04:00', count: 0 },
    { hour: '05:00', count: 1 },
    { hour: '06:00', count: 0 },
    { hour: '07:00', count: 0 },
    { hour: '08:00', count: 0 },
    { hour: '09:00', count: 2 },
    { hour: '10:00', count: 1 },
    { hour: '11:00', count: 0 },
  ].slice(0, now.getHours() + 1),
};

export const mockConfig: Config = {
  detection: {
    confidence: 0.5,
  },
  behavior: {
    fall: { enabled: true, velocity_threshold: 0.8 },
    lying: { enabled: true, seconds: 3.0 },
    loitering: { enabled: false, seconds: 30.0 },
  },
  camera: {
    source: '0',
    fps: 30,
  },
};
