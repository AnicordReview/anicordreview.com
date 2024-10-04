const express = require('express');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');
const qs = require('qs'); // Import qs to handle URL-encoded data
const app = express();
const PORT = 3000;

const rootDir = path.join(__dirname, '..'); 
app.use(express.static(path.join(rootDir, 'public_html')));

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
                res.send({ user: userinfo.data, message: 'User is in the guild.' });
            } else {
                res.send({ user: userinfo.data, message: 'User is not in the guild.' });
            }
        }
    } catch (error) {
        console.error('Error during Discord OAuth:', error.response?.data || error.message);
        res.status(500).send('An error occurred during the authentication process.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
