# Database Migrations

This directory contains database migration scripts for the SkillzCollab API.

## Available Migrations

### 1. Add missing columns to submissions table

- **File**: `add-likes-votes-to-submissions.js`
- **Purpose**: Adds missing columns to the submissions table to match the model definition
- **Columns Added**:
  - `likes` (INT, NOT NULL, DEFAULT 0)
  - `votes` (INT, NOT NULL, DEFAULT 0)
  - `created_at` (TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

## How to Run Migrations

### Option 1: Using npm script (Recommended)

```bash
npm run migrate
```

### Option 2: Direct execution

```bash
node api/migrations/run-migration.js
```

### Option 3: Using the migration file directly

```bash
node api/migrations/add-likes-votes-to-submissions.js
```

## What the Migration Does

1. **Checks existing columns**: Verifies if `likes` and `votes` columns already exist
2. **Adds missing columns**: Only adds columns that don't already exist
3. **Sets defaults**: Sets default values to 0 for both columns
4. **Verifies results**: Shows the current table structure after migration

## Troubleshooting

### If you get "Unknown column" errors:

This usually means the database schema is out of sync with the model definitions. Run the migration to fix this.

### If the migration fails:

1. Check your database connection
2. Ensure you have proper permissions to alter tables
3. Check the console output for specific error messages

### To rollback changes:

The migration includes a `down` function that can remove the columns if needed.

## Database Schema Sync

For development environments, you can also use:

```bash
npm run init-db
```

This will sync all models with the database using `sequelize.sync({ alter: true })`.

## Important Notes

- **Production**: Always backup your database before running migrations
- **Development**: The `alter: true` option in init-db.js can automatically sync schema changes
- **Testing**: Test migrations on a copy of your production data first
