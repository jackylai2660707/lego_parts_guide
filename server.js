const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'parts.json');
const CONFIG_FILE = path.join(__dirname, 'data', 'config.json');

// Load config
let config = { admin: { username: 'admin', password: 'admin' } };
try {
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    config = JSON.parse(configData);
} catch (err) {
    console.log('Config file not found, using defaults');
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// API: Get all parts
app.get('/api/parts', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read data' });
        }
        res.json(JSON.parse(data));
    });
});

// API: Save all parts (Admin)
app.post('/api/parts', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token !== 'fake-jwt-token-123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const newData = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ success: true });
    });
});

// API: Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === config.admin.username && password === config.admin.password) {
        res.json({ success: true, token: 'fake-jwt-token-123' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

// API: Change Password
app.post('/api/change-password', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token !== 'fake-jwt-token-123') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: '請填寫所有欄位' });
    }

    if (currentPassword !== config.admin.password) {
        return res.status(401).json({ error: '目前密碼不正確' });
    }

    if (newPassword.length < 4) {
        return res.status(400).json({ error: '新密碼至少需要4個字元' });
    }

    // Update config
    config.admin.password = newPassword;

    // Save to file
    fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: '儲存密碼失敗' });
        }
        res.json({ success: true, message: '密碼已成功更新' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
