const express = require('express');
const path = require('path');
require('dotenv').config();
const axios = require('axios');
const url = require('url');
const app = express();
const PORT = 3000;

const rootDir = path.join(__dirname, '..'); 
app.use(express.static(path.join(rootDir, 'public_html')));

app.get('/api/test', (req, res) => {
    res.send('hi');
});

app.get('/api/discord-auth', (req, res) => {
    res.json(1);

    // Handle the discord authentication
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
