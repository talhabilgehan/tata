const https = require("https");
const cache = require("./cache");
const channelMap = require("./channelMap.json");

const BASE = "https://tvvoo.hayd.uk";
const TIMEOUT = 3000;

function getJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: TIMEOUT }, (res) => {
      let body = "";

      res.on("data", chunk => body += chunk);

      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error("Invalid JSON"));
        }
      });
    });

    req.on("error", reject);

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

function score(stream) {
  const text = `${stream.name || ""} ${stream.title || ""}`.toUpperCase();

  if (text.includes("FHD")) return 500;
  if (text.includes("FULL HD")) return 500;
  if (text.includes("1080")) return 450;
  if (text.includes("HD")) return 300;
  return 100;
}

function normalize(stream) {
  const url = stream.url || stream.externalUrl;

  if (!url) return null;

  return {
    ...stream,
    url,
    proxyHeaders: stream.proxyHeaders || {},
    behaviorHints: stream.behaviorHints || {}
  };
}

async function resolveVavoo(name) {

  const cached = cache.get(name);

  if (cached) return cached;

  const id = channelMap[name];

  if (!id) return null;

  const data = await getJSON(
    `${BASE}/stream/tv/${id}.json`
  );

  if (!Array.isArray(data.streams) || data.streams.length === 0) {
    return null;
  }

  const stream = data.streams
    .map(normalize)
    .filter(Boolean)
    .sort((a, b) => score(b) - score(a))[0];

  if (!stream) return null;

  cache.set(name, stream);

  return stream;
}

module.exports = {
  resolveVavoo
};
