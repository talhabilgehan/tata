const https = require("https");
const cache = require("./cache");
const channelMap = require("./channelMap.json");

const BASE = "https://tvvoo.hayd.uk";

function getJSON(url) {
  return new Promise((resolve, reject) => {

    const req = https.get(url, { timeout: 7000 }, (res) => {

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

async function resolveVavoo(name) {

  const cached = cache.get(name);

  if (cached) return cached;

  const id = channelMap[name];

  if (!id) {
    return null;
  }

  const data = await getJSON(
    `${BASE}/stream/tv/${id}.json`
  );

  if (!data.streams || !data.streams.length) {
    return null;
  }

  const stream = data.streams[0];

  cache.set(name, stream);

  return stream;
}

module.exports = {
  resolveVavoo
};
