const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");

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

  return {
    poster: fs.existsSync(path.join(__dirname, "public", "poster", `${name}.jpg`))
      ? `/poster/${encoded}.jpg`
      : `/logos/${encoded}.png`,
    logo: fs.existsSync(path.join(__dirname, "public", "clearlogos", `${name}.png`))
      ? `/clearlogos/${encoded}.png`
      : `/logos/${encoded}.png`
  };
}

// ---------- PROXY ----------

app.get("/proxy", (req, res) => {

  const target = req.query.url;

  if (!target) {
    return res.status(400).end("Missing url");
  }

  const client = target.startsWith("https") ? https : http;

  client.get(target, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/116.0.0.0 Safari/537.36",
      "Referer": "https://vavoo.to/"
    }
  }, (r) => {

    res.status(r.statusCode || 200);

    Object.entries(r.headers).forEach(([k, v]) => {
      if (k.toLowerCase() !== "content-encoding") {
        res.setHeader(k, v);
      }
    });

    r.pipe(res);

  }).on("error", () => {
    res.status(502).end();
  });
});

// ---------- MANIFEST ----------

app.get("/manifest.json", (req, res) => {
  res.json({
    id: "tata.live",
    version: "1.3.0",
    name: "TATA",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    idPrefixes: ["tv-"],
    catalogs: [
      { type: "tv", id: "ulusal", name: "Ulusal" },
      { type: "tv", id: "spor", name: "Spor" },
      { type: "tv", id: "haber", name: "Haber" },
      { type: "tv", id: "belgesel", name: "Belgesel" },
      { type: "tv", id: "cocuk", name: "Çocuk" }
    ]
  });
});

const catalogMap = {
  ulusal: "Ulusal",
  spor: "Spor",
  haber: "Haber",
  belgesel: "Belgesel",
  cocuk: "Çocuk"
};

// ---------- CATALOG ----------

app.get("/catalog/tv/:id.json", (req, res) => {

  const groups = getGroups();
  const group = catalogMap[req.params.id];

  res.json({
    metas: (groups[group] || []).map((c) => {

      const assets = assetPaths(c.name);

      return {
        id: `tv-${c.id}`,
        type: "tv",
        name: c.name,
        poster: absolute(req, assets.poster),
        logo: absolute(req, assets.logo),
        posterShape: "square"
      };
    })
  });
});

// ---------- META ----------

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

// ---------- STREAM ----------

app.get("/stream/tv/:id.json", async (req, res) => {

  const id = req.params.id.replace(/^tv-/, "");
  const channel = getChannel(id);

  if (!channel) {
    return res.json({ streams: [] });
  }

  const result = await resolveChannel(id, channel.name);

  if (!result.stream) {
    return res.json({ streams: [] });
  }

  const stream = { ...result.stream };

  if (result.source === "VAVOO") {
    stream.url = absolute(
      req,
      `/proxy?url=${encodeURIComponent(stream.url)}`
    );
  }

  stream.title = `${channel.name} • ${result.source}`;

  res.json({ streams: [stream] });

});

app.get("/", (_, res) => res.redirect("/manifest.json"));

app.listen(PORT, () => {
  console.log(`TATA ${PORT}`);
});
