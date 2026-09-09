export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  res.status(200).json({
    id: "talhabilgehan.tata.tv",
    version: "1.0.0",
    name: "TATA Live TV",
    description: "95 kanallık canlı TV",
    resources: ["catalog", "stream"],
    types: ["tv"],
    catalogs: [
      { type: "tv", id: "ulusal", name: "📺 Ulusal" },
      { type: "tv", id: "haber", name: "📰 Haber" },
      { type: "tv", id: "spor", name: "⚽ Spor" },
      { type: "tv", id: "belgesel", name: "🌍 Belgesel" },
      { type: "tv", id: "cocuk", name: "👶 Çocuk" }
    ]
  });
}
