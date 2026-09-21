# scripts/restore.ps1
# PowerShell script to restore PostgreSQL database from a backup file on Windows

param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$DbUser = "attendance_user",
    [string]$DbName = "attendance_db",
    [string]$HostName = "localhost",
    [int]$Port = 5432
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found: $BackupFile"
    exit 1
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Restoring Database: $DbName" -ForegroundColor Cyan
Write-Host "From file: $BackupFile" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Locate pg_restore.exe
$pgRestore = Get-Command "pg_restore.exe" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $pgRestore) {
    $pgVersions = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\pg_restore.exe" -ErrorAction SilentlyContinue
    if ($pgVersions) {
        $pgRestore = $pgVersions[-1].FullName
    }
}

if (-not $pgRestore) {
    Write-Error "pg_restore.exe not found in PATH or C:\Program Files\PostgreSQL\. Please ensure PostgreSQL tools are installed."
    exit 1
}

try {
    $env:PGPASSWORD = "attendance_pass"
    Write-Host "Running pg_restore..."
    & "$pgRestore" -h $HostName -p $Port -U $DbUser -d $DbName -c --if-exists "$BackupFile"
    Write-Host "Database restore completed successfully!" -ForegroundColor Green
} catch {
    Write-Error "Error during restore: $_"
} finally {
    $env:PGPASSWORD = $null
}
