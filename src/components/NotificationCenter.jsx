import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Info, Clock, Target, Calendar } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotifications()

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-400" size={20} />
      case 'alert':
      case 'error':
        return <AlertCircle className="text-red-400" size={20} />
      case 'todo':
        return <Clock className="text-blue-400" size={20} />
      case 'habit':
        return <Target className="text-purple-400" size={20} />
      case 'routine':
        return <Calendar className="text-orange-400" size={20} />
      default:
        return <Info className="text-cyan-400" size={20} />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-500/40 bg-green-500/15 shadow-lg shadow-green-500/20'
      case 'alert':
      case 'error':
        return 'border-red-500/40 bg-red-500/15 shadow-lg shadow-red-500/20'
      case 'todo':
        return 'border-blue-500/40 bg-blue-500/15 shadow-lg shadow-blue-500/20'
      case 'habit':
        return 'border-purple-500/40 bg-purple-500/15 shadow-lg shadow-purple-500/20'
      case 'routine':
        return 'border-orange-500/40 bg-orange-500/15 shadow-lg shadow-orange-500/20'
      default:
        return 'border-cyan-500/40 bg-cyan-500/15 shadow-lg shadow-cyan-500/20'
    }
  }

  const getEmoji = (type) => {
    switch (type) {
      case 'todo':
        return '📋'
      case 'habit':
        return '🎯'
      case 'routine':
        return '📅'
      case 'success':
        return '✅'
      case 'alert':
      case 'error':
        return '⚠️'
      default:
        return '🔔'
    }
  }

  return (
    <div className="fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, x: 400, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
            exit={{ opacity: 0, x: 400, scale: 0.8, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`mb-4 p-4 rounded-lg border backdrop-blur-xl flex items-start gap-4 group cursor-pointer hover:shadow-xl transition-all ${getNotificationColor(notification.type)}`}
          >
            <div className="flex-shrink-0 mt-1 text-2xl">
              {getEmoji(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white leading-tight">{notification.title}</h4>
              <p className="text-xs text-gray-200 mt-1.5 leading-relaxed">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-all opacity-70 hover:opacity-100 hover:bg-white/10 p-1 rounded"
            >
              <X size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
