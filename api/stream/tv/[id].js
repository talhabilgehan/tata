const fs = require("fs");
const path = require("path");

function parseM3U() {
  const file = fs.readFileSync(path.join(process.cwd(), "tata.m3u"), "utf8");
  const lines = file.split(/\r?\n/);

  const channels = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      current = {
        name: line.match(/,(.*)$/)?.[1]?.trim() || "Kanal"
      };
    } else if (current && line.startsWith("http")) {
      current.url = line.trim();
      channels.push(current);
      current = null;
    }
  }

  return channels;
}

module.exports = (req, res) => {
  const id = decodeURIComponent(req.query.id.replace(/^tv-/, ""));

  const channel = parseM3U().find((c) => c.name === id);

  res.setHeader("Content-Type", "application/json");

  if (!channel) return res.json({ streams: [] });

  res.json({
    streams: [{ url: channel.url }]
  });
};
