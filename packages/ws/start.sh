#!/bin/sh
echo "=== ws start.sh is running! ENV: $NODE_ENV ==="

if [ "$NODE_ENV" = "production" ]; then
  cd /app/packages/ws
  npm run prod
else
  cd /app_dev/packages/ws
  npm run dev
fi