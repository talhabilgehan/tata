const express = require("express");
const cors = require("cors");
const path = require("path");

const {
  getGroups,
  getChannel,
  loadM3U
} = require("./parse-m3u");

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

loadM3U();

function absoluteLogo(req, logo) {
  return `${req.protocol}://${req.get("host")}${logo}`;
}

// Manifest
app.get("/manifest.json", (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  res.json({
    id: "tata.live",
    version: "1.0.0",
    name: "TATA",
    description: "Premium Live TV",

    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    idPrefixes: ["tv-"],

    catalogs: [
      { type: "tv", id: "ulusal", name: "Ulusal" },
      { type: "tv", id: "spor", name: "Spor" },
      { type: "tv", id: "haber", name: "Haber" },
      { type: "tv", id: "belgesel", name: "Belgesel" },
      { type: "tv", id: "cocuk", name: "Çocuk" }
    ],

    behaviorHints: {
      configurable: false,
      configurationRequired: false
    }
  });
});

const catalogMap = {
  ulusal: "Ulusal",
  spor: "Spor",
  haber: "Haber",
  belgesel: "Belgesel",
  cocuk: "Çocuk"
};

// Catalog
app.get("/catalog/tv/:id.json", (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const groupName = catalogMap[req.params.id];
  const groups = getGroups();

  const metas = (groups[groupName] || []).map(channel => ({
    id: `tv-${channel.id}`,
    type: "tv",
    name: channel.name,
    poster: absoluteLogo(req, channel.logo),
    logo: absoluteLogo(req, channel.logo),
    posterShape: "square"
  }));

  res.json({ metas });
});

// Meta
app.get("/meta/tv/:id.json", (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const id = req.params.id.replace(/^tv-/, "");
  const channel = getChannel(id);

  if (!channel) {
    return res.status(404).json({ meta: null });
  }

  res.json({
    meta: {
      id: `tv-${channel.id}`,
      type: "tv",
      name: channel.name,
      poster: absoluteLogo(req, channel.logo),
      logo: absoluteLogo(req, channel.logo),
      posterShape: "square"
    }
  });
});

// Stream
app.get("/stream/tv/:id.json", (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const id = req.params.id.replace(/^tv-/, "");
  const channel = getChannel(id);

  if (!channel) {
    return res.json({ streams: [] });
  }

  res.json({
    streams: [
      {
        title: channel.name,
        url: channel.stream
      }
    ]
  });
});

app.get("/", (req, res) => {
  res.redirect("/manifest.json");
});

app.listen(PORT, () => {
  console.log(`TATA running on port ${PORT}`);
});
