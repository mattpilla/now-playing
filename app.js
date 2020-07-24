require('dotenv').config();

const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const uuid = require("uuid");

const app = express();

const port = process.env.PORT || 8888;
const redirectUri = process.env.REDIRECT_URI || `http://localhost:${port}`;
const state = uuid.v4();

app.use(express.static('public'))
   .use(cors());

app.get('/login', (req, res) => {
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            client_id: process.env.CLIENT_ID,
            response_type: 'token',
            redirect_uri: redirectUri,
            state,
            scope: 'user-read-playback-state'
        })
    );
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
