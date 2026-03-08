import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, CheckCircle2, Circle, Clock, MapPin, AlertTriangle, CloudRain, Wind } from 'lucide-react'

const RISK_COLORS = {
  low: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' },
  medium: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
  high: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' }
}

export default function TodoCard({ todo, onComplete, onDelete, onEdit, userLocation }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isOverdue, setIsOverdue] = useState(false)
  const [trafficAlert, setTrafficAlert] = useState(null)
  const [weatherAlert, setWeatherAlert] = useState(null)

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const todoTime = new Date(todo.scheduledTime);
      const diff = todoTime - now;

      if (diff < 0) {
        setIsOverdue(true);
        const hours = Math.abs(Math.floor(diff / 3600000));
        const minutes = Math.abs(Math.floor((diff % 3600000) / 60000));
        setTimeLeft(`${hours}h ${minutes}m overdue`);
      } else {
        setIsOverdue(false);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [todo]);

  useEffect(() => {
    // Check for traffic/route dangers
    if (todo.location && todo.riskLevel === 'high') {
      // Mock traffic alert - in production, use Google Maps API or similar
      const trafficSimulation = Math.random() > 0.5;
      if (trafficSimulation) {
        setTrafficAlert({
          type: 'traffic',
          message: '🚗 Heavy traffic detected on this route',
          severity: 'high'
        });
      }
    }

    // Check for weather alerts
    if (todo.location && userLocation) {
      const weatherSimulation = Math.random() > 0.6;
      if (weatherSimulation) {
        const alerts = ['⛈️ Thunderstorm warning', '🌧️ Heavy rain expected', '☀️ High heat warning'];
        setWeatherAlert({
          type: 'weather',
          message: alerts[Math.floor(Math.random() * alerts.length)],
          severity: 'medium'
        });
      }
    }
  }, [todo, userLocation]);

  const riskStyle = RISK_COLORS[todo.riskLevel];
  const todoTime = new Date(todo.scheduledTime);
  const now = new Date();
  const isNearTime = (todoTime - now) < 15 * 60000; // Less than 15 minutes

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-3 md:p-5 rounded-lg md:rounded-xl border-2 backdrop-blur-xl transition-all ${
        isNearTime && isOverdue
          ? 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/20'
          : isNearTime
          ? 'bg-command-gold/10 border-command-gold/50 shadow-lg shadow-command-gold/20'
          : `${riskStyle.bg} border-${todo.riskLevel === 'low' ? 'green' : todo.riskLevel === 'medium' ? 'yellow' : 'red'}-500/50`
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-lg font-semibold text-white truncate">{todo.title}</h3>
          {todo.description && (
            <p className="text-xs md:text-sm text-gray-400 mt-0.5 md:mt-1 line-clamp-1">{todo.description}</p>
          )}
        </div>
        <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${riskStyle.bg} border border-white/20 ${riskStyle.text}`}>
          {todo.riskLevel === 'low' && '✅ Low'}
          {todo.riskLevel === 'medium' && '⚠️ Med'}
          {todo.riskLevel === 'high' && '🚨 High'}
        </span>
      </div>

      {/* Time and Location */}
      <div className="space-y-1 md:space-y-2 mb-2 md:mb-3 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <Clock size={12} className="md:w-4 md:h-4 flex-shrink-0 text-command-gold" />
          <span className={`${isNearTime || isOverdue ? 'text-red-400 font-semibold' : 'text-gray-300'} truncate`}>
            {todoTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className={`ml-auto font-semibold flex-shrink-0 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
            {timeLeft?.replace('minutes', 'm')?.replace('hours', 'h')}
          </span>
        </div>

        {todo.location && (
          <div className="flex items-center gap-2 text-gray-300 truncate">
            <MapPin size={12} className="md:w-4 md:h-4 flex-shrink-0 text-blue-400" />
            <span className="truncate text-xs md:text-sm">{todo.location}</span>
          </div>
        )}
      </div>

      {/* Alerts */}
      {(trafficAlert || weatherAlert) && (
        <div className="space-y-1 mb-2 md:mb-3 p-2 md:p-3 bg-red-500/10 border border-red-500/30 rounded">
          {trafficAlert && (
            <div className="flex items-center gap-2 text-xs text-red-300">
              <Wind size={11} className="md:w-3 md:h-3 flex-shrink-0" />
              <span className="truncate">{trafficAlert.message}</span>
            </div>
          )}
          {weatherAlert && (
            <div className="flex items-center gap-2 text-xs text-red-300">
              <CloudRain size={11} className="md:w-3 md:h-3 flex-shrink-0" />
              <span className="truncate">{weatherAlert.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Progress indicator if near time */}
      {isNearTime && (
        <div className="mb-2 md:mb-3 h-1 bg-red-500/20 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: 60, repeat: Infinity }}
            className="h-full bg-red-500"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(todo.id)}
          className="flex-1 py-1.5 md:py-2 px-2 md:px-3 rounded text-xs md:text-sm bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-1"
        >
          <CheckCircle2 size={14} className="md:w-4 md:h-4" />
          <span className="hidden sm:inline">Complete</span>
          <span className="sm:hidden">Done</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(todo.id)}
          className="py-1.5 md:py-2 px-2 md:px-3 rounded bg-white/5 border border-white/10 text-gray-300 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all"
        >
          <Trash2 size={14} className="md:w-4 md:h-4" />
        </motion.button>
      </div>

      {/* Danger indicator */}
      {isNearTime && isOverdue && (
        <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertTriangle size={11} className="md:w-3 md:h-3 flex-shrink-0" />
          <span className="truncate">This todo is overdue!</span>
        </div>
      )}
    </motion.div>
  )
}
