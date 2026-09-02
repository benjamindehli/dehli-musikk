import allVideos from './videos/data/all.json';

// Derived, not maintained: see the note in data/posts.js
const LATEST_COUNT = 3;

const latestVideos = [...allVideos].sort((a, b) => b.timestamp - a.timestamp).slice(0, LATEST_COUNT);

export {
  latestVideos
}

export default allVideos;
