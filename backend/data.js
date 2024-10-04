const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

class Database {
    constructor(app) {
        this.init(app);
    }

    async init(app) {
        try {
            // Define the database file path
            const dbDir = path.join(__dirname, 'database'); // The directory where the DB file will be created
            const dbPath = path.join(dbDir, 'db.sqlite');  // Full path to the SQLite file

            // Check if the directory exists, if not, create it
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
                console.log('Database directory created.');
            }

            // Initialize the SQLite database connection
            this.db = await sqlite.open({
                filename: dbPath,      // Path to the SQLite file
                driver: sqlite3.Database
            });

            // Run any initialization queries if necessary
            await this.db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, access_key TEXT, refresh_token TEXT)');
            console.log('Database initialized successfully.');
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    }

    // Example method to get user data
    async getUser(userId) {
        return this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
    }

    // Example method to add a new user
    async addUser(userData) {
        return this.db.run(
            'INSERT INTO users (id, access_key, refresh_token) VALUES (?, ?, ?)',
            [userData.id, userData.access_key, userData.refresh_token]
        );
    }
}

module.exports = Database;
