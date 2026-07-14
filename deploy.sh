#!/bin/bash
set -e

# Colors for nice output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Rotaract MEC Website Docker Deployment ===${NC}"

# Check if running with sudo/root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Warning: This script is not running as root. If your user does not have permission to run docker, it may fail.${NC}"
  echo -e "You can run this script with sudo: ${GREEN}sudo ./deploy.sh${NC}"
  echo ""
fi

# Clean up conflicting containers
echo -e "${BLUE}Checking for existing conflicting containers...${NC}"
CONFLICTING_CONTAINERS=("rotaract" "rotaract-mec-website" "rotaract-mec-strapi")
for container in "${CONFLICTING_CONTAINERS[@]}"; do
  if docker ps -a --format '{{.Names}}' | grep -Eq "^${container}$"; then
    echo -e "${YELLOW}Stopping and removing existing container: ${container}...${NC}"
    docker rm -f "$container" || true
  fi
done

# Ensure backend env file exists
if [ ! -f "backend/.env" ]; then
  echo -e "${YELLOW}Warning: backend/.env not found. Copying backend/.env.example to backend/.env...${NC}"
  cp backend/.env.example backend/.env
  echo -e "${GREEN}Created backend/.env. Please configure any production secrets if needed.${NC}"
fi

# Ensure root env file exists
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Warning: .env not found. Copying .env.example to .env...${NC}"
  cp .env.example .env
  echo -e "${GREEN}Created .env.${NC}"
fi

# Determine if 'docker compose' or 'docker-compose' should be used
COMPOSE_CMD=""
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif docker-compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo -e "${RED}Error: Neither 'docker compose' nor 'docker-compose' could be found.${NC}"
  echo -e "Please install docker-compose and try again."
  exit 1
fi

echo -e "${BLUE}Using Compose command: ${GREEN}${COMPOSE_CMD}${NC}"

# Stop and remove existing Compose services
echo -e "${BLUE}Stopping existing Compose services (if any)...${NC}"
$COMPOSE_CMD down --remove-orphans || true

# Build and start services
echo -e "${BLUE}Building and starting services in detached mode...${NC}"
$COMPOSE_CMD up --build -d

echo -e "${GREEN}=== Deployment Successful! ===${NC}"
echo -e "${BLUE}Services are now running:${NC}"
echo -e "  - ${GREEN}Frontend Website:${NC} http://localhost:80 (or http://localhost)"
echo -e "  - ${GREEN}Strapi Backend:${NC}   http://localhost:1337"
echo -e "  - ${GREEN}Strapi Admin Panel:${NC} http://localhost:1337/admin"
echo ""
echo -e "To view logs, you can run:"
echo -e "  ${YELLOW}sudo $COMPOSE_CMD logs -f${NC}"
