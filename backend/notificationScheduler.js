// Notification Scheduler - Schedule and send notifications using node-schedule
// To use: npm install node-schedule

const schedule = require('node-schedule');
const { Controller } = require('./controllers');

class NotificationScheduler {
  constructor() {
    this.scheduledJobs = {};
  }

  /**
   * Schedule a notification for a specific time
   * @param {string} userId - User ID
   * @param {string} type - Type: 'todo', 'habit', 'routine'
   * @param {object} item - The item to remind about
   * @param {Date} scheduleTime - When to send the notification
   */
  scheduleNotification(userId, type, item, scheduleTime) {
    const jobId = `${userId}-${type}-${item.id}`;

    // Cancel existing job if any
    if (this.scheduledJobs[jobId]) {
      this.scheduledJobs[jobId].cancel();
    }

    try {
      this.scheduledJobs[jobId] = schedule.scheduleJob(scheduleTime, () => {
        this.sendReminder(userId, type, item);
      });

      console.log(`📅 Scheduled ${type} reminder for ${jobId} at ${scheduleTime}`);
    } catch (error) {
      console.error(`❌ Failed to schedule notification for ${jobId}:`, error);
    }
  }

  /**
   * Send a reminder notification
   */
  async sendReminder(userId, type, item) {
    try {
      const titles = {
        todo: `📋 Todo: ${item.title}`,
        habit: `🎯 Habit Time: ${item.name}`,
        routine: `📅 Routine: ${item.name}`
      };

      const bodies = {
        todo: `It's time for: ${item.title}${item.description ? ' - ' + item.description : ''}`,
        habit: `Time to work on your ${item.frequency} habit: ${item.name}`,
        routine: `Your routine ${item.name} is scheduled for now`
      };

      const notification = {
        title: titles[type] || 'Reminder',
        body: bodies[type] || 'You have a reminder',
        type,
        itemId: item.id,
        timestamp: new Date()
      };

      console.log(`🔔 Sending reminder:`, notification);

      // In production, send via Firebase Cloud Messaging or similar
      // await sendPushNotification(userId, notification);

      return notification;
    } catch (error) {
      console.error(`❌ Failed to send reminder for ${type} ${item.id}:`, error);
    }
  }

  /**
   * Schedule daily reminders for habits
   */
  scheduleDailyHabitReminders(habits, userId) {
    habits
      .filter(h => h.userId === userId && h.isActive !== false)
      .forEach(habit => {
        if (habit.startTime) {
          const [hours, minutes] = habit.startTime.split(':').map(Number);
          
          // Schedule for every day
          const rule = new schedule.RecurrenceRule();
          rule.hour = hours;
          rule.minute = minutes;

          const jobId = `daily-habit-${userId}-${habit.id}`;

          if (this.scheduledJobs[jobId]) {
            this.scheduledJobs[jobId].cancel();
          }

          this.scheduledJobs[jobId] = schedule.scheduleJob(rule, () => {
            this.sendReminder(userId, 'habit', habit);
          });

          console.log(`⏰ Scheduled daily habit reminder for ${habit.name} at ${habit.startTime}`);
        }
      });
  }

  /**
   * Schedule routine reminders on specific days
   */
  scheduleRoutineReminders(routines, userId) {
    routines
      .filter(r => r.userId === userId)
      .forEach(routine => {
        if (routine.time && routine.repeatDays) {
          const [hours, minutes] = routine.time.split(':').map(Number);
          routine.repeatDays.forEach(day => {
            const dayIndex = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(day);
            
            const rule = new schedule.RecurrenceRule();
            rule.dayOfWeek = dayIndex;
            rule.hour = hours;
            rule.minute = minutes;

            const jobId = `routine-${userId}-${routine.id}-${day}`;

            if (this.scheduledJobs[jobId]) {
              this.scheduledJobs[jobId].cancel();
            }

            this.scheduledJobs[jobId] = schedule.scheduleJob(rule, () => {
              this.sendReminder(userId, 'routine', routine);
            });

            console.log(`⏰ Scheduled ${day} routine reminder for ${routine.name} at ${routine.time}`);
          });
        }
      });
  }

  /**
   * Schedule one-time todo reminders
   */
  scheduleTodoReminders(todos, userId) {
    todos
      .filter(t => t.userId === userId && !t.completed)
      .forEach(todo => {
        if (todo.scheduledTime) {
          try {
            const scheduleTime = new Date(todo.scheduledTime);
            
            // Only schedule if time is in the future
            if (scheduleTime > new Date()) {
              const jobId = `todo-${userId}-${todo.id}`;

              if (this.scheduledJobs[jobId]) {
                this.scheduledJobs[jobId].cancel();
              }

              this.scheduledJobs[jobId] = schedule.scheduleJob(scheduleTime, () => {
                this.sendReminder(userId, 'todo', todo);
              });

              console.log(`⏰ Scheduled todo reminder for ${todo.title} at ${scheduleTime}`);
            }
          } catch (error) {
            console.error(`Error scheduling todo ${todo.id}:`, error);
          }
        }
      });
  }

  /**
   * Cancel all scheduled jobs for a user
   */
  cancelUserJobs(userId) {
    Object.keys(this.scheduledJobs).forEach(jobId => {
      if (jobId.includes(userId)) {
        this.scheduledJobs[jobId].cancel();
        delete this.scheduledJobs[jobId];
        console.log(`❌ Cancelled job: ${jobId}`);
      }
    });
  }

  /**
   * Get all scheduled jobs
   */
  getScheduledJobs() {
    return Object.keys(this.scheduledJobs).length;
  }

  /**
   * Print scheduled jobs (debug)
   */
  listScheduledJobs() {
    console.log('📅 Scheduled Jobs:');
    Object.keys(this.scheduledJobs).forEach(jobId => {
      console.log(`  • ${jobId}`);
    });
  }
}

module.exports = new NotificationScheduler();
