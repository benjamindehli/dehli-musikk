'use client';

// Dependencies
import { useEffect, useRef, useState } from "react";

// Stylesheets
import style from "components/template/List/ListItem/ListItemVideo.module.scss";

const IFRAME_API_SRC = "https://www.youtube.com/iframe_api";

let iframeApiPromise = null;

/*
 * The API script calls a single global callback when it is ready, so loading is
 * shared: a visitor moving between video pages loads it once.
 */
function loadIframeApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (iframeApiPromise) return iframeApiPromise;

    iframeApiPromise = new Promise((resolve) => {
        const previousCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previousCallback?.();
            resolve(window.YT);
        };
        const script = document.createElement("script");
        script.src = IFRAME_API_SRC;
        document.head.appendChild(script);
    });
    return iframeApiPromise;
}

/*
 * The YouTube player is only requested once the visitor presses play. Loading it
 * up front cost several hundred kilobytes and most of the page's main thread
 * work, which showed up as a 5.8s time to interactive on mobile video pages.
 * Until the button is pressed no request reaches YouTube at all, so the embed
 * also sets no third-party cookies for visitors who never press play.
 *
 * Playback goes through the IFrame API rather than the autoplay URL parameter.
 * Unmuted autoplay in a cross-origin frame is refused by some browsers even with
 * allow="autoplay", and when that happens YouTube falls back to showing its own
 * play button, costing the visitor a second click. Calling playVideo() once the
 * player reports ready avoids that where the browser permits it at all; where it
 * does not, YouTube's button is still there and nothing is worse than before.
 */
const ListItemVideo = ({ videoTitle, youTubeId, startOffset, image, lang = "no" }) => {
    const [isPlayerRequested, setIsPlayerRequested] = useState(false);
    const playerMountRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if (!isPlayerRequested || !playerMountRef.current || playerRef.current) return;

        let isCancelled = false;
        loadIframeApi().then((YT) => {
            if (isCancelled || !playerMountRef.current) return;
            playerRef.current = new YT.Player(playerMountRef.current, {
                videoId: youTubeId,
                playerVars: {
                    autoplay: 1,
                    // Keeps iOS from refusing to start because it wants fullscreen
                    playsinline: 1,
                    origin: window.location.origin,
                    ...(startOffset ? { start: startOffset } : {})
                },
                events: {
                    onReady: (event) => {
                        event.target.playVideo();
                        const iframe = event.target.getIframe();
                        // The API builds the iframe itself, so the accessible name
                        // and focus have to be applied afterwards. Focus moves here
                        // because the button that had it has just been replaced.
                        iframe.setAttribute("title", videoTitle);
                        iframe.focus();
                    }
                }
            });
        });

        return () => {
            isCancelled = true;
            playerRef.current?.destroy?.();
            playerRef.current = null;
        };
    }, [isPlayerRequested, youTubeId, startOffset, videoTitle]);

    const sizes = "(max-width: 945px) 100vw, 945px";
    const renderPoster = () =>
        image ? (
            <picture className={style.poster}>
                <source type="image/avif" sizes={sizes} srcSet={`${image.avif350} 350w, ${image.avif540} 540w`} />
                <source type="image/webp" sizes={sizes} srcSet={`${image.webp350} 350w, ${image.webp540} 540w`} />
                <img
                    src={image.jpg540}
                    srcSet={`${image.jpg350} 350w, ${image.jpg540} 540w`}
                    sizes={sizes}
                    width="945"
                    height="532"
                    fetchPriority="high"
                    alt=""
                />
            </picture>
        ) : null;

    return (
        <div className={style.videoContainer}>
            {isPlayerRequested ? (
                <>
                    {/* Stays underneath the player so the container does not flash
                        black while the API loads */}
                    {renderPoster()}
                    <div ref={playerMountRef} className={style.playerMount} />
                </>
            ) : (
                <button
                    type="button"
                    className={style.facade}
                    onClick={() => setIsPlayerRequested(true)}
                    aria-label={lang === "en" ? `Play video: ${videoTitle}` : `Spill av video: ${videoTitle}`}
                >
                    {renderPoster()}
                    <span className={style.playIcon} aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" focusable="false" width="1em" height="1em">
                            <path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                        </svg>
                    </span>
                </button>
            )}
        </div>
    );
};

export default ListItemVideo;
