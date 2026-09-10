const https = require("https");

async function isHealthy(url) {
  if (!url) return false;

  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let body = "";

      res.on("data", (chunk) => (body += chunk));

      res.on("end", () => {
        resolve(
          res.statusCode === 200 &&
          body.includes("#EXTM3U")
        );
      });
    });

    req.on("error", () => resolve(false));

    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

module.exports = { isHealthy };
