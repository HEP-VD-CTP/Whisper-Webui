#!/bin/sh
echo "=== worker start.sh is running! ENV: $NODE_ENV ==="

if [ "$NODE_ENV" = "production" ]; then
  cd /app/packages/worker
  npm run prod
else
  cd /app_dev/packages/worker
  npm run dev
fi