-- Campus Trading Platform Database Initialization
-- This file is executed when MySQL container starts for the first time

-- Create database if not exists (already created by MYSQL_DATABASE env var)
-- But we ensure charset is correct
ALTER DATABASE campus_trading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant permissions
GRANT ALL PRIVILEGES ON campus_trading.* TO 'campus_user'@'%';
FLUSH PRIVILEGES;

-- Note: Tables will be automatically created by TypeORM synchronize feature
