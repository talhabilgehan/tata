import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { id } = req.query;

  const text = fs.readFileSync(
    path.join(process.cwd(), "tata.m3u"),
    "utf8"
  );

  const lines = text.split(/\r?\n/);
  const metas = [];

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("#EXTINF")) continue;

    const extinf = lines[i];
    const groupLine = lines[i + 1] || "";
    const group = groupLine.startsWith("#EXTGRP:")
      ? groupLine.replace("#EXTGRP:", "").trim()
      : "";

    const name = extinf.split(",").pop().trim();
    const logo = (extinf.match(/tvg-logo="([^"]+)"/) || [])[1] || "";

    const gid =
      group === "Ulusal" ? "ulusal" :
      group === "Haber" ? "haber" :
      group === "Spor" ? "spor" :
      group === "Belgesel" ? "belgesel" :
      group === "Çocuk" ? "cocuk" :
      null;

    if (gid !== id) continue;

    metas.push({
      id: "tv-" + encodeURIComponent(name),
      type: "tv",
      name,
      poster: logo,
      logo,
      posterShape: "square"
    });
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ metas });
}
