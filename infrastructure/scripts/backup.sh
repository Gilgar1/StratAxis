#!/bin/bash

# StratAxis Database Backup Script
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
DB_NAME="strataxis"

mkdir -p $BACKUP_DIR

echo "Starting backup for $DB_NAME..."
# pg_dump $DB_NAME > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

echo "Backup completed: $BACKUP_DIR/db_backup_$TIMESTAMP.sql"
# Optional: remove backups older than 30 days
# find $BACKUP_DIR -type f -name "*.sql" -mtime +30 -delete
