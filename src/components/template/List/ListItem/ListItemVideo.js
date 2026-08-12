'use client';

// Dependencies
import { useEffect, useRef, useState } from "react";

// Stylesheets
import style from "components/template/List/ListItem/ListItemVideo.module.scss";

/*
 * The YouTube player is only requested once the visitor asks for it. Loading it
 * up front cost several hundred kilobytes and most of the page's main thread
 * work, which showed up as a 5.8s time to interactive on mobile video pages.
 * Until the button is pressed no request reaches YouTube at all, so the embed
 * also sets no third-party cookies for visitors who never press play.
 */
const ListItemVideo = ({ videoTitle, youTubeId, startOffset, image, lang = "no" }) => {
    const [isPlayerRequested, setIsPlayerRequested] = useState(false);
    const iframeRef = useRef(null);

    // The button holding focus is replaced by the iframe, so move focus onto the
    // player rather than dropping it to the top of the document.
    useEffect(() => {
        if (isPlayerRequested) iframeRef.current?.focus();
    }, [isPlayerRequested]);

    const startParameter = startOffset ? `&start=${startOffset}` : "";
    const playerSrc = `https://www.youtube.com/embed/${youTubeId}?autoplay=1${startParameter}`;
    const sizes = "(max-width: 945px) 100vw, 945px";

    return (
        <div className={style.videoContainer}>
            {isPlayerRequested ? (
                <iframe
                    ref={iframeRef}
                    width="945"
                    height="532"
                    title={videoTitle}
                    src={playerSrc}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                ></iframe>
            ) : (
                <button
                    type="button"
                    className={style.facade}
                    onClick={() => setIsPlayerRequested(true)}
                    aria-label={lang === "en" ? `Play video: ${videoTitle}` : `Spill av video: ${videoTitle}`}
                >
                    {image ? (
                        <picture>
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
                    ) : null}
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
