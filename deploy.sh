#!/usr/bin/env bash
# 星芽服务器更新三连：拉代码 → 重建起站 → 看状态。
# 用法（服务器上 /opt/app/starsprout 目录内）：./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

git pull --ff-only
docker compose up -d --build
docker compose ps
