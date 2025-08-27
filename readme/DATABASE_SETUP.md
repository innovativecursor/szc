# Database Setup Guide for Trial Run

## 🐬 MySQL Setup

### 1. Install MySQL (if not already installed)

**Windows:**

- Download from: https://dev.mysql.com/downloads/installer/
- Use the MySQL Installer for Windows
- Remember the password you set for the `root` user during installation

**macOS:**

```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Create Database and User

**Connect to MySQL:**

```bash
# Windows (if added to PATH)
mysql -u root -p

# macOS/Linux
mysql -u root -p
```

**Create Database:**

```sql
CREATE DATABASE skillzcollab;
```

**Verify Database:**

```sql
SHOW DATABASES;
```

**Exit MySQL:**

```sql
EXIT;
```

### 3. Update Database Configuration

Edit `api/config/database.js` and update the password if needed:

```javascript
const dbConfig = {
  database: "skillzcollab",
  username: "root",
  password: "root", // ← Your actual MySQL root password
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  // ... rest of config
};
```

### 4. Alternative: Use Environment Variables

Create a `.env` file in your project root:

```bash
# Database Configuration
DB_NAME=skillzcollab
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=3306
```

Then update `api/config/database.js` to use:

```javascript
const dbConfig = {
  database: process.env.DB_NAME || "skillzcollab",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  // ... rest of config
};
```

## 🔧 Troubleshooting

### Common Issues:

1. **"Access denied for user 'root'@'localhost'"**

   - Check your MySQL root password
   - Verify the password in `api/config/database.js`

2. **"Connection refused"**

   - Make sure MySQL service is running
   - Check if port 3306 is available

3. **"Unknown database 'skillzcollab'"**

   - Create the database: `CREATE DATABASE skillzcollab;`

4. **"Can't connect to MySQL server"**
   - Make sure MySQL service is running
   - Check if MySQL is listening on localhost:3306

### Test MySQL Connection:

```bash
# Test if MySQL is running
mysql -u root -p -h localhost

# If successful, you'll see the MySQL prompt
# Type EXIT; to exit
```

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Update database password in api/config/database.js (if needed)

# 3. Start the server
npm start

# 4. Test the API
node test-trial.js
```

## 📝 Notes

- The default MySQL installation creates a user called `root`
- The password is set during installation
- The default port is 3306
- Database names are case-sensitive in some configurations
- MySQL uses port 3306 (not 5432 like PostgreSQL)

## 🆘 Still Having Issues?

1. Check MySQL logs:

   - Windows: MySQL data directory → \*.err files
   - macOS: `/usr/local/var/mysql/`
   - Linux: `/var/log/mysql/`

2. Verify MySQL is running:

   - Windows: Services app → MySQL
   - macOS: `brew services list`
   - Linux: `sudo systemctl status mysql`

3. Test connection manually:

   ```bash
   mysql -u root -p -d skillzcollab -h localhost
   ```

4. Reset MySQL root password (if needed):

   ```bash
   # Stop MySQL service first
   sudo systemctl stop mysql

   # Start MySQL in safe mode
   sudo mysqld_safe --skip-grant-tables &

   # Connect and reset password
   mysql -u root
   USE mysql;
   UPDATE user SET authentication_string=PASSWORD('new_password') WHERE User='root';
   FLUSH PRIVILEGES;
   EXIT;

   # Restart MySQL service
   sudo systemctl restart mysql
   ```

---

Once your database is configured, the API will automatically:

- Connect to MySQL
- Create/update database tables
- Be ready for the trial run! 🎉
