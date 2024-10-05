const express = require('express');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');
const qs = require('qs'); // Import qs to handle URL-encoded data
const app = express();
const PORT = 3000;
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const Database = require('./data');
const database = new Database(app); // Database is initialized after the app is created

const rootDir = path.join(__dirname, '..'); 
app.use(express.static(path.join(rootDir, 'public_html')));
app.use(session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: './database' }),
    secret: process.env.CLIENT_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Set to false if not using HTTPS
}));

app.get('/api/test', (req, res) => {
    res.send('hi');
});

app.get('/api/auth/discord', async (req, res) => {
    const code = req.query.code;

    console.log('Received code:', code);

    const data = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://anicordreview.com/api/auth/discord',
        scope: 'identify guilds'
    };

    try {
        const output = await axios.post('https://discord.com/api/oauth2/token', qs.stringify(data), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (output.data) {
            const access = output.data.access_token;
            const refresh = output.data.refresh_token;

            // Store user info in session
            req.session.user = {
                id: null, // We'll fetch user info after this
                access_key: access,
                refresh_token: refresh
            };

            const userinfo = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            });

            const userGuilds = await axios.get('https://discord.com/api/users/@me/guilds', {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            });

            const isInGuild = userGuilds.data.some(guild => guild.id === '994071728017899600');

            if (isInGuild) {
                const userAlreadyExists = await database.getUser(userinfo.data.id);
                console.log(userAlreadyExists);
                if (!userAlreadyExists) {
                    const userData = {
                        id: userinfo.data.id,
                        access_key: access,
                        refresh_token: refresh
                    };
                    await database.addUser(userData);
                    console.log("Added user");
                }
                
                // Update session with user ID
                req.session.user.id = userinfo.data.id;
                
                const userFromDB = await database.getUser(userinfo.data.id);
                console.log("User in DB", userFromDB);

                // Send user data and access tokens in the response
                res.send({ user: userinfo.data, access: output.data, message: 'User is in the guild.' });
            } else {
                res.send({ user: userinfo.data, message: 'User is not in the guild.' });
            }
        }
    } catch (error) {
        console.error('Error during Discord OAuth:', error.response?.data || error.message);
        res.status(500).send('An error occurred during the authentication process.');
    }
});

// Token refresh route
app.post('/api/auth/refresh', async (req, res) => {
    if (!req.session.user || !req.session.user.refresh_token) {
        return res.status(401).send('User is not authenticated or refresh token is missing.');
    }

    const data = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: req.session.user.refresh_token,
        grant_type: 'refresh_token'
    };

    try {
        const output = await axios.post('https://discord.com/api/oauth2/token', qs.stringify(data), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (output.data) {
            // Update access token in session
            req.session.user.access_key = output.data.access_token;
            res.send({ access: output.data });
        }
    } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        res.status(500).send('Failed to refresh token.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
