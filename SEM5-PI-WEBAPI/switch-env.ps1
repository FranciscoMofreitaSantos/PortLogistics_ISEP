#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

$HTTP_DIR = "./http"
$NGINX_URL = "http://10.9.23.188"
$LOCAL_URL = "http://localhost:5008"

# Check if argument provided
if ($args.Count -eq 0) {
    Write-Host "Usage: .\switch-env.ps1 <nginx|local>"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  nginx - Use Nginx Load Balancer ($NGINX_URL)"
    Write-Host "  local - Use local development ($LOCAL_URL)"
    exit 1
}

# Determine which URL to use
$target = $args[0].ToLower()

if ($target -eq "nginx") {
    $TARGET_URL = $NGINX_URL
    Write-Host "Updating all .http files to use Nginx Load Balancer..." -ForegroundColor Cyan
} elseif ($target -eq "local") {
    $TARGET_URL = $LOCAL_URL
    Write-Host "Updating all .http files to use local development..." -ForegroundColor Cyan
} else {
    Write-Host "Error: Invalid option. Use 'nginx' or 'local'" -ForegroundColor Red
    exit 1
}

if (Test-Path $HTTP_DIR) {
    Get-ChildItem -Path $HTTP_DIR -Filter *.http | ForEach-Object {
        $file = $_.FullName
        $content = Get-Content $file -Raw
        
        if ($content -match "(?m)^@portURL") {
            # Replace existing @portURL line
            $newContent = $content -replace "(?m)^@portURL.*", "@portURL = $TARGET_URL"
            $newContent | Set-Content $file -NoNewline
            Write-Host "  ✓ Updated: $($_.Name)" -ForegroundColor Green
        } else {
            # Add @portURL at the beginning
            "@portURL = $TARGET_URL`n$content" | Set-Content $file -NoNewline
            Write-Host "  ✓ Added to: $($_.Name)" -ForegroundColor Green
        }
    }
    Write-Host "All .http files now point to: $TARGET_URL" -ForegroundColor Cyan
} else {
    Write-Host "Directory $HTTP_DIR not found!" -ForegroundColor Red
    exit 1
}