# Empindu Backend - Quick Start Script
# Thrive With Nature
# For Windows PowerShell

Write-Host "=== EMPINDU BACKEND SETUP ===" -ForegroundColor Green
Write-Host "Thrive With Nature" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create virtual environment (if not exists)
if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
} else {
    Write-Host "Virtual environment already exists." -ForegroundColor Gray
}

# Step 2: Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\.venv\Scripts\Activate.ps1

# Step 3: Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Step 4: Create .env file from example
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "IMPORTANT: Edit .env and configure your environment variables!" -ForegroundColor Red
} else {
    Write-Host ".env file already exists." -ForegroundColor Gray
}

# Step 5: Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
python manage.py migrate

# Step 6: Create superuser
Write-Host ""
Write-Host "=== CREATE SUPERUSER ===" -ForegroundColor Green
Write-Host "Create your admin account to access the Unfold admin panel" -ForegroundColor Cyan
python manage.py createsuperuser

# Step 7: Success message
Write-Host ""
Write-Host "=== SETUP COMPLETE! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start Docker services: cd ..\infrastructure; docker compose up -d" -ForegroundColor White
Write-Host "2. Run backend server: python manage.py runserver" -ForegroundColor White
Write-Host "3. Access admin: http://localhost:8000/admin" -ForegroundColor White
Write-Host "4. Access API docs: http://localhost:8000/api/v1/docs" -ForegroundColor White
Write-Host ""
Write-Host "Thrive With Nature 🌿" -ForegroundColor Green
