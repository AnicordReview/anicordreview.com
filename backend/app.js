const express = require('express');
const { verifyKeyMiddleware } = require('discord-interactions');
const path = require('path');

const app = express();
const PORT = 3000;

// Define the parent directory path
const parentDir = path.join(__dirname, '..');

// Middleware for serving static files
app.use(express.static(path.join(parentDir, 'public_html')));
app.use(express.json()); // Middleware for parsing JSON requests

// Define the Discord interaction route
app.get('/api/discord-auth', verifyKeyMiddleware('aea759dc26e8c1778a99e67e32cf261489fbba6e53e3139f9822f34bf47df1ee'), (req, res) => {
    const interaction = req.body;
    if (interaction.type === 1) {
        return res.json({ type: 1 }); // Respond with type 1
    }
    return res.json({ type: 4, data: { content: 'test' } }); // Respond with type 4
});

// Serve the index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(parentDir, 'public_html', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});
