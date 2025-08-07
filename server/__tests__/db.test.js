import { describe, it, expect, beforeAll, afterAll } from "vitest";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DB_DIR = path.join(__dirname, "../../data/test");
const TEST_DB_PATH = path.join(TEST_DB_DIR, "test.db");

describe("Database Tests", () => {
  let db;

  beforeAll(() => {
    // Ensure test directory exists
    if (!fs.existsSync(TEST_DB_DIR)) {
      fs.mkdirSync(TEST_DB_DIR, { recursive: true });
    }

    // Create test database connection
    db = new sqlite3.Database(TEST_DB_PATH);
  });

  afterAll(() => {
    // Close database connection
    db.close();

    // Clean up test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  it("should create and connect to SQLite database", (done) => {
    expect(db).toBeDefined();
    db.get("SELECT 1", (err, result) => {
      expect(err).toBeNull();
      expect(result["1"]).toBe(1);
      done();
    });
  });

  it("should create required tables", (done) => {
    const tables = ["prompts", "ai_results", "overrides", "pdf_exports"];

    db.serialize(() => {
      // Create tables
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

      // Verify tables exist
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err, rows) => {
          expect(err).toBeNull();
          const tableNames = rows
            .map((row) => row.name)
            .filter((name) => !name.startsWith("sqlite_"));
          tables.forEach((table) => {
            expect(tableNames).toContain(table);
          });
          done();
        }
      );
    });
  });
});
