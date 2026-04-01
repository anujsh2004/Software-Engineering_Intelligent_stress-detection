"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export type MetricData = {
  timestamp: string;
  hrv: number;
  eda: number;
};

export type AlertEvent = {
  id: string;
  timestamp: string;
  message: string;
  recommendation: string;
  stressLevel?: string;
  metrics: { hrv: number; eda: number };
};

export type SimulationMode = 'normal' | 'abnormal';

const MAX_HISTORY = 20;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export function useWearable(authToken?: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [dataHistory, setDataHistory] = useState<MetricData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<{ hrv: number; eda: number }>({ hrv: 70, eda: 3 });
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [newAlert, setNewAlert] = useState<AlertEvent | null>(null);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('normal');

  // Fetch notifications from database on mount
  const fetchNotifications = useCallback(async () => {
    if (!authToken) return;
    
    setIsLoadingAlerts(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const mappedAlerts: AlertEvent[] = data.data.map((n: any) => ({
            id: n._id,
            timestamp: new Date(n.timestamp).toLocaleTimeString(),
            message: n.message,
            recommendation: n.recommendation,
            stressLevel: n.stressLevel,
            metrics: n.metrics || { hrv: 0, eda: 0 }
          }));
          setAlerts(mappedAlerts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoadingAlerts(false);
    }
  }, [authToken]);

  // Load alerts from DB when token is available
  useEffect(() => {
    if (authToken) {
      fetchNotifications();
    }
  }, [authToken, fetchNotifications]);

  // Save notification to database
  const saveNotificationToDB = useCallback(async (alert: AlertEvent, stressLevel: string) => {
    if (!authToken) return;
    
    try {
      await fetch(`${BACKEND_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: alert.message,
          recommendation: alert.recommendation,
          stressLevel: stressLevel,
          metrics: alert.metrics
        })
      });
    } catch (err) {
      console.error("Failed to save notification:", err);
    }
  }, [authToken]);

  // Connect effect
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsConnected(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Separate effect for stress detection to access fresh state
  const lastAlertTimeRef = useRef(0);
  const simulationModeRef = useRef<SimulationMode>(simulationMode);
  
  // Keep ref in sync with state
  useEffect(() => {
    simulationModeRef.current = simulationMode;
  }, [simulationMode]);
  
  // Data simulation effect
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const currentSimMode = simulationModeRef.current;
      let newHrv: number, newEda: number;

      if (currentSimMode === 'abnormal') {
        // Abnormal/Stress mode: Low HRV (25-40ms), High EDA (9-12µS)
        // These values simulate high physiological stress
        newHrv = 25 + Math.random() * 15;  // 25-40ms (very low HRV = stress)
        newEda = 9 + Math.random() * 3;    // 9-12µS (very high EDA = stress)
      } else {
        // Normal mode: Healthy HRV (60-95ms), Normal EDA (1-4µS)
        newHrv = 60 + Math.random() * 35;  // 60-95ms (healthy HRV)
        newEda = 1 + Math.random() * 3;    // 1-4µS (relaxed EDA)
      }
      
      newHrv = Math.max(20, Math.min(100, newHrv));
      newEda = Math.max(1, Math.min(15, newEda));

      const newDataPoint = {
        timestamp: timeString,
        hrv: Math.round(newHrv),
        eda: Number(newEda.toFixed(1)),
      };

      setCurrentMetrics({ hrv: newDataPoint.hrv, eda: newDataPoint.eda });

      setDataHistory(prev => {
        const newHistory = [...prev, newDataPoint];
        if (newHistory.length > MAX_HISTORY) return newHistory.slice(newHistory.length - MAX_HISTORY);
        return newHistory;
      });

      // Calculate heart rate from HRV (lower HRV = higher heart rate during stress)
      const simulatedHeartRate = Math.round(140 - (newDataPoint.hrv * 0.6));
      
      const currentTime = Date.now();
      if (currentTime - lastAlertTimeRef.current > 5000) {

          console.log("[ML Server Request] Sending:", { 
            heartRate: simulatedHeartRate, 
            eda: newDataPoint.eda,
            simulationMode: currentSimMode 
          });

          fetch('http://127.0.0.1:5001/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              heartRate: simulatedHeartRate,
              eda: newDataPoint.eda
            })
          })
          .then(res => res.json())
          .then(data => {
            console.log(`[ML Server Response] Data:`, data);
            
            if (data && data.stressLevel) {
                if (data.stressLevel === "HIGH" || data.stressLevel === "MILD") {
                   triggerAlert(newDataPoint, data.stressLevel);
                }
            }
          })
          .catch(err => {
              console.error("Error pinging AI ML Server:", err);
          });

          lastAlertTimeRef.current = currentTime;
      }

    }, 2500);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]); 


  const triggerAlert = (metrics: { hrv: number; eda: number }, mlStressLevel: string = "ELEVATED") => {
    const recs = [
      "Take a deep breath and count to 10.",
      "Listen to a calming playlist.",
      "Take a 5-minute walking break.",
      "Drink a glass of water.",
      "Practice 4-7-8 breathing technique."
    ];
    const randomRec = recs[Math.floor(Math.random() * recs.length)];

    const alert: AlertEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message: `AI Detected ${mlStressLevel} stress.`,
      recommendation: randomRec,
      stressLevel: mlStressLevel,
      metrics: { hrv: metrics.hrv, eda: metrics.eda }
    };
    
    setAlerts(prev => [alert, ...prev]);
    setNewAlert(alert);
    
    // Save to database
    saveNotificationToDB(alert, mlStressLevel);
    
    setTimeout(() => setNewAlert(null), 5000);
  };

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!authToken) {
      setAlerts([]);
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setAlerts([]);
      }
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  }, [authToken]);

  return {
    isConnected,
    dataHistory,
    currentMetrics,
    alerts,
    newAlert,
    setNewAlert,
    isLoadingAlerts,
    clearAllNotifications,
    refreshNotifications: fetchNotifications,
    simulationMode,
    setSimulationMode
  };
}
