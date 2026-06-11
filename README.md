# flickrFlow

A full-stack application that displays Flickr photos in a beautiful, interactive Cover Flow carousel. Stream your entire Flickr library with infinite scroll support and secure OAuth authentication.

![flickrFlow v1.0](img/flickrFlow-v1.0.png)

## Features

- 🎠 **Cover Flow Carousel** — Stunning 3D carousel UI for browsing Flickr photos
- 🔐 **Secure OAuth 1.0a** — Server-side authentication handles Flickr API signing securely
- ♾️ **Infinite Scrolling** — Automatically fetches more photos as you navigate
- ⚡ **Express Proxy Server** — Lightweight Node.js API that bridges your frontend and Flickr
- 🎨 **Responsive Design** — Works seamlessly across desktop and tablet devices
- 🔧 **Easy Setup** — CLI tool to generate OAuth tokens in minutes

## Architecture

flickrFlow is a three-part system:

```
┌─────────────────────────────────────────────────────────┐
│  React Widget (flickrFlow/)                             │
│  - Cover Flow carousel component                        │
│  - Photo rendering & navigation                         │
│  - Infinite scroll pagination                           │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP requests
┌──────────────────────▼──────────────────────────────────┐
│  Express Server (api/)                                  │
│  - OAuth 1.0a request signing                           │
│  - Flickr API proxy                                     │
│  - CORS handling                                        │
└──────────────────────┬──────────────────────────────────┘
                       │ Signed requests
┌──────────────────────▼──────────────────────────────────┐
│  Flickr API                                             │
│  - Photo metadata                                       │
│  - Private/public library access                        │
└─────────────────────────────────────────────────────────┘

OAuth Token Generation (oauth-orizer/):
  - One-time setup CLI tool
  - Generates credentials for server authentication
```

## Project Structure

```
flickrFlow/
├── README.md                      # This file
├── LICENSE                        # GPL-3.0
│
├── flickrFlow/                    # React component
│   ├── flickrflow.js             # Main carousel component
│   ├── flickrItemContent.jsx     # Individual photo item renderer
│   ├── README.md                 # Component documentation
│   └── css/
│       └── flickrflow.css        # Carousel styling & 3D transforms
│
├── api/                          # Express server
│   ├── server.js                 # API server & OAuth proxy
│   ├── package.json              # Dependencies
│   ├── README.md                 # Server documentation
│   └── .env.example              # Environment variables template
│
└── oauth-orizer/                 # OAuth token generation
    ├── get_flickr_token.js       # CLI tool
    ├── README.md                 # Setup instructions
    └── .env.example              # Environment variables template
```

## Prerequisites

- **Node.js** 14 or higher
- **Flickr Pro account** (required for API key creation)
- **Flickr App** — create one at [flickr.com/services/apps](https://www.flickr.com/services/apps)

## Quick Start

### 1. Generate OAuth Credentials

```bash
cd oauth-orizer
npm install
# Create .env with your FLICKR_API_KEY and FLICKR_API_SECRET
node get_flickr_token.js
```

Follow the prompts to authorize your app. The script outputs your OAuth tokens.

### 2. Start the API Server

```bash
cd api
npm install

# Create .env file with credentials from Step 1:
cat > .env << EOF
FLICKR_API_KEY=your_api_key
FLICKR_API_SECRET=your_api_secret
FLICKR_OAUTH_TOKEN=your_oauth_token
FLICKR_OAUTH_TOKEN_SECRET=your_oauth_token_secret
FLICKR_USER_ID=your_user_id
CORS_ORIGIN=http://localhost:3000
EOF

npm start
```

The server runs on `http://localhost:3001` by default.

### 3. Use the React Component

In your React app:

```bash
npm install flickrFlow  # If published as a package, or:
# Copy the flickrFlow/ directory into your project
```

```jsx
import FlickrFlow from "./flickrFlow/flickrflow";

export default function App() {
  return (
    <FlickrFlow
      per_page={50}
      api_url="http://localhost:3001/api/flickr/photos"
    />
  );
}
```

## Detailed Setup

### OAuth Token Generation (`oauth-orizer/`)

See [oauth-orizer/README.md](./oauth-orizer/README.md) for complete setup instructions. The token generation is a one-time process — OAuth 1.0a tokens do not expire.

### API Server (`api/`)

See [api/README.md](./api/README.md) for:

- Environment variables & configuration
- API endpoints & parameters
- Deployment with PM2 or Docker
- CORS configuration

### React Component (`flickrFlow/`)

See [flickrFlow/README.md](./flickrFlow/README.md) for:

- Component props & usage
- Customization options
- CSS styling & animations
- Integration examples

## Usage

### Component Props

```jsx
<FlickrFlow
  per_page={50} // Photos per page (default: 50, max: 500)
  api_url="/api/flickr/photos" // API endpoint (default shown)
/>
```

### API Endpoints

**`GET /api/flickr/photos`**

Returns paginated photos from your Flickr library.

**Query Parameters:**

- `page` — Page number (default: 1)
- `per_page` — Photos per page (default: 50, max: 500)

**Response:**

```json
{
  "photos": {
    "photo": [
      {
        "id": "123456789",
        "title": "Photo Title",
        "farm": 1,
        "server": "123",
        "secret": "abc123",
        "datetaken": "2026-01-15 12:34:56"
      }
    ],
    "page": 1,
    "pages": 10,
    "perpage": 50,
    "total": "500"
  }
}
```

## Troubleshooting

**"Not authorized to access user profile"**

- Verify your OAuth token and token secret are correct
- Check that the tokens match the API key/secret pair

**CORS errors**

- Ensure `CORS_ORIGIN` environment variable matches your frontend domain
- For development: use `http://localhost:3000` or `*` (not recommended for production)

**No photos displayed**

- Verify your Flickr account has photos
- Check the browser console and server logs for API errors
- Confirm your `FLICKR_USER_ID` is correct

## Environment Variables Reference

| Variable                    | Description                | Example                 |
| --------------------------- | -------------------------- | ----------------------- |
| `FLICKR_API_KEY`            | From Flickr app settings   | `abc123xyz...`          |
| `FLICKR_API_SECRET`         | From Flickr app settings   | `def456uvw...`          |
| `FLICKR_OAUTH_TOKEN`        | Generated by oauth-orizer  | `72157654...`           |
| `FLICKR_OAUTH_TOKEN_SECRET` | Generated by oauth-orizer  | `abc123def...`          |
| `FLICKR_USER_ID`            | Your Flickr user ID        | `123456@N05`            |
| `CORS_ORIGIN`               | Frontend domain for CORS   | `http://localhost:3000` |
| `PORT`                      | API server port (optional) | `3001`                  |

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is licensed under the GNU General Public License v3.0 — see [LICENSE](LICENSE) for details.

## Author

By [Alfredo Cofré, 2026](https://www.cofre.info)
