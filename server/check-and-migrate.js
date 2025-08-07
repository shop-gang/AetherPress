#!/usr/bin/env node
// check-and-migrate.js: Ensures required tables exist before running tests
const sqlite3 = require("sqlite3").verbose();
const { spawnSync } = require("child_process");
const path = require("path");

const dbPath = path.join(__dirname, "../data/aetherpress.db");
const requiredTables = ["prompts", "ai_results", "overrides", "pdf_exports"];

const db = new sqlite3.Database(dbPath);

function checkTables(callback) {
  let missing = [];
  let checked = 0;
  requiredTables.forEach((table) => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [table],
      (err, row) => {
        if (err || !row) missing.push(table);
        checked++;
        if (checked === requiredTables.length) callback(missing);
      }
    );
  });
}

checkTables((missing) => {
  if (missing.length > 0) {
    console.log(
      "Missing tables:",
      missing.join(", "),
      "- running migrate.js..."
    );
    spawnSync("node", [path.join(__dirname, "migrate.js")], {
      stdio: "inherit",
    });
  } else {
    console.log("All required tables exist.");
  }
  db.close();
  // Now run tests
  const result = spawnSync("npx", ["vitest", "run", ...process.argv.slice(2)], {
    stdio: "inherit",
    cwd: __dirname,
  });
  process.exit(result.status);
});
