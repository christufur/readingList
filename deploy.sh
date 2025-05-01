#!/bin/bash

# Remove the image
podman rm -f readinglist_app_1

# Create a new image
podman build -t readinglist_app .

# Stop any existing containers
podman-compose down

# Build and start containers with your university port
podman-compose up -d

echo -e "\\n\\nApplication running at https://cmeraz.cs382.net"