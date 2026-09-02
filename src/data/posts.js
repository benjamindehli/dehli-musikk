import allPosts from './posts/data/all.json';

/*
 * The homepage's "latest" list, derived rather than maintained.
 *
 * This used to be a latest.json kept beside all.json by hand, which meant every
 * new post needed editing in two files and a stale homepage was one forgotten
 * edit away.
 *
 * Sorted rather than sliced off the front, so it stays right even if all.json
 * is ever not newest-first. Array.prototype.sort is stable, so items sharing a
 * timestamp keep the order they have in the file - which is the order the
 * authoring app deliberately gives them, and what orderNumber records there.
 */
const LATEST_COUNT = 3;

const latestPosts = [...allPosts].sort((a, b) => b.timestamp - a.timestamp).slice(0, LATEST_COUNT);

export {
  latestPosts
}

export default allPosts;
