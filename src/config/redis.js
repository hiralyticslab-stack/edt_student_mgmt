const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 1
});

async function connectRedis() {
  await redis.connect();
  console.log('Redis connected successfully.');
}

async function disconnectRedis() {
  await redis.quit();
  console.log('Redis connection closed.');
}

async function setCache(key, value) {
  return redis.set(key, JSON.stringify(value));
}

async function getCache(key) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

async function expireCache(key, seconds) {
  return redis.expire(key, seconds);
}

async function deleteCache(key) {
  return redis.del(key);
}

module.exports = { connectRedis, disconnectRedis, setCache, getCache, expireCache, deleteCache };