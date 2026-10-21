require('dotenv').config();
const { connectDatabase, disconnectDatabase } = require('./config/database');
const { connectRedis, disconnectRedis } = require('./config/redis');
const { runStudentExamples } = require('./services/student.service');

async function main() {
  try {
    await connectDatabase();
    try {
      await connectRedis();
    } catch {
      throw new Error('Redis connection failed. Check REDIS_URL and ensure Redis is running.');
    }
    await runStudentExamples();
    console.log('\nAll tasks completed successfully.');
  } catch (error) {
    console.error('Connection or operation failed:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await disconnectDatabase();
    } catch {
      console.error('Could not close the MongoDB connection cleanly.');
    }
    try {
      await disconnectRedis();
    } catch {
      console.error('Could not close the Redis connection cleanly.');
    }
  }
}

main();