#!/bin/bash

# Stop any existing containers
podman-compose down

# Build and start containers with your university port
podman-compose up -d

echo "Deployment complete! Application running at https://cmeraz.cs382.net"