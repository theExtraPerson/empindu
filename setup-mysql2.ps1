# ============================================
# Empindu MySQL Bootstrap (Production-ready)
# ============================================

Write-Host "`n=== Empindu DB Bootstrap ===`n" -ForegroundColor Cyan

# Load .env
$envFile = ".env"
if (!(Test-Path $envFile)) {
    Write-Host "[✗] .env file not found" -ForegroundColor Red
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match "=") {
        $name, $value = $_ -split "=", 2
        [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
    }
}

# Resolve MySQL
$mysqlCmd = "mysql"
try {
    & $mysqlCmd --version > $null
} catch {
    Write-Host "[✗] mysql not in PATH" -ForegroundColor Red
    exit 1
}

# Build SQL (idempotent)
$sql = @"
CREATE DATABASE IF NOT EXISTS empindu_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'empindu'@'localhost'
IDENTIFIED BY 'Thriv3withnatur3.';

ALTER USER 'empindu'@'localhost'
IDENTIFIED BY 'Thriv3withnatur3.';

CREATE USER IF NOT EXISTS 'empindu'@'%'
IDENTIFIED BY 'Thriv3withnatur3.';

GRANT ALL PRIVILEGES ON empindu_db.* TO 'empindu'@'localhost';
GRANT ALL PRIVILEGES ON empindu_db.* TO 'empindu'@'%';

FLUSH PRIVILEGES;
"@

# Write temp SQL
$tempSql = [System.IO.Path]::ChangeExtension([System.IO.Path]::GetTempFileName(), ".sql")
$sql | Set-Content $tempSql -Encoding UTF8

Write-Host "[*] Applying DB bootstrap..." -ForegroundColor Yellow

Get-Content $tempSql | & $mysqlCmd `
    -u $env:MYSQL_ROOT_USER `
    -p$env:MYSQL_ROOT_PASSWORD `
    -h $env:DB_HOST

if ($LASTEXITCODE -eq 0) {
    Write-Host "[✓] Database ready for migrations" -ForegroundColor Green
} else {
    Write-Host "[✗] Bootstrap failed (exit $LASTEXITCODE)" -ForegroundColor Red
}

Remove-Item $tempSql -ErrorAction SilentlyContinue