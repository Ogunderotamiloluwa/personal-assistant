import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, CheckCircle2, Clock, MapPin, AlertTriangle } from 'lucide-react'

const RISK_COLORS = {
  low: { bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-400', badge: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' },
  medium: { bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' },
  high: { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' }
}

export default function TodoCard({ todo, onComplete, onDelete, onEdit, userLocation }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isOverdue, setIsOverdue] = useState(false)

  useEffect(() => {
    const updateTimeLeft = () => {
      if (!todo.scheduledTime) {
        setTimeLeft('No time set');
        return;
      }
      
      const now = new Date();
      const todoTime = new Date(todo.scheduledTime);
      
      // Handle invalid dates
      if (isNaN(todoTime.getTime())) {
        setTimeLeft('Invalid date');
        return;
      }
      
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
    const interval = setInterval(updateTimeLeft, 30000);
    return () => clearInterval(interval);
  }, [todo]);

  // Handle undefined riskLevel with fallback
  const riskLevel = todo.riskLevel || 'low';
  const riskStyle = RISK_COLORS[riskLevel];
  const todoTime = todo.scheduledTime ? new Date(todo.scheduledTime) : null;
  const now = new Date();
  const isNearTime = todoTime && !isNaN(todoTime.getTime()) && (todoTime - now) < 15 * 60000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 sm:p-5 rounded-xl border transition-all ${
        isNearTime && isOverdue
          ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800 shadow-md'
          : isNearTime
          ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-800 shadow-md'
          : riskLevel === 'medium'
          ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
          : riskLevel === 'high'
          ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
          : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">{todo.title}</h3>
          {todo.description && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{todo.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${riskStyle.badge}`}>
          {riskLevel === 'low' && 'Low'}
          {riskLevel === 'medium' && 'Medium'}
          {riskLevel === 'high' && 'High'}
        </span>
      </div>

      {/* Time and Location */}
      <div className="space-y-2 mb-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Clock size={16} className="flex-shrink-0 text-blue-600" />
          <span className={`${isNearTime || isOverdue ? 'font-semibold text-red-700' : ''}`}>
            {todoTime && !isNaN(todoTime.getTime()) 
              ? todoTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Invalid Date'}
          </span>
          <span className={`ml-auto font-medium flex-shrink-0 ${isOverdue ? 'text-red-700' : 'text-gray-500'}`}>
            {timeLeft}
          </span>
        </div>

        {todo.location && (
          <div className="flex items-center gap-2 text-gray-600 truncate">
            <MapPin size={16} className="flex-shrink-0 text-blue-600" />
            <span className="truncate text-xs sm:text-sm">{todo.location}</span>
          </div>
        )}
      </div>

      {/* Alert for overdue */}
      {isNearTime && isOverdue && (
        <div className="mb-4 p-2 sm:p-3 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2 text-xs sm:text-sm text-red-700">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span>This task is overdue</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onComplete(todo.id)}
          className="flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm bg-green-600 text-white font-semibold hover:bg-green-700 active:bg-green-800 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={16} />
          <span>Done</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            console.log('🗑️ Delete button clicked for todo:', todo.id)
            onDelete && onDelete(todo.id)
          }}
          className="py-2 px-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-400 hover:text-red-700 dark:hover:text-red-400 transition-colors font-medium"
          title="Delete this todo"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  )
}
