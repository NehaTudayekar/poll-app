const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("polls.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS polls (id TEXT PRIMARY KEY)`);

  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id TEXT,
    question TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    text TEXT,
    votes INTEGER DEFAULT 0
  )`);
});

module.exports = db;
