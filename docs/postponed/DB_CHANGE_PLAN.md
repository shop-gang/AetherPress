# Database Change Plan (DB_CHANGE_PLAN)

## Objective

Migrate backend data storage from SQLite to PostgreSQL/JSONB, aligning with the updated architecture and devcontainer setup. Ensure minimal disruption and maximum compatibility for current and future features, including AI processing and content generation.

---

## Plan Forward: Steps for Smooth Implementation

### 1. Environment Preparation

- **Create/Edit `.env` file** with `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
- **Verify Docker Compose** launches both `app` and `db` services, with persistent volume for database data.
- **Confirm devcontainer** installs `postgresql-client` for CLI access.

### 2. Backend Refactor

- **Replace SQLite logic** with PostgreSQL using the `pg` Node.js client.
- **Update connection/config** in backend code (`server/db.js`, etc.) to use environment variables.
- **Migrate schema/data**: Convert any existing SQLite schema/data to PostgreSQL format. Use migration scripts if needed.

### 3. Data Migration & Validation

- **Write migration scripts** to transfer data from SQLite to PostgreSQL (if applicable).
- **Test database connectivity** and CRUD operations in development.
- **Validate schema** matches application requirements.

### 4. Update Tests & Scripts

- **Update backend tests** to work with PostgreSQL.
- **Add/Update migration and seed scripts** for database setup.
- **Ensure test coverage** for new database logic.

### 5. Documentation & Developer Experience

- **Update README** and relevant docs to reflect PostgreSQL usage and setup steps.
- **Document environment setup** and troubleshooting steps for contributors.

### 6. Acceptance Criteria

- Backend uses PostgreSQL for all data storage and access.
- All tests pass with PostgreSQL.
- Data is persisted and accessible across container restarts.
- Documentation is clear and up-to-date.

---

## Notes

- This plan is designed for least resistance: incremental changes, clear migration steps, and robust testing.
- Further enhancements (advanced schema, performance tuning, etc.) can be planned after successful migration.

---

## Suggestions for Progressing Past Layer 1 (Health Check)

To move beyond the initial database service validation and pass subsequent health check layers (Prisma Setup, Application Schema):

1. **Scaffold Prisma Setup**

   - Create the `server/prisma/schema.prisma` file with an initial schema definition.
   - Add a valid `DATABASE_URL` to your environment (format: `postgresql://user:password@host:port/dbname`).
   - Initialize Prisma in the backend and ensure the Prisma client can connect to the database.

2. **Verify Layer 2 (Prisma Setup)**

   - Run the health check script with `--check=prisma` to confirm Prisma schema and client initialization.
   - Address any errors related to missing or unreadable schema files, or invalid connection strings.

3. **Prepare for Layer 3 (Application Schema)**
   - Define required tables (e.g., `Calendar`, `Event`) in the Prisma schema.
   - Run migrations to create these tables in the database.
   - Use the health check script with `--check=schema` to validate table existence and schema correctness.

These steps ensure incremental progress and allow each validation layer to be addressed with minimal resistance. Document any issues and update the plan as needed.
