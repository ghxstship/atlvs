#!/bin/bash

SERVICE=${1:-web}

echo "📋 Viewing logs for: $SERVICE"
docker-compose logs -f "$SERVICE"
