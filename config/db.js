require('dotenv').config();
const { MongoClient } = require('mongodb');

let db = null;

async function connectToMongo() {
  if (db) return db;

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.MONGO_DB);
  console.log("✅ MongoDB conectado!");
  return db;
}

module.exports = connectToMongo;
