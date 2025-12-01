#!/usr/bin/env pwsh
# Zoom Integration Setup Checker for Sconce

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Zoom Integration Setup Checker" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allGood = $true

# Check 1: Supabase CLI installed
Write-Host "Checking Supabase CLI..." -NoNewline
$supabaseInstalled = $false
try {
    $version = & supabase --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ Installed ($version)" -ForegroundColor Green
        $supabaseInstalled = $true
    } else {
        Write-Host " ✗ NOT INSTALLED" -ForegroundColor Red
        Write-Host "  Install: npm install -g supabase" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host " ✗ NOT INSTALLED" -ForegroundColor Red
    Write-Host "  Install: npm install -g supabase" -ForegroundColor Yellow
    $allGood = $false
}

# Check 2: Edge Function file exists
Write-Host "Checking Edge Function file..." -NoNewline
$functionPath = "supabase\functions\create-zoom-meeting\index.ts"
if (Test-Path $functionPath) {
    Write-Host " ✓ Found" -ForegroundColor Green
} else {
    Write-Host " ✗ NOT FOUND" -ForegroundColor Red
    Write-Host "  Expected: $functionPath" -ForegroundColor Yellow
    $allGood = $false
}

# Check 3: ZoomMeetingDialog component updated
Write-Host "Checking ZoomMeetingDialog..." -NoNewline
$dialogPath = "src\components\instructor\ZoomMeetingDialog.jsx"
if (Test-Path $dialogPath) {
    $content = Get-Content $dialogPath -Raw
    if ($content -match "supabase\.functions\.invoke") {
        Write-Host " ✓ Updated with API call" -ForegroundColor Green
    } else {
        Write-Host " ⚠ Found but may need update" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host " ✗ NOT FOUND" -ForegroundColor Red
    $allGood = $false
}

# Check 4: Supabase project linked
Write-Host "Checking Supabase project link..." -NoNewline
if ($supabaseInstalled) {
    try {
        $status = & supabase status 2>&1
        if ($status -match "supabase_" -or $status -match "Running") {
            Write-Host " ✓ Linked or Running" -ForegroundColor Green
        } else {
            Write-Host " ⚠ Not linked" -ForegroundColor Yellow
            Write-Host "  Run: supabase link --project-ref your-project-ref" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ⚠ Cannot check status" -ForegroundColor Yellow
        Write-Host "  Run: supabase login && supabase link" -ForegroundColor Yellow
    }
} else {
    Write-Host " ⚠ Skipped (CLI not installed)" -ForegroundColor Yellow
}

# Check 5: Documentation created
Write-Host "Checking documentation..." -NoNewline
if ((Test-Path "ZOOM_INTEGRATION_GUIDE.md") -and (Test-Path "ZOOM_QUICK_START.md")) {
    Write-Host " ✓ Complete" -ForegroundColor Green
} else {
    Write-Host " ⚠ Incomplete" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  Status: READY FOR DEPLOYMENT ✓" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Create Zoom Server-to-Server OAuth app" -ForegroundColor White
    Write-Host "2. Set Supabase secrets (see ZOOM_QUICK_START.md)" -ForegroundColor White
    Write-Host "3. Deploy: supabase functions deploy create-zoom-meeting" -ForegroundColor White
} else {
    Write-Host "  Status: SETUP INCOMPLETE ⚠" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "Please fix the issues above before proceeding." -ForegroundColor Yellow
}

Write-Host ""
