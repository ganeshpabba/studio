"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { type Alert, type Stats, type Config, type BehaviorStats } from '@/lib/types'
import { mockAlerts, mockStats, mockConfig } from '@/lib/data'

export function useMockApi() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [stats, setStats] = useState<Stats>(mockStats)
  const [config, setConfig] = useState<Config>(mockConfig)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate receiving a new alert via WebSocket every 15 seconds
    const interval = setInterval(() => {
      const possibleBehaviors: Array<'fall' | 'lying_motionless' | 'loitering'> = [];
      if (config.behavior.fall.enabled) possibleBehaviors.push('fall');
      if (config.behavior.lying.enabled) possibleBehaviors.push('lying_motionless');
      if (config.behavior.loitering.enabled) possibleBehaviors.push('loitering');

      if (possibleBehaviors.length === 0) return;

      const behavior = possibleBehaviors[Math.floor(Math.random() * possibleBehaviors.length)];
      
      const randomConfidence = Math.random();
      if(randomConfidence < config.detection.confidence) return;


      const newAlert: Alert = {
        id: Math.max(...alerts.map(a => a.id), 0) + 1,
        person_id: Math.floor(Math.random() * 10) + 1,
        behaviour_type: behavior,
        confidence: randomConfidence * (1 - config.detection.confidence) + config.detection.confidence,
        timestamp: new Date().toISOString(),
        camera_id: `cam-0${Math.floor(Math.random() * 3) + 1}`,
        snapshot_path: `https://picsum.photos/seed/snap${Date.now()}/640/480`,
      }

      setAlerts(prev => [newAlert, ...prev])
      
      setStats(prev => {
        const newBehaviors: BehaviorStats = {
          ...prev.behaviors_detected,
          [newAlert.behaviour_type]: (prev.behaviors_detected[newAlert.behaviour_type] || 0) + 1,
        };
        const newTotalAlerts = prev.total_alerts + 1;
        const newAverageConfidence = ((prev.average_confidence * prev.total_alerts) + newAlert.confidence) / newTotalAlerts;

        return {
          ...prev,
          total_alerts: newTotalAlerts,
          alerts_today: prev.alerts_today + 1,
          behaviors_detected: newBehaviors,
          average_confidence: newAverageConfidence
        };
      });

      toast({
        title: `🚨 ALERT: ${newAlert.behaviour_type.replace(/_/g, ' ').toUpperCase()}`,
        description: `Person ${newAlert.person_id} detected on ${newAlert.camera_id}.`,
        variant: "destructive",
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [alerts, config, toast])

  const deleteAlert = useCallback((alertId: number) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
    // In a real app, stats would also be updated from the backend
  }, [])
  
  const deleteAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const updateConfig = useCallback((newConfig: Config) => {
    setConfig(newConfig);
    toast({
      title: "Configuration Updated",
      description: "Your changes have been saved successfully.",
    })
  }, [toast]);
  
  const refreshAlerts = useCallback(() => {
    // Simulate refetching
    const newMockAlerts = mockAlerts.map(a => ({...a, id: Math.random() * 1000, timestamp: new Date().toISOString()}));
    setAlerts(newMockAlerts);
    setStats(mockStats);
    toast({ title: "Alerts and stats refreshed" })
  }, [toast]);
  
  const refreshStats = useCallback(() => {
    setStats(mockStats);
    toast({ title: "Statistics refreshed" })
  }, [toast]);

  return { alerts, stats, config, deleteAlert, deleteAllAlerts, updateConfig, refreshAlerts, refreshStats }
}
