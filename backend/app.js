const express = require('express');
const path = require('path');
require('dotenv').config();
const axios = require('axios');
const url = require('url');
const app = express();
const PORT = 3000;

const rootDir = path.join(__dirname, '..'); 
app.use(express.static(path.join(rootDir, 'public_html')));

app.get('/api/test', (req, res) => {
    res.send('hi');
});

app.get('/api/auth/discord', async (req, res) => {
    const {code} = req.query;

    if (code){
        const formData = new url.URLSearchParams({
            client_id: process.env.ClientID,
            client_secret: process.env.ClientSecret,
            grant_type: 'authorization_code',
            code: code.toString(),
            redirect_url: 'https://anicordreview.com/api/auth/discord'
        })

        const output = await axios.post('https://discord.com/api/v10/oauth2/token',{
            headers:{
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
        if (output.data) {
            const access = output.data.access_token

            const userinfo = await axios.get('https://discord.com/api/v10/users/@me', {
                headers: {
                    'Authorization': `Bearer ${access}`
                }
            })

            res.json({...output.data, ...userinfo.data})
        }
    }

    // Handle the discord authentication
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
