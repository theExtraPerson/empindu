# Empindu MySQL Setup Script for Windows PowerShell
# This script sets up MySQL database and user for local development

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Empindu MySQL Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Find MySQL installation
$mysqlPaths = @(
    "D:\Program Files\MySQL\MySQL Server 9.7\bin",
)

$mysqlCmd = $null
foreach ($path in $mysqlPaths) {
    $mysqlExe = Join-Path $path "mysql.exe"
    if (Test-Path $mysqlExe) {
        $mysqlCmd = $mysqlExe
        Write-Host "[✓] Found MySQL at: $path" -ForegroundColor Green
        break
    }
}

if ($null -eq $mysqlCmd) {
    Write-Host "[✗] MySQL not found in standard locations:" -ForegroundColor Red
    $mysqlPaths | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Check MySQL is installed" -ForegroundColor Yellow
    Write-Host "2. Add MySQL\bin to system PATH variable" -ForegroundColor Yellow
    Write-Host "3. Or specify path manually:" -ForegroundColor Yellow
    Write-Host "   `$mysqlCmd = 'D:\path\to\mysql.exe'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Setting up database and user..." -ForegroundColor Yellow


# Create SQL script file
$sqlScript = @"
CREATE DATABASE IF NOT EXISTS empindu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'empindu'@'localhost' IDENTIFIED BY 'Thriv3withnatur3.';
ALTER USER 'empindu'@'localhost' IDENTIFIED BY 'Thriv3withnatur3.';
GRANT ALL PRIVILEGES ON empindu_db.* TO 'empindu'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Database Setup Complete!' as Status;
"@

$tempSqlFile = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.sql'
Get-Content $tempSqlFile | & $mysqlCmd -u root -p

try {
    # Execute MySQL commands
    Write-Host "Executing SQL commands..." -ForegroundColor Yellow
    & $mysqlCmd -u root -p --execute="source $tempSqlFile"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[✓] MySQL setup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Go to backend: cd backend" -ForegroundColor Yellow
        Write-Host "2. Run migrations: python manage.py migrate" -ForegroundColor Yellow
        Write-Host "3. Load sample data: python manage.py load_sample_data" -ForegroundColor Yellow
        Write-Host "4. Start server: python manage.py runserver" -ForegroundColor Yellow
    }
    else {
        Write-Host ""
        Write-Host "[✗] MySQL setup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "1. Ensure MySQL Server is running" -ForegroundColor Yellow
        Write-Host "2. Check root password is correct" -ForegroundColor Yellow
        Write-Host "3. Try running manually:" -ForegroundColor Yellow
        Write-Host "   & '$mysqlCmd' -u root -p < '$tempSqlFile'" -ForegroundColor Gray
    }
}
finally {
    # Clean up temp file
    if (Test-Path $tempSqlFile) {
        Remove-Item $tempSqlFile
    }
}

Read-Host "Press Enter to continue"
