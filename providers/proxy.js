const http = require("http");
const https = require("https");

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36",
  "Referer": "https://vavoo.to/",
  "Origin": "https://vavoo.to"
};

function absolute(base, target) {
  try {
    return new URL(target, base).toString();
  } catch {
    return target;
  }
}

function rewritePlaylist(body, baseUrl, hostBase) {
  return body
    .split("\n")
    .map((line) => {
      if (!line) return line;

      if (line.startsWith("#EXT-X-KEY")) {
        return line.replace(/URI="([^"]+)"/, (_, uri) => {
          const key = absolute(baseUrl, uri);
          return `URI="${hostBase}/proxy?url=${encodeURIComponent(key)}"`;
        });
      }

      if (line.startsWith("#")) return line;

      const media = absolute(baseUrl, line);
      return `${hostBase}/proxy?url=${encodeURIComponent(media)}`;
    })
    .join("\n");
}

function proxyHandler(req, res) {
  const target = req.query.url;

  if (!target) {
    return res.status(400).send("Missing url");
  }

  const client = target.startsWith("https") ? https : http;

  const request = client.get(
    target,
    {
      headers: DEFAULT_HEADERS,
      timeout: 10000
    },
    (response) => {
      const contentType = response.headers["content-type"] || "";
      const isPlaylist =
        contentType.includes("mpegurl") ||
        target.toLowerCase().includes(".m3u8");

      if (!isPlaylist) {
        res.status(response.statusCode || 200);

        Object.entries(response.headers).forEach(([k, v]) => {
          if (
            ![
              "content-encoding",
              "content-length",
              "transfer-encoding"
            ].includes(k.toLowerCase())
          ) {
            res.setHeader(k, v);
          }
        });

        response.pipe(res);
        return;
      }

      let body = "";

      response.on("data", (c) => (body += c));

      response.on("end", () => {
        const base = target.substring(0, target.lastIndexOf("/") + 1);
        const hostBase = `${req.protocol}://${req.get("host")}`;

        const rewritten = rewritePlaylist(body, base, hostBase);

        res.setHeader(
          "Content-Type",
          "application/vnd.apple.mpegurl"
        );

        res.send(rewritten);
      });
    }
  );

  request.on("timeout", () => {
    request.destroy();
    res.status(504).end();
  });

  request.on("error", () => {
    res.status(502).end();
  });
}

module.exports = {
  proxyHandler
};
