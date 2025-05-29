//node.js

const express = require('express');
const fs = require('fs');
const app = express();
const DATA_FILE = './LTS/laundryData.json';

app.use(express.json());

// Save new transaction
app.post('/api/transactions', (req, res) => {
    const newTransaction = req.body;
    let data = {};
    if (fs.existsSync(DATA_FILE)) {
        data = JSON.parse(fs.readFileSync(DATA_FILE));
    }
    data[newTransaction.trackingCode] = newTransaction;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// Serve static files (your HTML, JS, etc.)
app.use(express.static('./LTS'));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));