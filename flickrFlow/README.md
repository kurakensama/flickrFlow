# flickrflow-widget

By [Alfredo Cofré, 2026](https://www.cofre.info)

A coverflow-style React photo carousel for Flickr.

Photos are fetched from [flickrflow-server](../flickrflow-server), which handles
OAuth 1.0a authentication server-side. The widget supports infinite scrolling —
new pages are fetched automatically as you navigate toward the end of the loaded
set.

## Preview

Click a photo to bring it to the front. Click the front photo to open it on Flickr.
Photos beyond 5 positions from the center are hidden to avoid rendering artifacts.

## Prerequisites

- React 18+
- [flickrflow-server](../flickrflow-server) running and accessible

## Installation

Copy the following files into your project:

```
src/
  FlickrFlow.jsx
  FlickrItemContent.jsx
  css/
    flickrflow.css
```

No additional npm dependencies required.

## Usage

```jsx
import FlickrFlow from './FlickrFlow';

// Basic usage — fetches 50 photos per page
<FlickrFlow per_page={50} />

// Load more photos per page
<FlickrFlow per_page={150} />

// Custom API URL (if your server is on a different origin)
<FlickrFlow per_page={50} api_url="https://api.your-domain.com/api/flickr/photos" />
```

## Props

| Prop       | Type   | Default                  | Description                                 |
|------------|--------|--------------------------|---------------------------------------------|
| `per_page` | number | `50`                     | Photos to fetch per page (max 500)          |
| `api_url`  | string | `'/api/flickr/photos'`   | Endpoint of the flickrflow-server proxy     |

## How it works

1. On mount, the widget fetches the first page of photos from `api_url`.
2. Photos are rendered as `<canvas>` elements inside absolutely positioned divs.
3. CSS `perspective` + JavaScript `translateX`, `translateZ`, and `rotateY`
   create the coverflow effect.
4. When the user navigates within `PREFETCH_THRESHOLD` items of the end,
   the next page is fetched silently and appended.

## Customization

The following constants at the top of `FlickrFlow.jsx` control the visual behavior:

| Constant              | Default | Description                                          |
|-----------------------|---------|------------------------------------------------------|
| `ITEM_ANGLE`          | `20`    | Y-axis rotation per step (degrees)                   |
| `CENTER_ITEM_POP`     | `100`   | Z offset for the center item (px)                    |
| `CENTER_ITEM_POP_DELTA` | `10`  | Additional Z offset per step away from center        |
| `VISIBLE_RANGE`       | `5`     | Items visible on each side of center                 |
| `PREFETCH_THRESHOLD`  | `10`    | Items from end before fetching the next page         |

CSS perspective (default `800px`) is set in `flickrflow.css` on `.flickrflow`.

## Notes

- `FlickrItemContent` renders photos on an HTML `<canvas>`. The `perspective()`
  function inside it is a placeholder for a future pixel-level 3D transform.
  For now, images are drawn directly with `drawImage`.
- The widget uses direct DOM manipulation for transforms instead of React state,
  which avoids re-rendering all items on every interaction.
