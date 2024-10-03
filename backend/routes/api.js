const express = require('express');
const router = express.Router();
const { verifyKeyMiddleware } = require('discord-interactions');

router.post('/discord-auth', verifyKeyMiddleware('your-key-here'), (req, res) => {
    const interaction = req.body;
    if (interaction.type === 1) {
        return res.json({ type: 1 });
    }
    return res.json({ type: 4, data: { content: 'test' } });
});

router.get('/test', (req, res) => {
    res.json({ message: 'API test endpoint' });
});

module.exports = router;