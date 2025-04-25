// components/SplunkAlertListener.tsx
'use client';

import { useEffect, useState } from 'react';
import { type SplunkAlert } from '@/lib/splunkAlerts';

export default function SplunkAlertListener() {
  const [alerts, setAlerts] = useState<SplunkAlert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const eventSource = new EventSource('/api/sse-alerts', {
      withCredentials: true
    });

    eventSource.onopen = () => {
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (e) => {
      try {
        const alert = JSON.parse(e.data) as SplunkAlert;
        setAlerts(prev => [...prev, alert]);
      } catch (error) {
        console.error('Error parsing alert:', error);
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus('error');
      eventSource.close();
      // Attempt reconnection after delay
      setTimeout(() => {
        setConnectionStatus('reconnecting');
      }, 5000);
    };

    return () => {
      eventSource.close();
      setConnectionStatus('disconnected');
    };
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Splunk Alerts</h2>
        <span className={`px-3 py-1 rounded-full text-sm ${
          connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
          connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {connectionStatus.toUpperCase()}
        </span>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-gray-500">No alerts received yet</p>
        ) : (
          alerts.map((alert, i) => (
            <div key={i} className="p-3 border-b">
              <div className="flex justify-between">
                <span className="font-medium">
                  {new Date(parseInt(alert._time) * 1000).toLocaleString()}
                </span>
              </div>
              <p className="mt-1">{alert.message}</p>
              {alert.result && (
                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded">
                  {JSON.stringify(alert.result, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}