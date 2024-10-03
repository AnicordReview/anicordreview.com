const express = require('express')
const { verifyKeyMiddleware } = require('discord-interactions');
const path = require('path');
const app = express()

const PORT = 3000

app.use(express.static(path.join(__dirname, 'public_html')));
app.use(express.json()); 
app.use(express.static('public'));  

app.get('/api/discord-auth',verifyKeyMiddleware('aea759dc26e8c1778a99e67e32cf261489fbba6e53e3139f9822f34bf47df1ee'), (req, res) => {
    const interaction = req.body;
    if (interaction.type === 1) {
        res.send(res.json({ type: 1 }));
      }
      res.send(res.json({ type: 4, data: { content: 'test' } }));
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})
