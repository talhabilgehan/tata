const https = require("https");
const cache = require("./cache");

const BASE = "https://tvvoo.hayd.uk";

const channelMap = new Map();
let loaded = false;

function getJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, (res) => {
      let data = "";

      res.on("data", (chunk) => (data += chunk));

      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/&/g, "and")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadCatalog() {
  if (loaded) return;

  const data = await getJSON(`${BASE}/catalog/tv/vavoo_tv_tr.json`);

  for (const ch of data.metas || []) {
    channelMap.set(normalize(ch.name), ch.id);
  }

  loaded = true;
}

async function resolveVavoo(channelName) {

  const cached = cache.get(channelName);

  if (cached) {
    return cached;
  }

  await loadCatalog();

  const aliases = [
    channelName,
    channelName.replace("NOW", "FOX"),
    channelName.replace("FOX", "NOW"),
    channelName.replace("CNN TÜRK", "CNN TURK"),
    channelName.replace("A TV", "ATV"),
    channelName.replace("TRT-1", "TRT 1")
  ];

  for (const candidate of aliases) {

    const id = channelMap.get(normalize(candidate));

    if (!id) continue;

    const data = await getJSON(`${BASE}/stream/tv/${id}.json`);

    if (data.streams?.length) {

      const url = data.streams[0].url;

      cache.set(channelName, url);

      return url;
    }
  }

  return null;
}

module.exports = { resolveVavoo };
