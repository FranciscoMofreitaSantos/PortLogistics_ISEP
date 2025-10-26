#!/usr/bin/env pwsh
param(
    [Parameter(Mandatory=$true)]
    [string]$Target
)

$ErrorActionPreference = "Stop"

$PROJECT_NAME = "SEM5-PI-WEBAPI"
$VM_USER = "root"
$VM_PATH = "/var/www/sem5_api"
$RUNTIME = "linux-x64"
$NGINX_SERVER = "10.9.23.188"

# Define servers
$SERVER_1 = "10.9.21.87"
$SERVER_2 = "10.9.23.188"
$SERVER_3 = "10.9.23.173"
$SERVER_4 = "10.9.23.147"

# Show usage if no argument
if (-not $Target) {
    Write-Output "Usage: .\deploy-safe.ps1 <server_number|all>"
    Write-Output ""
    Write-Output "Available servers:"
    Write-Output "  1 - $SERVER_1"
    Write-Output "  2 - $SERVER_2"
    Write-Output "  3 - $SERVER_3"
    Write-Output "  4 - $SERVER_4"
    Write-Output "  all - Deploy to all servers"
    exit 1
}

# Determine which servers to deploy
$DEPLOY_TO = @()

switch ($Target.ToLower()) {
    "all" {
        $DEPLOY_TO = @($SERVER_1, $SERVER_2, $SERVER_3, $SERVER_4)
        Write-Output "Deploying to ALL servers..."
    }
    "1" {
        $DEPLOY_TO = @($SERVER_1)
        Write-Output "Deploying to server 1 ($SERVER_1)..."
    }
    "2" {
        $DEPLOY_TO = @($SERVER_2)
        Write-Output "Deploying to server 2 ($SERVER_2)..."
    }
    "3" {
        $DEPLOY_TO = @($SERVER_3)
        Write-Output "Deploying to server 3 ($SERVER_3)..."
    }
    "4" {
        $DEPLOY_TO = @($SERVER_4)
        Write-Output "Deploying to server 4 ($SERVER_4)..."
    }
    default {
        Write-Output "Error: Invalid server number. Use 1, 2, 3, 4, or 'all'"
        exit 1
    }
}

# Check if deploying to Nginx server - need to stop Guardian
$STOP_GUARDIAN = $false
foreach ($VM_HOST in $DEPLOY_TO) {
    if ($VM_HOST -eq $NGINX_SERVER) {
        $STOP_GUARDIAN = $true
        break
    }
}

# Stop Guardian if deploying to Nginx server
if ($STOP_GUARDIAN) {
    Write-Output ""
    Write-Output "Stopping API Guardian on Nginx server..."
    ssh "${VM_USER}@${NGINX_SERVER}" "sudo systemctl stop api-guardian" 2>$null
    Write-Output "Guardian stopped"
}

# Remove old publish folder
Write-Output "Removing old publish folder..."
if (Test-Path "./publish") {
    Remove-Item -Recurse -Force ./publish
}

Write-Output "Publishing .NET project ($PROJECT_NAME)..."
dotnet publish -c Release -r $RUNTIME --self-contained true -o ./publish

if ($LASTEXITCODE -ne 0) {
    Write-Output "Error publishing project!"
    exit 1
}

Write-Output "Publication completed! Preparing transfer..."

# Deploy to selected server(s)
foreach ($VM_HOST in $DEPLOY_TO) {
    Write-Output ""
    Write-Output "=========================================="
    Write-Output "Deploying to: $VM_HOST"
    Write-Output "=========================================="
    
    Write-Output "   -> Local directory: ./publish"
    Write-Output "   -> Remote destination: ${VM_USER}@${VM_HOST}:${VM_PATH}"
    
    # Copy files to VM via SCP
    Write-Output "Transferring files..."
    scp -r ./publish/* "${VM_USER}@${VM_HOST}:${VM_PATH}/"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Output "Error transferring files to $VM_HOST!"
        continue
    }
    
    # Restart remote server
    Write-Output "Restarting remote server..."
    ssh "${VM_USER}@${VM_HOST}" "pkill -f $PROJECT_NAME || true; cd $VM_PATH && nohup ./$PROJECT_NAME --urls http://0.0.0.0:5008 > /dev/null 2>&1 &"
    
    Write-Output "Deploy completed on $VM_HOST"
    Write-Output "   Server available at: http://${VM_HOST}:5008/api/"
}

# Restart Guardian if it was stopped
if ($STOP_GUARDIAN) {
    Write-Output ""
    Write-Output "Waiting for API to stabilize before restarting Guardian..."
    Start-Sleep -Seconds 10
    
    Write-Output "Restarting API Guardian on Nginx server..."
    ssh "${VM_USER}@${NGINX_SERVER}" "sudo systemctl start api-guardian"
    
    Write-Output "Verifying Guardian status..."
    Start-Sleep -Seconds 2
    ssh "${VM_USER}@${NGINX_SERVER}" "sudo systemctl status api-guardian --no-pager" 2>$null
    
    Write-Output "Guardian restarted successfully"
}

Write-Output ""
Write-Output "=========================================="
Write-Output "Deployment completed successfully!"
Write-Output "=========================================="