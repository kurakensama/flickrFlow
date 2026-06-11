# flickr-oauth-token

By [Alfredo Cofré, 2026](https://www.cofre.info)

A simple CLI script to generate a Flickr OAuth 1.0a access token.

Flickr's API requires OAuth 1.0a to access private photos. This script handles
the full authorization flow and outputs the token values you need for your
server's `.env` file. Run it once — the tokens do not expire.

## Prerequisites

- Node.js 14 or higher
- A Flickr account with [Flickr Pro](https://www.flickr.com/account/upgrade/) (required for API key creation)
- A Flickr app with an API key and secret — create one at [flickr.com/services/apps](https://www.flickr.com/services/apps)

## Setup

1. Clone or download this script.

2. Install the optional dependency:

```bash
npm install dotenv
```

3. Create a `.env` file based on `.env.example`:

```
FLICKR_API_KEY=your_api_key_here
FLICKR_API_SECRET=your_api_secret_here
```

Alternatively, you can export the variables manually before running the script:

```bash
export FLICKR_API_KEY=your_api_key_here
export FLICKR_API_SECRET=your_api_secret_here
```

## Usage

```bash
node get_flickr_token.js
```

The script will:

1. Request a temporary token from Flickr
2. Print an authorization URL — open it in your browser
3. Ask you to authorize the app and enter the 9-digit verification code
4. Output three values to add to your server `.env` file

## Output

After a successful run you will see something like:

```
✓ Success! Add these values to your server .env file:

FLICKR_OAUTH_TOKEN=72157720936345248-abc123...
FLICKR_OAUTH_TOKEN_SECRET=abc123...
FLICKR_USER_ID=12345678@N00
```

Add these three values to your server's `.env` file alongside your API key and secret.

## Server .env reference

Your server needs all five values to sign API requests:

```
FLICKR_API_KEY=
FLICKR_API_SECRET=
FLICKR_OAUTH_TOKEN=
FLICKR_OAUTH_TOKEN_SECRET=
FLICKR_USER_ID=
```

## Notes

- The access token does not expire unless you revoke it in your Flickr app settings.
- Keep your `.env` file out of version control — add it to `.gitignore`.
- This script only requests `read` permission, which is sufficient for fetching photos.
