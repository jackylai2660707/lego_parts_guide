# LEGO Parts Guide - 部署指南

本指南提供多種部署方式，推薦使用 **方案一：Docker Compose（最簡單）**。

---

## 方案一：Docker Compose 部署（推薦）⭐

### 優點
- ✅ 最簡單，一鍵部署
- ✅ 容易管理和維護
- ✅ 數據持久化
- ✅ 自動重啟
- ✅ 容易遷移到其他主機

### 前置需求
1. 安裝 Docker 和 Docker Compose
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install docker-compose-plugin

# CentOS/RHEL
sudo yum install docker docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
```

### 部署步驟

#### 1. 上傳項目到 Linux 主機
```bash
# 在本地電腦上，將項目打包
tar -czf lego-parts-guide.tar.gz .

# 上傳到 Linux 主機
scp lego-parts-guide.tar.gz user@your-server:/home/user/

# 在 Linux 主機上解壓
ssh user@your-server
mkdir -p ~/lego-parts-guide
cd ~/lego-parts-guide
tar -xzf ../lego-parts-guide.tar.gz
```

#### 2. 一鍵部署
```bash
chmod +x deploy.sh
./deploy.sh
```

#### 3. 訪問應用
- 主頁: `http://your-server-ip:3000`
- 管理頁面: `http://your-server-ip:3000/admin.html`

### 常用管理指令

```bash
# 查看運行狀態
docker-compose ps

# 查看實時日誌
docker-compose logs -f

# 停止服務
docker-compose down

# 啟動服務
docker-compose up -d

# 重啟服務
docker-compose restart

# 更新代碼後重新部署
./deploy.sh

# 備份數據
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# 恢復數據
tar -xzf backup-20231124.tar.gz
```

---

## 方案二：Systemd 服務（傳統方式）

### 適用場景
- 不想使用 Docker
- 更直接的系統整合

### 部署步驟

#### 1. 安裝 Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

#### 2. 上傳並安裝項目
```bash
# 上傳項目到 /opt/lego-parts-guide
sudo mkdir -p /opt/lego-parts-guide
sudo chown $USER:$USER /opt/lego-parts-guide
cd /opt/lego-parts-guide

# 解壓項目文件（假設已上傳）
tar -xzf ~/lego-parts-guide.tar.gz

# 安裝依賴
npm install --production
```

#### 3. 創建 Systemd 服務
```bash
sudo nano /etc/systemd/system/lego-parts-guide.service
```

貼上以下內容：
```ini
[Unit]
Description=LEGO Parts Guide
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/lego-parts-guide
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

#### 4. 啟動服務
```bash
sudo systemctl daemon-reload
sudo systemctl enable lego-parts-guide
sudo systemctl start lego-parts-guide

# 查看狀態
sudo systemctl status lego-parts-guide

# 查看日誌
sudo journalctl -u lego-parts-guide -f
```

---

## 方案三：使用 PM2 管理（Node.js 專用）

### 優點
- 專為 Node.js 設計
- 自動重啟
- 負載均衡
- 日誌管理

### 部署步驟

#### 1. 安裝 PM2
```bash
sudo npm install -g pm2
```

#### 2. 啟動應用
```bash
cd /path/to/lego-parts-guide
pm2 start server.js --name lego-parts-guide

# 設定開機自啟
pm2 startup
pm2 save
```

#### 3. 管理應用
```bash
# 查看狀態
pm2 status

# 查看日誌
pm2 logs lego-parts-guide

# 重啟
pm2 restart lego-parts-guide

# 停止
pm2 stop lego-parts-guide

# 查看監控
pm2 monit
```

---

## 使用 Nginx 反向代理（可選，推薦）

如果你想使用域名訪問或啟用 HTTPS，建議配置 Nginx。

### 1. 安裝 Nginx
```bash
sudo apt-get install nginx  # Ubuntu/Debian
sudo yum install nginx      # CentOS/RHEL
```

### 2. 配置 Nginx
```bash
sudo nano /etc/nginx/sites-available/lego-parts-guide
```

貼上以下內容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改成你的域名或 IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. 啟用配置
```bash
sudo ln -s /etc/nginx/sites-available/lego-parts-guide /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. 配置 HTTPS（使用 Let's Encrypt）
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 防火牆配置

### UFW（Ubuntu/Debian）
```bash
sudo ufw allow 3000/tcp  # 如果直接訪問
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### firewalld（CentOS/RHEL）
```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 數據備份

### 自動備份腳本
創建 `/opt/backup-lego.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
SOURCE_DIR="/opt/lego-parts-guide/data"

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/lego-backup-$(date +%Y%m%d-%H%M%S).tar.gz $SOURCE_DIR

# 保留最近 7 天的備份
find $BACKUP_DIR -name "lego-backup-*.tar.gz" -mtime +7 -delete
```

設定定時任務（每天凌晨 2 點備份）：
```bash
chmod +x /opt/backup-lego.sh
crontab -e

# 添加：
0 2 * * * /opt/backup-lego.sh
```

---

## 監控和日誌

### Docker 方式
```bash
# 實時日誌
docker-compose logs -f

# 查看最近 100 行日誌
docker-compose logs --tail=100

# 檢查容器健康狀態
docker-compose ps
```

### Systemd 方式
```bash
# 查看日誌
sudo journalctl -u lego-parts-guide -f

# 查看最近錯誤
sudo journalctl -u lego-parts-guide -p err
```

### PM2 方式
```bash
pm2 logs lego-parts-guide
pm2 monit
```

---

## 故障排查

### 應用無法訪問
```bash
# 檢查服務是否運行
docker-compose ps            # Docker 方式
sudo systemctl status lego-parts-guide  # Systemd 方式
pm2 status                   # PM2 方式

# 檢查端口是否被佔用
sudo netstat -tulpn | grep 3000

# 檢查防火牆
sudo ufw status             # Ubuntu
sudo firewall-cmd --list-all  # CentOS
```

### 數據丟失
```bash
# 確認 data 目錄權限
ls -la data/
chmod 755 data/
chmod 644 data/parts.json

# Docker 方式：確認 volume 掛載
docker-compose config
```

---

## 效能優化

### 1. 使用 Nginx 緩存靜態資源
在 Nginx 配置中添加：
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    proxy_pass http://localhost:3000;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. 啟用 Gzip 壓縮
在 Nginx 配置中：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

---

## 安全建議

1. **修改默認密碼**: 在生產環境中修改 `admin/admin` 登錄憑證
2. **使用 HTTPS**: 使用 Let's Encrypt 配置免費 SSL 證書
3. **限制管理頁面訪問**: 使用 Nginx 配置 IP 白名單
4. **定期備份**: 設定自動備份腳本
5. **更新依賴**: 定期運行 `npm audit` 檢查安全漏洞

---

## 總結

| 方案 | 難度 | 推薦度 | 適用場景 |
|------|------|--------|----------|
| Docker Compose | ⭐ | ⭐⭐⭐⭐⭐ | 最推薦，適合所有場景 |
| Systemd | ⭐⭐ | ⭐⭐⭐ | 傳統 Linux 環境 |
| PM2 | ⭐⭐ | ⭐⭐⭐⭐ | Node.js 專案 |
| Nginx 反向代理 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 生產環境必備 |

**建議組合**: Docker Compose + Nginx 反向代理 + HTTPS
