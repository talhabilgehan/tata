export default async function handler(req, res) {
  const M3U_URL = process.env.M3U_URL;

  const text = await fetch(M3U_URL).then(r => r.text());

  const lines = text.split("\n");

  const id = req.query.id;

  let info = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("#EXTINF")) {
      info = line;
      continue;
    }

    if (!line.startsWith("http")) continue;

    const name = info.split(",").pop().trim();

    if (name === id) {
      return res.json({
        streams: [{ url: line.trim() }]
      });
    }
  }

  res.json({ streams: [] });
}
