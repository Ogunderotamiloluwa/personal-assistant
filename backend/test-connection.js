const mongoose = require('mongoose');
require('dotenv').config();

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // Plain text for now
  timezone: String,
  preferences: {
    theme: String,
    notifications: Boolean
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema, 'user');

const testConnection = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log(`📍 URI: ${process.env.MONGODB_URI}`);

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📊 Database: ${mongoose.connection.db.name}`);
    console.log(`🔗 Connected to: ${mongoose.connection.host}`);

    // Test the connection by listing databases
    const adminDb = mongoose.connection.db.admin();
    const databases = await adminDb.listDatabases();
    console.log(`\n📚 Available databases: ${databases.databases.map(db => db.name).join(', ')}`);

    // Verify connection state
    console.log(`\n📈 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

    // Push dummy test user
    console.log('\n📝 Pushing test user data...');
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testPassword123',
      timezone: 'UTC',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    });

    const savedUser = await testUser.save();
    console.log('✅ User successfully inserted!');
    console.log('📦 Saved User Data:');
    console.log(JSON.stringify(savedUser, null, 2));

    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully! Connection closed.');

  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

testConnection();
