import allProducts from './products/data/all.json';

// Derived, not maintained: see the note in data/posts.js
const LATEST_COUNT = 3;

const latestProducts = [...allProducts].sort((a, b) => b.timestamp - a.timestamp).slice(0, LATEST_COUNT);

export {
  latestProducts
}

export default allProducts;
