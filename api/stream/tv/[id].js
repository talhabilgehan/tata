const RAW =
  "https://raw.githubusercontent.com/talhabilgehan/tata/main/tata.m3u";

function parseM3U(text) {
  const lines = text.split(/\r?\n/);
  const channels = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      current = {
        name: line.match(/,(.*)$/)?.[1]?.trim() || ""
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
  const name = decodeURIComponent(
    String(req.query.id)
      .replace(/^tv-/, "")
      .replace(".json", "")
  );

  const txt = await fetch(RAW).then(r => r.text());
  const channels = parseM3U(txt);

  const ch = channels.find(c => c.name === name);

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    streams: ch ? [{ url: ch.url }] : []
  });
}
