#!/bin/bash

# FRONTEND SERVERS
SERVERS=(
  "root@10.9.22.90"
  "root@10.9.21.87"
)

WEB_DIR="/var/www/spa"
FRONTEND_DIR="./client-ui"

GUARDIAN="root@10.9.23.2"

echo "=========================="
echo " FRONTEND DEPLOY STARTED"
echo "=========================="

# ---------------------------------------------------------
echo "Disabling monitoring on Guardian VM..."
# ---------------------------------------------------------
ssh $GUARDIAN << EOF
systemctl stop frontend1-monitor 2>/dev/null
systemctl stop frontend2-monitor 2>/dev/null
systemctl stop nginx-monitor 2>/dev/null
EOF


# ---------------------------------------------------------
echo "Building frontend..."
# ---------------------------------------------------------

cd "$FRONTEND_DIR" || { 
  echo "ERROR: Frontend directory not found: $FRONTEND_DIR"
  exit 1
}

if [ ! -f package.json ]; then
  echo "ERROR: package.json not found inside $FRONTEND_DIR"
  exit 1
fi

npm run build || { 
  echo "ERROR: Frontend build failed."
  exit 1
}

echo "Frontend build completed successfully."


# ---------------------------------------------------------
echo "Deploying to frontend servers..."
# ---------------------------------------------------------

for SERVER in "${SERVERS[@]}"; do

  echo "-----------------------------------------"
  echo " Deploying to $SERVER"
  echo "-----------------------------------------"

  ssh $SERVER "rm -rf $WEB_DIR/* && mkdir -p $WEB_DIR" || {
    echo "ERROR clearing remote directory on $SERVER"
    exit 1
  }

  scp -r dist/* "$SERVER:$WEB_DIR/" || {
    echo "ERROR uploading files to $SERVER"
    exit 1
  }

  ssh $SERVER "nginx -t && systemctl reload nginx" || {
    echo "ERROR: nginx reload failed on $SERVER"
    exit 1
  }

  echo "Deployment finished on $SERVER"
done


# ---------------------------------------------------------
echo "Re-enabling monitoring on Guardian VM..."
# ---------------------------------------------------------
ssh $GUARDIAN << EOF
systemctl start frontend1-monitor 2>/dev/null
systemctl start frontend2-monitor 2>/dev/null
systemctl start nginx-monitor 2>/dev/null
EOF


echo "==============================="
echo " FRONTEND DEPLOY SUCCESSFUL"
echo "==============================="