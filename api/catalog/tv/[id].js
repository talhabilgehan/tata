const fs = require("fs");
const path = require("path");

const GROUPS = {
  ulusal: ["Ulusal", "National"],
  haber: ["Haber", "News"],
  spor: ["Spor", "Sports"],
  belgesel: ["Belgesel", "Documentary"],
  cocuk: ["Çocuk", "Cocuk", "Kids", "Kid"]
};

function parseM3U() {
  const file = fs.readFileSync(path.join(process.cwd(), "tata.m3u"), "utf8");
  const lines = file.split(/\r?\n/);

  const channels = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      const name = line.match(/,(.*)$/)?.[1]?.trim() || "Kanal";
      const group =
        line.match(/group-title="([^"]+)"/)?.[1] || "Ulusal";
      const logo = line.match(/tvg-logo="([^"]+)"/)?.[1] || "";

      current = { name, group, logo };
    } else if (current && line.startsWith("http")) {
      current.url = line.trim();
      channels.push(current);
      current = null;
    }
  }

  return channels;
}

module.exports = (req, res) => {
  const id = req.query.id;

  const channels = parseM3U();

  const metas = channels
    .filter((c) =>
      GROUPS[id]?.some((g) =>
        c.group.toLowerCase().includes(g.toLowerCase())
      )
    )
    .map((c) => ({
      id: `tv-${c.name}`,
      type: "tv",
      name: c.name,
      poster: c.logo,
      logo: c.logo,
      posterShape: "square"
    }));

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ metas });
};
