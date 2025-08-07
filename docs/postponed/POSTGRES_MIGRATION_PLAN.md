# PostgreSQL Migration Plan

> **Note:** This migration plan is to be carried out after a successful v0.1 release (currently at v0).

## 1. Assess Current SQLite Usage

- Review all code that interacts with SQLite (e.g., `/server/db.js`, `/server/crud.js`, migration scripts).
- List all SQL queries and schema definitions.

## 2. Research PostgreSQL Compatibility

- Compare SQLite and PostgreSQL data types and SQL syntax.
- Identify any schema or query changes needed (e.g., `AUTOINCREMENT` vs. `SERIAL`, foreign key constraints, default values).

## 3. Choose a PostgreSQL Node.js Library

- Recommended: [`pg`](https://node-postgres.com/) for direct queries, or an ORM like Prisma, Sequelize, or TypeORM for abstraction.
- Evaluate pros/cons for your project needs.

## 4. Draft Migration Steps

- Update database connection logic to use PostgreSQL (e.g., new `db.js`).
- Convert schema definitions and migration scripts to PostgreSQL-compatible SQL.
- Plan for data export from SQLite and import into PostgreSQL (e.g., using CSV or a migration tool).
- Update environment variables and configuration files for PostgreSQL connection.

## 5. Document the Migration Process

- Create a step-by-step guide for:
  - Setting up PostgreSQL locally and in production
  - Running migrations
  - Verifying data integrity
  - Rolling back if needed

## 6. (Optional) Prototype

- Create a feature branch to test PostgreSQL integration before full migration.
- Run automated tests to ensure compatibility.

---

**Note:**

- Migration should be planned for a time when downtime is acceptable, or use a dual-write approach for zero-downtime migration.
- Test thoroughly before switching production to PostgreSQL.
