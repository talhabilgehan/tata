export default function handler(req, res) {
  res.status(200).json({
    id: "tata.live",
    version: "1.0.0",
    name: "TATA",
    description: "Premium Live TV",
    logo: "https://tata-eosin.vercel.app/logo.png",
    resources: ["catalog", "stream"],
    types: ["tv"],
    catalogs: [
      { type: "tv", id: "ulusal", name: "Ulusal" },
      { type: "tv", id: "spor", name: "Spor" },
      { type: "tv", id: "haber", name: "Haber" },
      { type: "tv", id: "belgesel", name: "Belgesel" },
      { type: "tv", id: "cocuk", name: "Çocuk" }
    ]
  });
}
