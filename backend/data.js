const express = require('express')
const sqlite = require('sqlite')

class Database {
  constructor (app) {
    this.app = app
    this.db = sqlite.open('./database.sqlite3', { Promise })
      .then(db => db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, access_key TEXT, refresh_token TEXT)'))
      .then(() => this.db.run('CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY, author INTEGER, series_name TEXT, series_id INTEGER, rating REAL, content TEXT, type TEXT, contract_type TEXT, contract_season TEXT, nsfw INTEGER, creation_date DATE, thumbnail TEXT, FOREIGN KEY (author) REFERENCES users (id))'))
      .then(() => this.app.set('db', this.db))
  }
  getUser(id){
    return this.db.get('SELECT * FROM users WHERE id = ?', id)
  }
}

module.exports = Database

