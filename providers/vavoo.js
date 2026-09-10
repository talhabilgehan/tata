const https = require("https");
const cache = require("./cache");
const channelMap = require("./channelMap.json");
const { wrapStreamUrl } = require("./proxy");

const BASE = "https://tvvoo.hayd.uk";
const TIMEOUT = 5000;

function getJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        timeout: TIMEOUT,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
          Referer: "https://vavoo.to/",
          Origin: "https://vavoo.to"
        }
      },
      (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error("Invalid JSON"));
          }
        });
      }
    );

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
  const originalUrl = stream.url || stream.externalUrl;

  if (!originalUrl) return null;

  const headers = {
    ...(stream.proxyHeaders || {}),
    ...(stream.behaviorHints?.proxyHeaders || {})
  };

  const wrappedUrl = wrapStreamUrl(originalUrl, headers);

  return {
    ...stream,
    url: wrappedUrl,
    proxyHeaders: headers,
    behaviorHints: {
      ...(stream.behaviorHints || {}),
      notWebReady: true
    }
  };
}

async function resolveVavoo(name) {
  const cached = cache.get(name);

  if (cached) {
    return cached;
  }

  const id = channelMap[name];

  if (!id) {
    return null;
  }

  const data = await getJSON(`${BASE}/stream/tv/${id}.json`);

  if (!Array.isArray(data.streams) || data.streams.length === 0) {
    return null;
  }

  const stream = data.streams
    .map(normalize)
    .filter(Boolean)
    .sort((a, b) => score(b) - score(a))[0];

  if (!stream) {
    return null;
  }

  cache.set(name, stream);

  console.log("[VAVOO OK]", name);

  return stream;
}

module.exports = {
  resolveVavoo
};
