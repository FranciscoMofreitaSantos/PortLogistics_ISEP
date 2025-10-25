#!/bin/bash
set -e 

PROJECT_NAME="SEM5_PI_WEBAPI"
VM_USER="root"
VM_HOST="10.9.21.87"
VM_PATH="/var/www/sem5_api"
RUNTIME="linux-x64"

# Remove old publish folder
echo "Removing old publish folder..."
rm -rf ./publish

echo "Publishing .NET project ($PROJECT_NAME)..."
dotnet publish -c Release -r $RUNTIME --self-contained true -o ./publish

echo "Publication completed! Preparing transfer..."
echo "   -> Local directory: ./publish"
echo "   -> Remote destination: $VM_USER@$VM_HOST:$VM_PATH"

# Copy files to VM via SCP
scp -r ./publish/* $VM_USER@$VM_HOST:$VM_PATH/

# Restart remote server
echo "Restarting remote server..."
ssh $VM_USER@$VM_HOST "pkill -f $PROJECT_NAME.dll || true; cd $VM_PATH && nohup ./SEM5_PI_WEBAPI > /dev/null 2>&1 &"

echo "Deploy completed successfully!"
echo "Server available at: http://$VM_HOST:5008/api/"