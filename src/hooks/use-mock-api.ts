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
      const newAlert: Alert = {
        id: Math.max(...alerts.map(a => a.id), 0) + 1,
        person_id: Math.floor(Math.random() * 10) + 1,
        behaviour_type: ['fall', 'lying_motionless', 'loitering'][Math.floor(Math.random() * 3)] as 'fall' | 'lying_motionless' | 'loitering',
        confidence: Math.random() * 0.2 + 0.8,
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
        return {
          ...prev,
          total_alerts: prev.total_alerts + 1,
          alerts_today: prev.alerts_today + 1,
          behaviors_detected: newBehaviors,
        };
      });

      toast({
        variant: "default",
        title: `🚨 ALERT: ${newAlert.behaviour_type.replace(/_/g, ' ').toUpperCase()}`,
        description: `Person ${newAlert.person_id} detected on ${newAlert.camera_id}. Confidence: ${(newAlert.confidence * 100).toFixed(0)}%`,
        className: 'bg-destructive text-destructive-foreground border-destructive'
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [alerts, toast])

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
    setAlerts(mockAlerts.map(a => ({...a, id: Math.random() * 1000}))); // new IDs to avoid key issues
    toast({ title: "Alerts refreshed" })
  }, [toast]);
  
  const refreshStats = useCallback(() => {
    setStats(mockStats);
    toast({ title: "Statistics refreshed" })
  }, [toast]);

  return { alerts, stats, config, deleteAlert, deleteAllAlerts, updateConfig, refreshAlerts, refreshStats }
}
