// src/components/alerts/AlertToast.tsx
import React, { useState, useEffect } from 'react';
import { Alert, AlertSeverity } from '@/types/alerts';
import { X, AlertTriangle, AlertCircle, Info, Zap, CheckCircle } from 'lucide-react';

interface AlertToastProps {
  alert: Alert;
  onDismiss: (alertId: string) => void;
  onAcknowledge: (alertId: string) => void;
  autoHide?: boolean;
  duration?: number;
}

export const AlertToast: React.FC<AlertToastProps> = ({
  alert,
  onDismiss,
  onAcknowledge,
  autoHide = false,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (autoHide && alert.severity !== 'critical' && alert.severity !== 'emergency') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, alert.severity]);

  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case 'emergency':
        return {
          bgColor: 'bg-red-600',
          textColor: 'text-white',
          borderColor: 'border-red-700',
          icon: <Zap className="w-5 h-5" />,
          iconBg: 'bg-red-700'
        };
      case 'critical':
        return {
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          borderColor: 'border-red-600',
          icon: <AlertTriangle className="w-5 h-5" />,
          iconBg: 'bg-red-600'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-400',
          textColor: 'text-yellow-900',
          borderColor: 'border-yellow-500',
          icon: <AlertCircle className="w-5 h-5" />,
          iconBg: 'bg-yellow-500'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          borderColor: 'border-blue-600',
          icon: <Info className="w-5 h-5" />,
          iconBg: 'bg-blue-600'
        };
      default:
        return {
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          borderColor: 'border-gray-600',
          icon: <Info className="w-5 h-5" />,
          iconBg: 'bg-gray-600'
        };
    }
  };

  const config = getSeverityConfig(alert.severity);

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss(alert.id);
    }, 300);
  };

  const handleAcknowledge = () => {
    onAcknowledge(alert.id);
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
      isAnimating ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
    }`}>
      <div className={`${config.bgColor} ${config.textColor} ${config.borderColor} border-l-4 rounded-lg shadow-lg overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className={`${config.iconBg} rounded-full p-1 mr-3 mt-0.5`}>
              {config.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{alert.title}</h4>
                  <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                  
                  <div className="flex items-center text-xs opacity-75 mt-2">
                    <span>{alert.providerName}</span>
                    <span className="mx-2">•</span>
                    <span>{alert.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleDismiss}
                  className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Action buttons for critical/emergency alerts */}
              {(alert.severity === 'critical' || alert.severity === 'emergency') && alert.status === 'active' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAcknowledge}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-xs font-medium transition-colors"
                  >
                    Acknowledge
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress bar for auto-hide */}
        {autoHide && alert.severity !== 'critical' && alert.severity !== 'emergency' && (
          <div className="h-1 bg-black bg-opacity-20">
            <div
              className="h-full bg-white bg-opacity-40 transition-all ease-linear"
              style={{
                width: '100%',
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
