const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Define the root directory path
const rootDir = path.join(__dirname, '..');



router.get('/test', (req, res) => {
    res.json({ message: 'API test endpoint' });
});

// Static file serving
app.use(express.static(path.join(rootDir, 'public_html')));


// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});