import { useEffect, useRef, useState } from 'react';
import './css/flickrflow.css';
import FlickrItemContent from './flickrItemContent';

/**
 * FlickrFlow
 *
 * A coverflow-style photo carousel that streams photos from your Flickr account
 * via the flickrflow-server proxy. Supports infinite scrolling — more photos
 * are fetched automatically as you navigate toward the end of the current set.
 *
 * Props:
 *   per_page  {number}  Photos to fetch per page (default: 50, max: 500)
 *   api_url   {string}  Base URL of the flickrflow-server API
 *                       (default: '/api/flickr/photos')
 *
 * Usage:
 *   <FlickrFlow per_page={100} />
 *
 *   // Custom API URL (e.g. different origin):
 *   <FlickrFlow per_page={50} api_url="https://api.your-domain.com/api/flickr/photos" />
 */

// ─── Coverflow constants ────────────────────────────────────────────────────
const ITEM_ANGLE = 20;         // Y-axis rotation per step (degrees)
const CENTER_ITEM_POP = 100;   // Z offset for the center item (px)
const CENTER_ITEM_POP_DELTA = 20; // Additional Z offset per step away from center
const VISIBLE_RANGE = 10;       // Items visible on each side of center
const PREFETCH_THRESHOLD = 10; // Fetch next page when this many items remain

const FlickrFlow = (props) => {
    const [photos, setPhotos] = useState([]);
    const rootRef = useRef(null);
    const currentIndexRef = useRef(0);
    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const totalPagesRef = useRef(1);

    const per_page = props.per_page || 50;
    const api_url = props.api_url || '/api/flickr/photos';

    // ─── Initial fetch ──────────────────────────────────────────────────────
    useEffect(() => {
        fetch(`${api_url}?page=1&per_page=${per_page}`)
            .then(res => res.json())
            .then(data => {
                if (data.photos && data.photos.photo) {
                    totalPagesRef.current = data.photos.pages;
                    setPhotos(data.photos.photo);
                }
            })
            .catch(err => console.error('FlickrFlow: error loading photos:', err));
    }, []);

    // ─── Apply transforms after photos load ────────────────────────────────
    useEffect(() => {
        if (photos.length > 0 && rootRef.current) {
            setTimeout(() => applyTransforms(currentIndexRef.current, null, null, false), 50);
        }
    }, [photos]);

    // ─── Fetch next page ────────────────────────────────────────────────────
    function fetchMorePhotos() {
        if (loadingRef.current) return;
        if (pageRef.current >= totalPagesRef.current) return;

        loadingRef.current = true;
        const nextPage = pageRef.current + 1;

        fetch(`${api_url}?page=${nextPage}&per_page=${per_page}`)
            .then(res => res.json())
            .then(data => {
                if (data.photos && data.photos.photo) {
                    pageRef.current = nextPage;
                    setPhotos(prev => [...prev, ...data.photos.photo]);
                }
                loadingRef.current = false;
            })
            .catch(err => {
                console.error('FlickrFlow: error loading more photos:', err);
                loadingRef.current = false;
            });
    }

    // ─── Responsive spacing ─────────────────────────────────────────────────
    function getItemDistance() {
        const w = window.innerWidth;
        if (w < 400) return 15;
        if (w < 640) return 20;
        if (w < 1024) return 25;
        return 30;
    }

    function getCenterItemDistance() {
        const w = window.innerWidth;
        if (w < 400) return 4;
        if (w < 640) return 6;
        if (w < 1024) return 8;
        return 10;
    }

    function getMaxDistance() {
        const w = window.innerWidth;
        if (w < 400) return 4;
        if (w < 640) return 6;
        if (w < 1024) return 8;
        return 10;
    }

    // ─── DOM transform ──────────────────────────────────────────────────────
    function setItemTransform(item, xpos, zpos, yangle) {
        item.style.transform = `translateX(${xpos}px) translateZ(${zpos}px) rotateY(${yangle}deg)`;
        item.style.transition = '0.5s cubic-bezier(.25,.8,.25,1)';
    }

    // ─── Click handler ──────────────────────────────────────────────────────
    function handleClick(url, index) {
        if (url !== null && index === currentIndexRef.current) {
            window.open(url, '_blank', 'noopener noreferrer');
        }
        currentIndexRef.current = index;
    }

    // ─── Main coverflow layout ──────────────────────────────────────────────
    function applyTransforms(index, owner, id, clicked) {
        if (!rootRef.current) return;

        // Prefetch next page when approaching the end
        if (index >= photos.length - PREFETCH_THRESHOLD) {
            fetchMorePhotos();
        }

        const ITEM_DISTANCE = getItemDistance();
        const CENTER_ITEM_DISTANCE = getCenterItemDistance();
        const url = owner && id
            ? `https://www.flickr.com/photos/${owner}/${id}`
            : null;

        const items = rootRef.current.children;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const diff = i - index;
            const absDiff = Math.abs(diff);

            if (i === index) {
                setItemTransform(item, 0, CENTER_ITEM_POP, 0);
                item.style.zIndex = '10';
                item.style.opacity = '1';
                if (clicked) handleClick(url, index);
            } else if (absDiff > VISIBLE_RANGE) {
                // Hide items beyond visible range to avoid shadow stacking
                const xpos = (diff > 0 ? 1 : -1) * VISIBLE_RANGE * ITEM_DISTANCE;
                setItemTransform(item, xpos, -CENTER_ITEM_POP - VISIBLE_RANGE * CENTER_ITEM_POP_DELTA, 90);
                item.style.zIndex = '0';
                item.style.opacity = '0';
            } else if (i < index) {
                const y_angle = Math.min(absDiff * ITEM_ANGLE, 90);
                const xpos = Math.min(diff * ITEM_DISTANCE - CENTER_ITEM_DISTANCE, getMaxDistance());
                const zpos = -CENTER_ITEM_POP - absDiff * CENTER_ITEM_POP_DELTA;
                setItemTransform(item, xpos, zpos, y_angle);
                item.style.zIndex = String(10 - absDiff);
                item.style.opacity = '1';
            } else {
                const y_angle = -Math.min(absDiff * ITEM_ANGLE, 90);
                const xpos = Math.max(diff * ITEM_DISTANCE + 4.2 * CENTER_ITEM_DISTANCE, -1 * getMaxDistance());
                const zpos = -CENTER_ITEM_POP - absDiff * CENTER_ITEM_POP_DELTA;
                setItemTransform(item, xpos, zpos, y_angle);
                item.style.zIndex = String(10 - absDiff);
                item.style.opacity = '1';
            }
        }

        currentIndexRef.current = index;
    }

    // ─── Photo item ─────────────────────────────────────────────────────────
    const FlickrItem = ({ data, index }) => (
        <div
            onClick={() => applyTransforms(index, data.owner, data.id, true)}
            className="flickrflow-item"
        >
            <FlickrItemContent
                src={`https://live.staticflickr.com/${data.server}/${data.id}_${data.secret}_q.jpg`}
                href={`https://www.flickr.com/photos/${data.owner}/${data.id}`}
                id={data.id}
                index={index}
                alt={data.title}
            />
        </div>
    );

    if (photos.length === 0) return null;

    return (
        <div className="flickflow-container">
            <div className="flickrflow" ref={rootRef}>
                {photos.map((photo, idx) => (
                    <FlickrItem data={photo} key={photo.id} index={idx} />
                ))}
            </div>
        </div>
    );
};

export default FlickrFlow;
