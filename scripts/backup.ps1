# scripts/backup.ps1
# PowerShell script to backup PostgreSQL database on Windows

param (
    [string]$DbUser = "attendance_user",
    [string]$DbName = "attendance_db",
    [string]$HostName = "localhost",
    [int]$Port = 5432,
    [string]$BackupDir = "backups",
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$TargetDir = Join-Path $ProjectRoot $BackupDir

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFile = Join-Path $TargetDir "backup_${DbName}_${Timestamp}.sql"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting Database Backup: $DbName" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Locate pg_dump.exe
$pgDump = Get-Command "pg_dump.exe" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $pgDump) {
    $pgVersions = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\pg_dump.exe" -ErrorAction SilentlyContinue
    if ($pgVersions) {
        $pgDump = $pgVersions[-1].FullName
    }
}

if (-not $pgDump) {
    Write-Error "pg_dump.exe not found in PATH or C:\Program Files\PostgreSQL\. Please ensure PostgreSQL tools are installed."
    exit 1
}

Write-Host "Using pg_dump: $pgDump"
Write-Host "Target file: $BackupFile"

try {
    $env:PGPASSWORD = "attendance_pass"
    & "$pgDump" -h $HostName -p $Port -U $DbUser -d $DbName -F c -b -f "$BackupFile" 2>$null
    
    if (Test-Path $BackupFile) {
        $rawSize = (Get-Item $BackupFile).Length / 1024
        $formattedSize = [math]::Round($rawSize, 2)
        Write-Host "Backup completed successfully! ($formattedSize KB)" -ForegroundColor Green
        
        # Cleanup old backups
        Write-Host "Cleaning up backups older than $RetentionDays days..." -ForegroundColor Gray
        $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
        Get-ChildItem -Path $TargetDir -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force
        Write-Host "Cleanup complete." -ForegroundColor Gray
    } else {
        Write-Error "Backup file was not created."
    }
} catch {
    Write-Error "Error during backup: $_"
} finally {
    $env:PGPASSWORD = $null
}
