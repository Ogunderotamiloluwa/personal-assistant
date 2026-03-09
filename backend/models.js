// Database Models
// User Model
const userModel = {
  userId: String,
  name: String,
  email: String,
  password: String,
  createdAt: Date,
  updatedAt: Date
};

// Habit Model
const habitModel = {
  habitId: String,
  userId: String,
  name: String,
  description: String,
  frequency: String, // daily, weekly, monthly
  status: String, // active, inactive
  startDate: Date,
  createdAt: Date
};

// Routine Model
const routineModel = {
  routineId: String,
  userId: String,
  name: String,
  tasks: Array,
  time: String,
  createdAt: Date
};

module.exports = {
  userModel,
  habitModel,
  routineModel
};
