#!/bin/bash

# LEGO Parts Guide 部署腳本
# 此腳本用於快速部署和管理應用

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  LEGO Parts Guide 部署腳本${NC}"
echo -e "${BLUE}======================================${NC}\n"

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}警告: Docker 未安裝${NC}"
    echo "請先安裝 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 偵測 Docker Compose 命令（支援新舊版本）
DOCKER_COMPOSE=""
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    echo -e "${GREEN}✓ 偵測到新版 Docker Compose${NC}"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo -e "${GREEN}✓ 偵測到舊版 docker-compose${NC}"
else
    echo -e "${YELLOW}警告: Docker Compose 未安裝${NC}"
    echo "請先安裝 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# 確保 data 目錄存在
mkdir -p data

# 如果 parts.json 不存在，創建一個空的
if [ ! -f "data/parts.json" ]; then
    echo -e "${YELLOW}創建初始數據文件...${NC}"
    echo '[]' > data/parts.json
fi

# 停止並移除舊容器
echo -e "${BLUE}停止舊容器...${NC}"
$DOCKER_COMPOSE down 2>/dev/null || true

# 構建並啟動容器
echo -e "${BLUE}構建並啟動容器...${NC}"
$DOCKER_COMPOSE up -d --build

# 等待容器啟動
echo -e "${BLUE}等待服務啟動...${NC}"
sleep 3

# 檢查容器狀態
if docker ps | grep -q lego-parts-guide; then
    echo -e "${GREEN}✓ 部署成功！${NC}"
    echo -e "${GREEN}應用運行在: http://localhost:3000${NC}"
    echo -e "${GREEN}管理頁面: http://localhost:3000/admin.html${NC}"
    echo -e "\n${BLUE}常用指令:${NC}"
    echo -e "  查看日誌: ${YELLOW}$DOCKER_COMPOSE logs -f${NC}"
    echo -e "  停止服務: ${YELLOW}$DOCKER_COMPOSE down${NC}"
    echo -e "  重啟服務: ${YELLOW}$DOCKER_COMPOSE restart${NC}"
else
    echo -e "${YELLOW}✗ 部署可能失敗，請檢查日誌${NC}"
    $DOCKER_COMPOSE logs
    exit 1
fi
