#!/bin/bash
# scripts/restore.sh
# Script to restore PostgreSQL database inside Docker or Linux

set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore.sh <path_to_backup_file.sql.gz>"
  exit 1
fi

BACKUP_FILE=$1
CONTAINER_NAME="attendance_db_prod"
DB_USER="attendance_user"
DB_NAME="attendance_db"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "🔄 Restoring database $DB_NAME from $BACKUP_FILE..."

# Check if file is gzipped
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
else
  cat "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
fi

echo "✅ Database restore completed successfully!"
