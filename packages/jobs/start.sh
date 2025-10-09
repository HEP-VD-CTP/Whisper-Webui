#!/bin/sh
echo "=== jobs start.sh is running! ENV: $NODE_ENV ==="

if [ "$NODE_ENV" = "production" ]; then
  cd /app/packages/jobs
  npm run prod
else
  cd /app_dev/packages/jobs
  npm run dev
fi