const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

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

function absolute(req, url) {
  return `${req.protocol}://${req.get("host")}${url}`;
}

function assetPaths(name) {
  const encoded = encodeURIComponent(name);

  const clearPath = path.join(__dirname, "public", "clearlogos", `${name}.png`);
  const hasClear = fs.existsSync(clearPath);

  return {
    poster: `/poster/${encoded}.svg`,
    logo: hasClear ? `/clearlogos/${encoded}.png` : `/logos/${encoded}.png`
  };
}

// ---------------- POSTER ENGINE ----------------
// 512x512 siyah poster + ortalanmış renkli logo

app.get("/poster/:name.svg", (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const encoded = encodeURIComponent(name);
  const logoUrl = `${req.protocol}://${req.get("host")}/logos/${encoded}.png`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(`
<svg xmlns="http://www.w3.org/2000/svg"
     width="512"
     height="512"
     viewBox="0 0 512 512">

  <rect width="512" height="512" fill="#000000"/>

  <image
    href="${logoUrl}"
    x="64"
    y="64"
    width="384"
    height="384"
    preserveAspectRatio="xMidYMid meet"/>

</svg>`);
});

// ---------------- MANIFEST ----------------

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

// ---------------- CATALOG ----------------

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

// ---------------- META ----------------

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

// ---------------- STREAM ----------------

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

// ---------------- HOME ----------------

app.get("/", (req, res) => {
  res.redirect("/manifest.json");
});

app.listen(PORT, () => {
  console.log(`TATA running on port ${PORT}`);
});
