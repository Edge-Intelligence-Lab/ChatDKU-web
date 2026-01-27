#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/chatdku"
BACKUP_DIR="/var/www/chatdku_webapp_backups"
BUILD_DIR="out"  # where `npm run build` outputs

cd /path/to/your/project

# 1) Run tests
echo "Running tests..."
npm run test

echo
read -r -p "Tests passed. Deploy this build? [y/N]: " answer
case "$answer" in
  [Yy]* ) echo "Proceeding with deploy...";;
  * ) echo "Aborting deploy."; exit 0;;
esac

# 2) Build
echo "Running build..."
npm run build

# 3) Create backup of currently deployed version
timestamp="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -d "$APP_DIR" ]; then
  echo "Creating backup at ${BACKUP_DIR}/${timestamp}/"
  sudo rsync -av --delete "$APP_DIR"/ "${BACKUP_DIR}/${timestamp}/"
else
  echo "Warning: ${APP_DIR} does not exist or is not a directory; skipping backup."
fi

# 4) Deploy new build
echo "Deploying new build to ${APP_DIR}/"
sudo rsync -av --delete "${BUILD_DIR}/" "${APP_DIR}/"

echo "Done."


