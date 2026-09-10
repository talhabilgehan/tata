const CACHE_TTL = 10 * 60 * 1000; // 10 dakika

const cache = new Map();

function get(key) {
  const item = cache.get(key);

  if (!item) return null;

  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

function set(key, value) {
  cache.set(key, {
    value,
    expires: Date.now() + CACHE_TTL
  });
}

function remove(key) {
  cache.delete(key);
}

function clear() {
  cache.clear();
}

module.exports = {
  get,
  set,
  remove,
  clear
};
