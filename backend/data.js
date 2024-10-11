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
            const dbDir = path.join(__dirname, 'database');
            const dbPath = path.join(dbDir, 'db.sqlite');

            console.log('Database file path:', dbPath);

            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
                console.log('Database directory created:', dbDir);
            }

            this.db = await sqlite.open({
                filename: dbPath,
                driver: sqlite3.Database
            });

            await this.db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, access_key TEXT, refresh_token TEXT)');
            console.log('Database initialized successfully.');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error; // Re-throw the error to be caught by the calling function
        }
    }

    async getUser(userId) {
        return this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
    }

    async addUser(userData) {
        return this.db.run(
            'INSERT INTO users (id, access_key, refresh_token) VALUES (?, ?, ?)',
            [userData.id, userData.access_key, userData.refresh_token]
        );
    }
}

module.exports = Database;