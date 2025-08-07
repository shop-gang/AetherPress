// SQLite database initialization for AetherPress
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbDir = path.join(__dirname, "../data");
const dbPath = path.join(dbDir, "aetherpress.db");

// Ensure /data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite database:", err.message);
  } else {
    console.log("Connected to SQLite database at", dbPath);
    // Table creation logic
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS ai_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt_id INTEGER NOT NULL,
        result TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prompt_id) REFERENCES prompts(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS overrides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ai_result_id INTEGER NOT NULL,
        override TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ai_result_id) REFERENCES ai_results(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS pdf_exports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ai_result_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ai_result_id) REFERENCES ai_results(id)
      )`);
    });
  }
});

module.exports = db;
