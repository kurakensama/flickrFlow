require('dotenv').config();
const express = require('express');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const fetch = require('node-fetch');
const cors = require('cors');

// ─── Validate required environment variables ───────────────────────────────
const REQUIRED_ENV = [
    'FLICKR_API_KEY',
    'FLICKR_API_SECRET',
    'FLICKR_OAUTH_TOKEN',
    'FLICKR_OAUTH_TOKEN_SECRET',
    'FLICKR_USER_ID',
    'CORS_ORIGIN'
];

const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length > 0) {
    console.error(`\n✗ Missing required environment variables: ${missing.join(', ')}`);
    console.error('  Create a .env file based on .env.example and try again.\n');
    process.exit(1);
}

// ─── App setup ─────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN }));

// ─── OAuth 1.0a client ─────────────────────────────────────────────────────
const oauth = OAuth({
    consumer: {
        key: process.env.FLICKR_API_KEY,
        secret: process.env.FLICKR_API_SECRET
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    }
});

const token = {
    key: process.env.FLICKR_OAUTH_TOKEN,
    secret: process.env.FLICKR_OAUTH_TOKEN_SECRET
};

// ─── Routes ────────────────────────────────────────────────────────────────

/**
 * GET /api/flickr/photos
 *
 * Returns photos for the authenticated Flickr user, including private ones.
 *
 * Query params:
 *   page     {number}  Page number (default: 1)
 *   per_page {number}  Photos per page, max 500 (default: 50)
 */
app.get('/api/flickr/photos', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const per_page = Math.min(parseInt(req.query.per_page) || 50, 500);

    const url = 'https://api.flickr.com/services/rest/';
    const params = {
        method: 'flickr.people.getPhotos',
        user_id: process.env.FLICKR_USER_ID,
        format: 'json',
        nojsoncallback: 1,
        per_page,
        page,
        extras: 'url_q,url_o'
    };

    const requestData = {
        url: url + '?' + new URLSearchParams(params),
        method: 'GET'
    };

    const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

    try {
        const response = await fetch(requestData.url, { headers: authHeader });
        const data = await response.json();
        res.setHeader('Content-Type', 'application/json');
        res.json(data);
    } catch (err) {
        console.error('Flickr API error:', err.message);
        res.status(500).json({ error: 'Failed to fetch photos from Flickr.' });
    }
});

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
