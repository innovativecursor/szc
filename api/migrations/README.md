# Database Migrations

This directory contains database migration scripts for the SkillzCollab application.

## Available Migrations

### 1. Email Uniqueness Migration (`run-email-uniqueness-migration.js`)

**Purpose**: Updates the user table to allow the same email for different roles while preventing duplicate emails within the same role.

**Changes**:

- Removes the unique constraint on the `email` column
- Adds a composite unique constraint for `email + roles` combination
- Allows users to have multiple accounts with the same email but different roles
- Maintains username uniqueness across all roles

**Usage**:

```bash
cd api/migrations
node run-email-uniqueness-migration.js
```

**Before Migration**:

- ❌ Same email could not be used for different roles
- ❌ Users had to use different emails for different accounts

**After Migration**:

- ✅ Same email can be used for different roles (e.g., user@example.com as "user" and "admin")
- ✅ Prevents duplicate emails within the same role
- ✅ Usernames remain unique across all roles
- ✅ Better user experience for users with multiple roles

### 2. Google ID Migration (`run-google-id-migration.js`)

**Purpose**: Adds Google OAuth support to existing users.

### 3. Reactions Table Migration (`create-reactions-table.js`)

**Purpose**: Creates the reactions table for user interactions.

### 4. Submissions Migration (`add-likes-votes-to-submissions.js`)

**Purpose**: Adds likes and votes functionality to submissions.

## Running Migrations

1. **Ensure database is running** and accessible
2. **Navigate to migrations directory**: `cd api/migrations`
3. **Run specific migration**: `node migration-name.js`
4. **Check logs** for success/error messages

## Migration Order

If running multiple migrations, follow this order:

1. `run-email-uniqueness-migration.js` (if updating email constraints)
2. `run-google-id-migration.js` (if adding OAuth support)
3. `create-reactions-table.js` (if adding reactions)
4. `add-likes-votes-to-submissions.js` (if adding submission features)

## Troubleshooting

### Common Issues:

- **Connection failed**: Check database service and connection settings
- **Permission denied**: Ensure database user has ALTER TABLE privileges
- **Table not found**: Verify the users table exists before running migrations

### Rollback:

Most migrations include rollback logic. Check individual migration files for rollback instructions.

## Notes

- Migrations are designed to be safe and non-destructive
- Always backup your database before running migrations
- Test migrations in a development environment first
- Some migrations may require application restart to take effect
