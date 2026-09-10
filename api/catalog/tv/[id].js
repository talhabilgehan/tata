const RAW = "https://raw.githubusercontent.com/talhabilgehan/tata/main/tata.m3u";

const GROUPS = {
  ulusal: ["Ulusal"],
  haber: ["Haber"],
  spor: ["Spor"],
  belgesel: ["Belgesel"],
  cocuk: ["Çocuk", "Cocuk"]
};

function parseM3U(text) {
  const lines = text.split(/\r?\n/);
  const channels = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      current = {
        name: line.match(/,(.*)$/)?.[1]?.trim() || "",
        group:
          line.match(/group-title="([^"]+)"/)?.[1] ||
          line.match(/tvg-group="([^"]+)"/)?.[1] ||
          "",
        logo: line.match(/tvg-logo="([^"]+)"/)?.[1] || ""
      };
    } else if (current && line.startsWith("http")) {
      current.url = line.trim();
      channels.push(current);
      current = null;
    }
  }

  return channels;
}

export default async function handler(req, res) {
  const id = String(req.query.id).replace(".json", "");

  const txt = await fetch(RAW).then(r => r.text());
  const channels = parseM3U(txt);

  const metas = channels
    .filter(c => GROUPS[id]?.some(g => c.group.includes(g)))
    .map(c => ({
      id: `tv-${encodeURIComponent(c.name)}`,
      type: "tv",
      name: c.name,
      poster: c.logo,
      logo: c.logo,
      posterShape: "square"
    }));

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ metas });
}
