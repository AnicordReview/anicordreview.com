const sqlite = require('sqlite');
const path = require('path');

class Database {
    constructor (app) {
        this.app = app;

        const dbPath = path.resolve(__dirname, 'database.sqlite3'); // Resolve the path to your SQLite file

        sqlite.open(dbPath, { Promise })
            .then(db => {
                this.db = db;
                return db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, access_key TEXT, refresh_token TEXT)');
            })
            .then(() => {
                return this.db.run('CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY, author INTEGER, series_name TEXT, series_id INTEGER, rating REAL, content TEXT, type TEXT, contract_type TEXT, contract_season TEXT, nsfw INTEGER, creation_date DATE, thumbnail TEXT, FOREIGN KEY (author) REFERENCES users (id))');
            })
            .then(() => this.app.set('db', this.db))
            .catch(err => console.error('Failed to initialize database:', err));
    }

    getUser(id) {
        return this.db.get('SELECT * FROM users WHERE id = ?', id);
    }

    addUser(data) {
        return this.db.run('INSERT INTO users (id, access_key, refresh_token) VALUES (?, ?, ?)', data.id, data.access_key, data.refresh_token);
    }
}

module.exports = Database;
