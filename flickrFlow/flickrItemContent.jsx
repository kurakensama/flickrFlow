import { useRef, useEffect } from 'react';

/**
 * FlickrItemContent
 *
 * Renders a Flickr photo as an HTML canvas element.
 * Currently draws the image directly onto the canvas.
 * The perspective() function is a placeholder for a future
 * pixel-level 3D perspective transformation.
 *
 * Props (passed through to <canvas>):
 *   src   {string}  Image URL (Flickr thumbnail)
 *   alt   {string}  Accessible description of the photo
 *   href  {string}  Link to the photo on Flickr (unused here, passed through)
 */
const FlickrItemContent = (props) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Fill background while image loads
        context.fillStyle = '#000000';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = props.src;
        img.onload = () => {
            context.drawImage(img, 0, 0, context.canvas.width, context.canvas.height);
        };
        img.onerror = () => {
            context.fillStyle = '#222';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        };
    }, [props.src]);

    return (
        <canvas
            className="flickrflow-item-content"
            ref={canvasRef}
            aria-label={props.alt}
        />
    );
};

export default FlickrItemContent;
