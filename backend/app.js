const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Define the root directory path
const rootDir = path.join(__dirname, '..');

// Middleware for parsing JSON requests
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});



// Static file serving
app.use(express.static(path.join(rootDir, 'public_html')));

// Catch-all route for unmatched routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(rootDir, 'public_html', '404.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});