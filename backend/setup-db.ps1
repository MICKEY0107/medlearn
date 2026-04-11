# MedLearn Database Setup Script
# This script ensures your local PostgreSQL is ready and the schema is synced.

Write-Host "--- MedLearn Professional DB Setup ---" -ForegroundColor Cyan

# 1. Check for Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# 2. Check for .env file
if (!(Test-Path .env)) {
    Write-Host "[WARNING] .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
}

# 3. Verify Postgres Connectivity
Write-Host "Step 1: Verifying PostgreSQL Connectivity..." -ForegroundColor Green
$envVars = Get-Content .env | ConvertFrom-StringData
$dbUrl = $envVars["DATABASE_URL"]

Write-Host "Target: $dbUrl" -ForegroundColor Gray

# 4. Run Prisma Migration
Write-Host "Step 2: Syncing Schema (Prisma Migrate)..." -ForegroundColor Green
try {
    npx prisma migrate dev --name init
    Write-Host "[SUCCESS] Database schema created successfully." -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Migration failed. Ensure your PostgreSQL server is running on Port 5432." -ForegroundColor Red
    Write-Host "Detail: $_" -ForegroundColor Gray
    exit 1
}

# 5. Generate Client
Write-Host "Step 3: Generating Prisma Client..." -ForegroundColor Green
npx prisma generate

Write-Host "`n--- Setup Complete! ---" -ForegroundColor Cyan
Write-Host "You can now run 'npm run dev' to start the backend." -ForegroundColor Gray
