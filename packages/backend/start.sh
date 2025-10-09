#!/bin/sh
echo "=== backend start.sh is running! ENV: $NODE_ENV ==="

if [ "$NODE_ENV" = "production" ]; then
  cd /app/packages/frontend
  npm run prod
else
  cd /app_dev/packages/frontend
  npm run dev
fi