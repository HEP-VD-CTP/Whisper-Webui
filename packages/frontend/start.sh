#!/bin/sh
echo "=== frontend start.sh is running! ENV: $NODE_ENV ==="

if [ "$NODE_ENV" = "production" ]; then
  cd /app/packages/frontend
  npm run build
  tsx ./dist/ssr/index.js
else
  cd /app_dev/packages/frontend
  npm run dev
fi