const express = require('express');
const path = require('path');
const apiRouter = require('./routes'); // Adjust the path as necessary

const app = express();
const PORT = 3000;

// Define the root directory path
const rootDir = path.join(__dirname, '..');

// Use the router for API endpoints
app.use('api', apiRouter);

// Static file serving
app.use(express.static(path.join(rootDir, 'public_html')));

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
