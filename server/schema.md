# Database Schema for AetherPress (v0.1)

## Tables

### 1. prompts

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `prompt` TEXT NOT NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

### 2. ai_results

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `prompt_id` INTEGER NOT NULL REFERENCES prompts(id)
- `result` TEXT NOT NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

### 3. overrides

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `ai_result_id` INTEGER NOT NULL REFERENCES ai_results(id)
- `override` TEXT NOT NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

### 4. pdf_exports

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `ai_result_id` INTEGER NOT NULL REFERENCES ai_results(id)
- `file_path` TEXT NOT NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

---

This schema supports the core loop: Prompt -> AI Processing -> Preview/Override -> PDF Export.
