const https = require("https");
const cache = require("./cache");
const channelMap = require("./channelMap.json");

const BASE = "https://tvvoo.hayd.uk";

function getJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 3000 }, (res) => {
      let body = "";

      res.on("data", c => body += c);

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

function scoreStream(stream) {
  const title = `${stream.name || ""} ${stream.title || ""}`.toUpperCase();

  if (title.includes("FHD")) return 300;
  if (title.includes("FULL HD")) return 300;
  if (title.includes("1080")) return 300;
  if (title.includes("HD")) return 200;
  return 100;
}

async function resolveVavoo(name) {
  const cached = cache.get(name);
  if (cached) return cached;

  const id = channelMap[name];

  if (!id) return null;

  const data = await getJSON(`${BASE}/stream/tv/${id}.json`);

  if (!data.streams || !data.streams.length) {
    return null;
  }

  const stream = [...data.streams]
    .sort((a, b) => scoreStream(b) - scoreStream(a))[0];

  cache.set(name, stream);

  return stream;
}

module.exports = {
  resolveVavoo
};
