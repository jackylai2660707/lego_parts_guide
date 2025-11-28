const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'parts.json');

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
    const newData = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ success: true });
    });
});

// API: Login (Simple hardcoded check)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        res.json({ success: true, token: 'fake-jwt-token-123' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
