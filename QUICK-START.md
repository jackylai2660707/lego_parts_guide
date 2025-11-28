# 🚀 快速部署指南

## 方法一：直接使用 Docker Compose（最簡單）⚡

```bash
# 進入項目目錄
cd /docker/lego_parts_guide

# 確保 data 目錄存在
mkdir -p data

# 如果 parts.json 不存在，創建空文件
[ ! -f data/parts.json ] && echo '[]' > data/parts.json

# 一鍵啟動（新版 Docker）
docker compose up -d --build
```

**就這麼簡單！** 🎉

---

## 方法二：使用改進的部署腳本

```bash
# 上傳新版 deploy.sh 後執行
chmod +x deploy.sh
./deploy.sh
```

現在腳本已經支援新舊版本的 Docker Compose！

---

## 常用管理指令

```bash
# 查看運行狀態
docker compose ps

# 查看實時日誌
docker compose logs -f

# 停止服務
docker compose down

# 重啟服務
docker compose restart

# 重新構建並啟動
docker compose up -d --build

# 查看容器資源使用情況
docker stats lego-parts-guide
```

---

## 訪問應用

部署完成後，訪問：

- **主頁**: `http://your-server-ip:3000`
- **遊戲**: `http://your-server-ip:3000/game.html`
- **管理**: `http://your-server-ip:3000/admin.html`

**默認管理員帳號**:
- 用戶名: `admin`
- 密碼: `admin`

⚠️ **生產環境請務必修改密碼！**

---

## 故障排查

### 檢查容器是否在運行
```bash
docker ps | grep lego
```

### 查看詳細日誌
```bash
docker compose logs --tail=100
```

### 檢查端口佔用
```bash
netstat -tulpn | grep 3000
# 或
ss -tulpn | grep 3000
```

### 完全重置
```bash
docker compose down
docker compose up -d --build --force-recreate
```

---

## 數據備份

```bash
# 備份數據
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz data/

# 恢復數據
tar -xzf backup-20231124-120000.tar.gz
```

---

## 更新應用

```bash
# 1. 停止容器
docker compose down

# 2. 拉取新代碼或覆蓋文件

# 3. 重新構建並啟動
docker compose up -d --build
```

---

## 使用 Nginx 反向代理（可選）

如果想用域名或 HTTPS，創建 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/lego
```

內容：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

啟用配置：
```bash
sudo ln -s /etc/nginx/sites-available/lego /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

配置 HTTPS：
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 生產環境建議

### 1. 修改管理員密碼
編輯 `server.js`，修改第 41 行的密碼

### 2. 限制管理頁面訪問
在 Nginx 中添加：
```nginx
location /admin.html {
    allow your.ip.address;
    deny all;
    proxy_pass http://localhost:3000;
}
```

### 3. 設定自動備份
```bash
# 添加到 crontab
crontab -e

# 每天凌晨 2 點備份
0 2 * * * cd /docker/lego_parts_guide && tar -czf /backup/lego-$(date +\%Y\%m\%d).tar.gz data/
```

### 4. 監控容器
```bash
# 安裝 ctop（Docker 監控工具）
sudo wget https://github.com/bcicen/ctop/releases/download/v0.7.7/ctop-0.7.7-linux-amd64 -O /usr/local/bin/ctop
sudo chmod +x /usr/local/bin/ctop

# 監控
ctop
```

---

## 完整部署流程示例

```bash
# 1. 上傳項目到服務器
scp -r lego_parts_guide root@your-server:/docker/

# 2. SSH 到服務器
ssh root@your-server

# 3. 進入目錄
cd /docker/lego_parts_guide

# 4. 創建數據目錄
mkdir -p data
echo '[]' > data/parts.json

# 5. 啟動
docker compose up -d --build

# 6. 檢查狀態
docker compose ps
docker compose logs -f

# 7. 訪問測試
curl http://localhost:3000

# 完成！🎉
```

---

## 需要幫助？

- 部署問題：檢查日誌 `docker compose logs`
- 端口衝突：修改 `docker-compose.yml` 中的端口映射
- 權限問題：確保 data 目錄可寫入
- 網路問題：檢查防火牆設定

---

**文檔更新**: 2025-11-24
**兼容性**: 支援新舊版本 Docker Compose
**狀態**: ✅ 已測試可用
