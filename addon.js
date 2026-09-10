const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const {
  getGroups,
  getChannel,
  loadM3U
} = require("./parse-m3u");

const { resolveChannel } = require("./providers/engine");

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

loadM3U();

function absolute(req, url) {
  return `${req.protocol}://${req.get("host")}${url}`;
}

function assetPaths(name) {
  const encoded = encodeURIComponent(name);

  const posterFile = path.join(__dirname, "public", "poster", `${name}.jpg`);
  const clearFile = path.join(__dirname, "public", "clearlogos", `${name}.png`);

  return {
    poster: fs.existsSync(posterFile)
      ? `/poster/${encoded}.jpg`
      : `/logos/${encoded}.png`,
    logo: fs.existsSync(clearFile)
      ? `/clearlogos/${encoded}.png`
      : `/logos/${encoded}.png`
  };
}

// ---------- Manifest ----------

app.get("/manifest.json", (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  res.json({
    id: "tata.live",
    version: "1.2.0",
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

// ---------- Catalog ----------

const catalogMap = {
  ulusal: "Ulusal",
  spor: "Spor",
  haber: "Haber",
  belgesel: "Belgesel",
  cocuk: "Çocuk"
};

app.get("/catalog/tv/:id.json", (req, res) => {
  const groups = getGroups();
  const group = catalogMap[req.params.id];

  const metas = (groups[group] || []).map((channel) => {
    const assets = assetPaths(channel.name);

    return {
      id: `tv-${channel.id}`,
      type: "tv",
      name: channel.name,
      poster: absolute(req, assets.poster),
      logo: absolute(req, assets.logo),
      posterShape: "square"
    };
  });

  res.json({ metas });
});

// ---------- Meta ----------

app.get("/meta/tv/:id.json", (req, res) => {
  const channel = getChannel(req.params.id.replace(/^tv-/, ""));

  if (!channel) {
    return res.status(404).json({ meta: null });
  }

  const assets = assetPaths(channel.name);

  res.json({
    meta: {
      id: `tv-${channel.id}`,
      type: "tv",
      name: channel.name,
      logo: absolute(req, assets.logo)
    }
  });
});

// ---------- Stream ----------

app.get("/stream/tv/:id.json", async (req, res) => {

  const id = req.params.id.replace(/^tv-/, "");
  const channel = getChannel(id);

  if (!channel) {
    return res.json({ streams: [] });
  }

  const result = await resolveChannel(id, channel.name);

  if (!result.url) {
    return res.json({ streams: [] });
  }

  res.json({
    streams: [
      {
        title: `${channel.name} • ${result.source}`,
        url: result.url
      }
    ]
  });
});

app.get("/", (req, res) => res.redirect("/manifest.json"));

app.listen(PORT, () => {
  console.log(`TATA ${PORT}`);
});
