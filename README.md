# Student Management System with Redis Caching

A command-line teaching example demonstrating a cache-aside pattern with MongoDB (Mongoose, with two related models: `Course` and `Student`) and Redis (`ioredis`).

## Features
- **MongoDB Integration**: Stores related records in a `practice_students_<ROLL_NO>` database with relationship population (`.populate('course', 'name')`).
- **Redis Caching**: Caches the list of all students under `students:all` for 60 seconds using helper wrappers (`SET`, `GET`, `EXPIRE`, and `DEL`).
- **Cache Invalidation**: Automatically clears the cache (`DEL students:all`) on write operations (inserts, updates, and deletes).

## Setup & Run
1. Install **Node.js 20.19 or newer**. Prepare a MongoDB Atlas cluster, create a database user with read/write access, and whitelist your IP under Network Access.
2. Start local Redis (e.g., `docker run -p 6379:6379 redis` or `redis-server`).
3. Open a terminal in this folder and run `npm install`.
4. Copy `.env.example` to `.env` and set `MONGODB_URI`, `DB_NAME`, and `REDIS_URL` (default `redis://127.0.0.1:6379`). Do not commit `.env`.
5. Run `npm start`.

The database is named `practice_students_<ROLL_NO>`. Both MongoDB and Redis connections are initialized before operations and safely closed in `finally`, including after failures.

## Redis Helpers (`src/config/redis.js`)

The service interacts with Redis exclusively through these wrapper functions:

| Command | Helper | Purpose |
| --- | --- | --- |
| `SET` | `setCache(key, value)` | Store a value (JSON-encoded) |
| `GET` | `getCache(key)` | Read a value; `null` on a miss |
| `EXPIRE` | `expireCache(key, seconds)` | Set a time-to-live |
| `DEL` | `deleteCache(key)` | Remove a key (cache invalidation) |

## Caching Pattern (Cache-Aside)

The student list is cached under `students:all` for 60 seconds.

| Service Operation | MongoDB | Redis |
| --- | --- | --- |
| `insertMany()` / Creates | `Student.insertMany()` | `DEL students:all` |
| Fetch All Students | `Student.find()` on a miss only | `GET`; on a miss `SET` + `EXPIRE` |
| `findOneAndUpdate()` / Updates | `Student.findOneAndUpdate()` | `DEL students:all` |
| `findOneAndDelete()` / Deletes | `Student.findOneAndDelete()` | `DEL students:all` |