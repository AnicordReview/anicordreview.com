const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

class Database {
    constructor(app) {
        this.init(app);
    }
//
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
            await this.db.run('CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, rating REAL, user_id INTEGER, FOREIGN KEY(user_id) REFERENCES users(id))');
            console.log('Database initialized successfully.');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
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

    async getReview(reviewId) {
        return this.db.get('SELECT * FROM reviews WHERE id = ?', [reviewId]);
    }

    async addReview(reviewData) {
        return this.db.run(
            'INSERT INTO reviews (title, content, rating, user_id) VALUES (?, ?, ?, ?)',
            [reviewData.title, reviewData.content, reviewData.rating, reviewData.user_id]
        );
    }

    async getAllReviews() {
        return this.db.all('SELECT * FROM reviews');
    }

    async updateReview(reviewId, reviewData) {
        return this.db.run(
            'UPDATE reviews SET title = ?, content = ?, rating = ? WHERE id = ?',
            [reviewData.title, reviewData.content, reviewData.rating, reviewId]
        );
    }

    async deleteReview(reviewId) {
        return this.db.run('DELETE FROM reviews WHERE id = ?', [reviewId]);
    }
}

module.exports = Database;