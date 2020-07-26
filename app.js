require('dotenv').config();

const express = require('express');
const request = require('request');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const uuid = require("uuid");

const app = express();

const port = process.env.PORT || 8888;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI || `http://localhost:${port}/callback`;
const stateKey = 'spotify_auth_state';

app.use(express.static('public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', (req, res) => {
    const state = uuid.v4();
    res.cookie(stateKey, state);

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            client_id: clientId,
            response_type: 'code',
            redirect_uri: redirectUri,
            state,
            scope: 'user-read-playback-state'
        })
    );
});

app.get('/callback', (req, res) => {
    const state = req.cookies ? req.cookies[stateKey] : null;
    if (!state || state !== req.query.state) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            })
        );
    } else {
        res.clearCookie(stateKey);
        const options = {
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
            },
            form: {
                code: req.query.code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            },
            json: true
        };
        request.post(options, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    })
                );
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        access_token: body.access_token,
                        refresh_token: body.refresh_token
                    })
                );
            }
        });
    }
});

app.get('/refresh', (req, res) => {
    const options = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        },
        form: {
            refresh_token: req.query.refresh_token,
            grant_type: 'refresh_token'
        },
        json: true
    };
    request.post(options, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_refresh_token'
                })
            );
        } else {
            res.send({
                access_token: body.access_token
            });
        }
    });
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
