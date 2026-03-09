import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, CheckCircle2, TrendingUp, Target } from 'lucide-react'
import { API_URL } from '../config/apiConfig'

export default function StatsOverview() {
  const [stats, setStats] = useState({
    completedToday: 0,
    totalHabits: 0,
    completionRate: 0,
    streak: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      
      // Fetch habits data
      const habitsResponse = await fetch(`${API_URL}/api/habits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (habitsResponse.ok) {
        const habitsData = await habitsResponse.json()
        const habits = habitsData.habits || []
        
        // Count completed habits (check if completed flag is true)
        const completedToday = habits.filter(h => h.completed === true).length
        const totalHabits = habits.length
        const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
        
        // Calculate streak - sum of all completion dates from all habits
        let maxStreak = 0
        if (habits.length > 0) {
          habits.forEach(habit => {
            if (habit.streak) {
              maxStreak = Math.max(maxStreak, habit.streak)
            }
          })
        }
        
        setStats({
          completedToday,
          totalHabits,
          completionRate,
          streak: maxStreak
        })
      }
    } catch (err) {
      console.error('Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  const itemVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 }
  }

  const StatCard = ({ Icon, label, value, gradient, delay, unit = '' }) => (
    <motion.div
      variants={itemVariants}
      transition={{ delay }}
      className={`p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-br ${gradient} border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2 font-medium uppercase tracking-wide">{label}</div>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {value}{unit}
          </div>
        </div>
        <div className="p-2 md:p-3 rounded-lg bg-white/5">
          <Icon size={20} className="md:w-6 md:h-6 text-white/60" />
        </div>
      </div>
    </motion.div>
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
    >
      <StatCard
        Icon={Flame}
        label="Streak"
        value={stats.streak}
        unit=" days"
        gradient="from-orange-600/20 to-orange-800/20"
        delay={0}
      />

      <StatCard
        Icon={CheckCircle2}
        label="Completed"
        value={`${stats.completedToday}/${stats.totalHabits}`}
        gradient="from-green-600/20 to-green-800/20"
        delay={0.1}
      />

      <StatCard
        Icon={TrendingUp}
        label="Completion"
        value={stats.completionRate}
        unit="%"
        gradient="from-blue-600/20 to-blue-800/20"
        delay={0.2}
      />

      <StatCard
        Icon={Target}
        label="Total Goals"
        value={stats.totalHabits}
        gradient="from-purple-600/20 to-purple-800/20"
        delay={0.3}
      />
    </motion.div>
  )
}
