const http = require("http");
const https = require("https");

const TIMEOUT = 3000;

function request(url, method) {
  return new Promise((resolve) => {

    try {
      const client = url.startsWith("https") ? https : http;

      const req = client.request(url, {
        method,
        timeout: TIMEOUT,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }, (res) => {

        const ok = res.statusCode >= 200 && res.statusCode < 400;

        res.destroy();

        resolve(ok);

      });

      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });

      req.on("error", () => {
        resolve(false);
      });

      req.end();

    } catch {
      resolve(false);
    }

  });
}

async function isHealthy(url) {

  if (!url) return false;

  const head = await request(url, "HEAD");

  if (head) return true;

  return request(url, "GET");
}

module.exports = {
  isHealthy
};
