const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');
const qs = require('qs');
const app = express();
const PORT = 3000;
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const Database = require('./data');

const rootDir = path.join(__dirname, '..');
const dbDir = path.join(__dirname, 'database');

// Ensure the database directory exists
const fs = require('fs');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Database directory created:', dbDir);
}

const sessionDbPath = path.join(dbDir, 'sessions.sqlite');
console.log('Session database path:', sessionDbPath);

const store = new SQLiteStore({ 
    db: 'sessions.sqlite',
    dir: dbDir
});

app.set("view engine", "ejs");
app.use(express.static(path.join(rootDir, 'public_html')));
app.use(session({
    secret: process.env.CLIENT_SECRET,
    saveUninitialized: false,
    store: store,
    resave: false,
    cookie: {
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}));

const database = new Database(app);



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
            console.log(userinfo)
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
                    console.log("Added user",userinfo);
                    req.session.authenticated = true;
                    req.session.user = userData;
                }
                res.redirect('/');
            
                
                               

            } else {
                res.send({ user: userinfo.data, message: 'User is not in the guild.' });
            }
        }
    } catch (error) {
        console.error('Error during Discord OAuth:', error.response?.data || error.message);
        res.status(500).send('An error occurred during the authentication process.');
    }
});
app.get('/api/session/check', (req, res) => {
    if (req.session.user) {
        res.send({
            loggedIn: true,
            session: req.session.user
        });
    } else {
        res.send({
            loggedIn: false,
            message: 'No user session found.'
        });
    }
});

// Token refresh route

app.get("/", (req, res) => {
    console.log(req.session);
    let sendUser = {
        user: req.session.user || null
    };
    res.render('index', sendUser, (err, html) => {
        if (err) {
            console.error('Error rendering template:', err);
            return res.status(500).send('An error occurred');
        }
        res.send(html);
    });
});
app.get("/reviews", (req, res) => {
    console.log(req.session);
    let sendUser = {
        user: req.session.user || null
    };
    res.render('reviews', sendUser, (err, html) => {
        if (err) {
            console.error('Error rendering template:', err);
            return res.status(500).send('An error occurred');
        }
        res.send(html);
    });
});
app.get('/reviews/new', (req, res) => {
    res.render('postreview', { 
        user: req.session.user || null
    });
})
app.get('/reviews/:id', async (req, res) => {
    const reviewId = req.params.id;
    console.log('Review ID:', reviewId);

    try {
        const review = await database.getReview(reviewId);
        console.log('Fetched review:', review);  // Log the review to ensure it's being retrieved

        if (!review) {
            // Review not found
            return res.status(404).render('error', { 
                message: 'Review not found',
                user: req.session.user || null
            });
        }

        if (!review.user_id) {
            // Log and handle missing user_id
            console.error('Missing user_id in the review');
            return res.status(500).render('error', { 
                message: 'Review is missing associated user data',
                user: req.session.user || null
            });
        }

        let username = await fetch(`https://discord.com/api/users/${review.user_id}`, {
            headers: {
                Authorization: `Bot ${process.env.TOKEN}`
            }
        }).then(res => res.json());

        username = username.username;  // Make sure to get the username correctly

        res.render('review', { 
            review,
            username,  // Pass the username as well
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).render('error', { 
            message: 'An error occurred while fetching the review',
            user: req.session.user || null
        });
    }
});


// Create a new review
app.post('/reviews', async (req, res) => {
    const reviewData = {
        title: req.body.title,
        content: req.body.content,
        rating: req.body.rating,
        user_id: req.session.user.id
    };
    

    try {
        await database.addReview(reviewData);
        res.redirect('/reviews');
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).render('error', { 
            message: 'An error occurred while creating the review',
            user: req.session.user || null
        });
    }
});

// Update an existing review
app.put('/reviews/:id', async (req, res) => {
    const reviewId = req.params.id;
    const reviewData = {
        title: req.body.title,
        content: req.body.content,
        rating: req.body.rating
    };

    try {
        await database.updateReview(reviewId, reviewData);
        res.redirect(`/reviews/${reviewId}`);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).render('error', { 
            message: 'An error occurred while updating the review',
            user: req.session.user || null
        });
    }
});

// Delete a review
app.delete('/reviews/:id', async (req, res) => {
    const reviewId = req.params.id;

    try {
        await database.deleteReview(reviewId);
        res.redirect('/reviews');
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).render('error', { 
            message: 'An error occurred while deleting the review',
            user: req.session.user || null
        });
    }
});

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
