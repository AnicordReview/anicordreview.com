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
app.get('/api/account', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        const user = await database.getUser(req.session.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found in the database.' });
        }

        const accountingData = {
            
        };

        res.json({ accountingData });
    } catch (error) {
        console.error('Error fetching accounting data:', error.message);
        res.status(500).json({ message: 'An error occurred while retrieving the account information.' });
    }
});

app.get('/api/auth/discord/start', (req, res) => {
    const lastPage = req.get('Referer') || '/';
    req.session.lastPage = lastPage;

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent('https://anicordreview.com/api/auth/discord')}&response_type=code&scope=identify guilds`;
    res.redirect(discordAuthUrl);
});


app.get('/api/auth/discord', async (req, res) => {
    const code = req.query.code;

    // Discord OAuth process (same as before)

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

            // Fetch user info from Discord
            const userinfo = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            });

            // Fetch guilds (same logic as before)
            const userGuilds = await axios.get('https://discord.com/api/users/@me/guilds', {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            });

            const isInGuild = userGuilds.data.some(guild => guild.id === '994071728017899600');

            if (isInGuild) {
                // Add or update user in DB (same as before)
                const userAlreadyExists = await database.getUser(userinfo.data.id);
                if (!userAlreadyExists) {
                    const userData = {
                        id: userinfo.data.id,
                        access_key: access,
                        refresh_token: refresh
                    };
                    await database.addUser(userData);
                }

                req.session.user.id = userinfo.data.id;

                // Redirect to the last page they were on before login
                const redirectUrl = req.session.lastPage || '/';
                res.redirect(redirectUrl);
            } else {
                res.redirect('/not-in-guild'); // Handle not-in-guild case
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
