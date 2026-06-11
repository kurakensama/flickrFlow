# flickrflow-server

By [Alfredo Cofré, 2026](https://www.cofre.info)

A minimal Express proxy server that signs Flickr API requests with OAuth 1.0a
and exposes a simple endpoint for the FlickrFlow frontend widget.

Flickr's API requires server-side OAuth signing to access private photos — the
API secret cannot be safely used in a browser. This server handles all
authentication and acts as a proxy between your frontend and the Flickr API.

## Prerequisites

- Node.js 14 or higher
- A Flickr Pro account (required for API key creation)
- A Flickr app — create one at [flickr.com/services/apps](https://www.flickr.com/services/apps)
- OAuth access tokens — generate them with [flickr-oauth-token](../flickr-oauth-token)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```
FLICKR_API_KEY=your_api_key_here
FLICKR_API_SECRET=your_api_secret_here
FLICKR_OAUTH_TOKEN=your_oauth_token_here
FLICKR_OAUTH_TOKEN_SECRET=your_oauth_token_secret_here
FLICKR_USER_ID=your_user_id_here
CORS_ORIGIN=https://your-domain.com
```

3. Start the server:

```bash
node server.js
# or with pm2 for production:
pm2 start server.js --name flickrflow-api
```

The server runs on port `3001` by default. Override with the `PORT` environment variable.

## API

### `GET /api/flickr/photos`

Returns photos for the authenticated user, including private ones.

**Query parameters:**

| Parameter  | Type   | Default | Description                        |
|------------|--------|---------|------------------------------------|
| `page`     | number | `1`     | Page number                        |
| `per_page` | number | `50`    | Photos per page (max 500)          |

**Example:**

```
GET /api/flickr/photos?page=1&per_page=100
```

**Response:**

```json
{
  "photos": {
    "page": 1,
    "pages": 19,
    "perpage": 100,
    "total": 908,
    "photo": [...]
  },
  "stat": "ok"
}
```

## Production deployment

This server is designed to run behind an Nginx reverse proxy. Add this to your
Nginx config to forward `/api/` requests to the server:

```nginx
location /api/ {
    proxy_pass http://localhost:3001/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Keep port `3001` closed in your firewall — only Nginx should reach it.
