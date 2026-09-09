export default async function handler(req, res) {
  const M3U_URL = process.env.M3U_URL;

  const text = await fetch(M3U_URL).then(r => r.text());

  const lines = text.split("\n");

  const groups = {
    ulusal: [],
    haber: [],
    spor: [],
    belgesel: [],
    cocuk: []
  };

  let info = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("#EXTINF")) {
      info = line;
      continue;
    }

    if (!line.startsWith("http")) continue;

    const name = info.split(",").pop().trim();

    const logo = (info.match(/tvg-logo="([^"]+)"/) || [])[1] || "";

    const group =
      (info.match(/group-title="([^"]+)"/) || [])[1] ||
      (info.match(/tvg-group="([^"]+)"/) || [])[1] ||
      "";

    const item = {
      id: name,
      type: "tv",
      name,
      poster: logo,
      posterShape: "square"
    };

    const g = group.toLowerCase();

    if (g.includes("haber")) groups.haber.push(item);
    else if (g.includes("spor")) groups.spor.push(item);
    else if (g.includes("belgesel")) groups.belgesel.push(item);
    else if (g.includes("çocuk") || g.includes("cocuk")) groups.cocuk.push(item);
    else groups.ulusal.push(item);
  }

  const id = req.query.id || "ulusal";

  res.json({ metas: groups[id] || [] });
}
