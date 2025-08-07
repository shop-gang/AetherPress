// Migration script: creates tables if they do not exist
const db = require("./db");

const migrations = [
  `CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS ai_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id INTEGER NOT NULL REFERENCES prompts(id),
    result TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS overrides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ai_result_id INTEGER NOT NULL REFERENCES ai_results(id),
    override TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS pdf_exports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ai_result_id INTEGER NOT NULL REFERENCES ai_results(id),
    file_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
];

migrations.forEach((sql) => {
  db.run(sql, (err) => {
    if (err) console.error("Migration error:", err.message);
  });
});

console.log("Database migrations complete.");
