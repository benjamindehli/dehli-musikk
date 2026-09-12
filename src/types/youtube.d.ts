/*
 * The slice of the YouTube IFrame Player API this site actually calls.
 *
 * Deliberately not the whole API and deliberately not @types/youtube: the
 * player is created in one component, with four methods and one event between
 * them, and a hand-written declaration of exactly that surface says more about
 * how the site uses YouTube than a complete third-party definition would. If a
 * new call is added, it fails here first.
 *
 * The script is loaded at runtime from youtube.com, so nothing imports these -
 * they describe globals the API script installs on window.
 */

/** The player instance returned by `new YT.Player(...)`. */
interface YouTubePlayer {
    playVideo(): void;
    /** The API builds the iframe itself, so it is only reachable through this. */
    getIframe(): HTMLIFrameElement;
    destroy(): void;
}

interface YouTubePlayerEvent {
    target: YouTubePlayer;
}

interface YouTubePlayerOptions {
    videoId: string;
    playerVars?: {
        autoplay?: 0 | 1;
        playsinline?: 0 | 1;
        origin?: string;
        start?: number;
    };
    events?: {
        onReady?: (event: YouTubePlayerEvent) => void;
    };
}

interface YouTubeApi {
    Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
}

interface Window {
    /** Present only once the API script has finished loading. */
    YT?: YouTubeApi;
    /*
     * The single global the API script calls when it is ready. The site chains
     * onto whatever was already there rather than replacing it, so this may
     * already be set by an earlier mount.
     */
    onYouTubeIframeAPIReady?: () => void;
}
