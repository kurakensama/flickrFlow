#!/usr/bin/env node

/**
 * get_flickr_token.js
 *
 * A CLI script to obtain a Flickr OAuth 1.0a access token.
 * Run this once to generate the tokens you need for your .env file.
 *
 * Usage:
 *   1. Create a .env file in this directory (see .env.example)
 *   2. Run: node get_flickr_token.js
 *   3. Open the URL printed in the terminal
 *   4. Authorize the app in your browser
 *   5. Paste the 9-digit verification code back in the terminal
 *   6. Copy the output values into your server .env file
 * 
 * Alfredo Cofré, 2026. 
 */

const crypto = require('crypto');
const https = require('https');
const readline = require('readline');
const path = require('path');

// Load .env if present
try {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch {
    // dotenv is optional — you can also set env vars manually
}

const API_KEY = process.env.FLICKR_API_KEY;
const API_SECRET = process.env.FLICKR_API_SECRET;

if (!API_KEY || !API_SECRET) {
    console.error('\n✗ Missing FLICKR_API_KEY or FLICKR_API_SECRET.');
    console.error('  Create a .env file based on .env.example and try again.\n');
    process.exit(1);
}

function sign(baseString, signingKey) {
    return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

function buildSignature(method, url, params, tokenSecret = '') {
    const sortedParams = Object.keys(params)
        .sort()
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');
    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
    const signingKey = `${encodeURIComponent(API_SECRET)}&${encodeURIComponent(tokenSecret)}`;
    return sign(baseString, signingKey);
}

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function main() {
    console.log('\n── Flickr OAuth Token Generator ──\n');

    // Step 1: Request token
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const params = {
        oauth_callback: 'oob',
        oauth_consumer_key: API_KEY,
        oauth_nonce: nonce,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: timestamp,
        oauth_version: '1.0'
    };

    params.oauth_signature = buildSignature(
        'GET',
        'https://www.flickr.com/services/oauth/request_token',
        params
    );

    const requestTokenUrl = 'https://www.flickr.com/services/oauth/request_token?' +
        Object.keys(params)
            .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
            .join('&');

    const response = await httpsGet(requestTokenUrl);
    const parsed = Object.fromEntries(new URLSearchParams(response));

    if (!parsed.oauth_token) {
        console.error('\n✗ Failed to get request token. Check your API key and secret.\n');
        console.error('Response:', response);
        process.exit(1);
    }

    const requestToken = parsed.oauth_token;
    const requestTokenSecret = parsed.oauth_token_secret;

    // Step 2: User authorization
    console.log('Open this URL in your browser and authorize the app:\n');
    console.log(`  https://www.flickr.com/services/oauth/authorize?oauth_token=${requestToken}&perms=read\n`);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.question('Paste the 9-digit verification code here: ', async (verifier) => {
        rl.close();

        // Step 3: Access token
        const nonce2 = crypto.randomBytes(16).toString('hex');
        const timestamp2 = Math.floor(Date.now() / 1000).toString();

        const params2 = {
            oauth_consumer_key: API_KEY,
            oauth_nonce: nonce2,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: timestamp2,
            oauth_token: requestToken,
            oauth_verifier: verifier.trim(),
            oauth_version: '1.0'
        };

        params2.oauth_signature = buildSignature(
            'GET',
            'https://www.flickr.com/services/oauth/access_token',
            params2,
            requestTokenSecret
        );

        const accessTokenUrl = 'https://www.flickr.com/services/oauth/access_token?' +
            Object.keys(params2)
                .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params2[k])}`)
                .join('&');

        const response2 = await httpsGet(accessTokenUrl);
        const parsed2 = Object.fromEntries(new URLSearchParams(response2));

        if (!parsed2.oauth_token) {
            console.error('\n✗ Failed to get access token. The verification code may be incorrect.\n');
            console.error('Response:', response2);
            process.exit(1);
        }

        console.log('\n✓ Success! Add these values to your server .env file:\n');
        console.log(`FLICKR_OAUTH_TOKEN=${parsed2.oauth_token}`);
        console.log(`FLICKR_OAUTH_TOKEN_SECRET=${parsed2.oauth_token_secret}`);
        console.log(`FLICKR_USER_ID=${parsed2.user_nsid}`);
        console.log('');
    });
}

main().catch(err => {
    console.error('\n✗ Unexpected error:', err.message);
    process.exit(1);
});
