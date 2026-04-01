import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notification) => {
    const id = Date.now()
    const newNotification = {
      ...notification,
      id,
      timestamp: new Date(),
    }

    setNotifications(prev => [newNotification, ...prev])

    // Auto-dismiss after 8 seconds (give user time to read)
    if (notification.autoDismiss !== false) {
      setTimeout(() => {
        removeNotification(id)
      }, 8000)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Listen for incoming notifications from Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleServiceWorkerMessage = (event) => {
      console.log('📨 Message from Service Worker:', event.data);
      
      if (event.data.type === 'NOTIFICATION_RECEIVED') {
        const { title, body, type } = event.data;
        console.log(`📢 Adding in-app notification: ${title}`);
        
        addNotification({
          type: type || 'alert',
          title: title,
          message: body,
          autoDismiss: true,
          icon: type === 'todo' ? '📋' : type === 'habit' ? '🎯' : type === 'routine' ? '📅' : '⏰'
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [addNotification])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
