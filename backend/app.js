const express = require('express')
const app = express()

const PORT = 3000




app.get('/api/discord-auth', (req, res) => {
    
    if (interaction.type === 1) {
        res.send(res.json({ type: 1 }));
      }
      res.send(res.json({ type: 4, data: { content: 'test' } }));
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})
