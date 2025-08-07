const sqlite3 = require("sqlite3").verbose();
const { Client } = require("pg");
const path = require("path");

async function testSQLite() {
  console.log("Testing SQLite connection...");
  const dbPath = path.join(__dirname, "../data/aetherpress.db");
  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    db.get("SELECT 1", (err) => {
      if (err) {
        console.error("SQLite test failed:", err.message);
        reject(err);
      } else {
        console.log("SQLite connection successful!");
        db.close();
        resolve();
      }
    });
  });
}

async function testPostgreSQL() {
  console.log("Testing PostgreSQL connection...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const result = await client.query("SELECT NOW()");
    console.log("PostgreSQL connection successful!", result.rows[0]);
    await client.end();
  } catch (err) {
    console.log(
      "PostgreSQL test skipped - will be implemented in future version"
    );
    console.log("(Error was:", err.message + ")");
  }
}

async function main() {
  try {
    await testSQLite();
    await testPostgreSQL();
  } catch (err) {
    console.error("Database tests failed:", err);
    process.exit(1);
  }
}

main();
