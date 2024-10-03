const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/dynamic-page', (req, res) => {
    res.send('This is a dynamic page');
});

router.get('/another-dynamic-page', (req, res) => {
    res.send('This is another dynamic page');
});

// Add more dynamic routes as needed

module.exports = router;