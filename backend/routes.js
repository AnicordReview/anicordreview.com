const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/test', (req, res) => {
    res.send('hiiiiiii')
});

// Add more routes as needed
router.post('/discord-auth', (req, res) => {
    // Handle the discord authentication
    res.json({ message: 'Discord auth endpoint' });
});

module.exports = router;
