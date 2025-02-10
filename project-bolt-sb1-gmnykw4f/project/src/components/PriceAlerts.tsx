import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import { PriceAlert } from '../types';

interface PriceAlertsProps {
  alerts: PriceAlert[];
  onAcknowledge: (alertId: string) => void;
}

export default function PriceAlerts({ alerts, onAcknowledge }: PriceAlertsProps) {
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  if (unacknowledgedAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {unacknowledgedAlerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${
              alert.severity === 'high'
                ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                : alert.severity === 'medium'
                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
            }`}
          >
            {alert.severity === 'high' ? (
              <AlertTriangle className="flex-shrink-0" />
            ) : (
              <Bell className="flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">{alert.message}</p>
              <p className="text-sm opacity-75">
                {new Date(alert.date).toLocaleString()}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAcknowledge(alert.id)}
              className="p-2 hover:bg-white/20 rounded-full"
            >
              <CheckCircle className="flex-shrink-0" />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}