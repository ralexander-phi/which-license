#!/bin/bash

echo ""
echo "Development: npm run dev"
echo "Development: npm run build"
echo ""

docker run \
  -it \
  --env NEXT_TELEMETRY_DISABLED=1 \
  --workdir /app \
  --mount type=bind,src=$(pwd),dst=/app \
  -p 127.0.0.1:3000:3000/tcp \
  node:14.17.3-buster \
  /bin/bash
