const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const {
  getGroups,
  getChannel,
  loadM3U
} = require("./parse-m3u");

const { resolveVavoo } = require("./providers/vavoo");
const { isHealthy } = require("./providers/health");

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
  const hasPoster = fs.existsSync(posterFile);

  const clearFile = path.join(__dirname, "public", "clearlogos", `${name}.png`);
  const hasClear = fs.existsSync(clearFile);

  return {
    poster: hasPoster
      ? `/poster/${encoded}.jpg`
      : `/logos/${encoded}.png`,

    logo: hasClear
      ? `/clearlogos/${encoded}.png`
      : `/logos/${encoded}.png`
  };
}

// ================= MANIFEST =================

app.get("/manifest.json", (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  res.json({
    id: "tata.live",
    version: "1.1.0",
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

// ================= CATALOG =================

const catalogMap = {
  ulusal: "Ulusal",
  spor: "Spor",
  haber: "Haber",
  belgesel: "Belgesel",
  cocuk: "Çocuk"
};

app.get("/catalog/tv/:id.json", (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const groupName = catalogMap[req.params.id];
  const groups = getGroups();

  const metas = (groups[groupName] || []).map(channel => {
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

// ================= META =================

app.get("/meta/tv/:id.json", (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const id = req.params.id.replace(/^tv-/, "");
  const channel = getChannel(id);

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

// ================= STREAM =================

app.get("/stream/tv/:id.json", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const id = req.params.id.replace(/^tv-/, "");
  const channel = getChannel(id);

  if (!channel) {
    return res.json({ streams: [] });
  }

  let streamUrl = channel.stream;
  let source = "TATA";

  try {
    const healthy = await isHealthy(streamUrl);

    if (!healthy) {
      const vavooUrl = await resolveVavoo(channel.name);

      if (vavooUrl) {
        streamUrl = vavooUrl;
        source = "VAVOO";
      }
    }
  } catch (err) {
    console.log(`[Fallback] ${channel.name}: ${err.message}`);
  }

  res.json({
    streams: [
      {
        title: `${channel.name} • ${source}`,
        url: streamUrl
      }
    ]
  });
});

// ================= HOME =================

app.get("/", (req, res) => {
  res.redirect("/manifest.json");
});

app.listen(PORT, () => {
  console.log(`TATA running on port ${PORT}`);
});
