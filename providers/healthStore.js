const store = new Map();

function get(id) {
  return store.get(id) || null;
}

function set(id, data) {
  store.set(id, {
    ...data,
    updated: Date.now()
  });
}

function all() {
  return Object.fromEntries(store);
}

module.exports = {
  get,
  set,
  all
};
