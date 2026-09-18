#!/bin/bash
# scripts/backup.sh
# Script to backup PostgreSQL database

# Settings
BACKUP_DIR="/var/backups/attendance_db"
CONTAINER_NAME="attendance_db_prod"
DB_USER="attendance_user"
DB_NAME="attendance_db"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILE_NAME="backup_${DATE}.sql.gz"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

echo "Starting backup of ${DB_NAME}..."

# Execute pg_dump inside the container and compress on the host
docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME | gzip > ${BACKUP_DIR}/${FILE_NAME}

if [ $? -eq 0 ]; then
  echo "✅ Backup successful: ${BACKUP_DIR}/${FILE_NAME}"
  
  # Delete old backups
  echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
  find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
  echo "Cleanup complete."
else
  echo "❌ Backup failed!"
  exit 1
fi
