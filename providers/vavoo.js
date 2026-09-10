const https = require("https");
const cache = require("./cache");
const channelMap = require("./channelMap.json");

const API = "https://www.vavoo.to";
const TIMEOUT = 8000;

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (c) => (data += c));

      res.on("end", () => {
        resolve({
          status: res.statusCode,
          body: data,
          headers: res.headers
        });
      });
    });

    req.on("error", reject);

    req.setTimeout(TIMEOUT, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });

    if (body) req.write(body);

    req.end();
  });
}

async function resolveVavoo(name) {

  const cached = cache.get(name);

  if (cached) return cached;

  const id = channelMap[name];

  if (!id) return null;

  console.log("[VAVOO NEXT]", name, id);

  return null;
}

module.exports = {
  resolveVavoo,
  request,
  API
};
