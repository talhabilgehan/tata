const https = require("https");
const cache = require("./cache");

const BASE = "https://tvvoo.hayd.uk";

const channelMap = new Map();
let catalogLoaded = false;

function getJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {

      let body = "";

      res.on("data", chunk => body += chunk);

      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error("Invalid JSON"));
        }
      });

    });

    req.on("error", reject);

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadCatalog() {

  if (catalogLoaded) return;

  const data = await getJSON(`${BASE}/catalog/tv/vavoo_tv_tr.json`);

  const metas = Array.isArray(data.metas) ? data.metas : [];

  for (const ch of metas) {
    channelMap.set(normalize(ch.name), ch.id);
  }

  catalogLoaded = true;
}

function aliases(name){

  return [
    name,
    name.replace(/^NOW$/i,"FOX"),
    name.replace(/^FOX$/i,"NOW"),
    name.replace("CNN TÜRK","CNN TURK"),
    name.replace("TRT-1","TRT 1"),
    name.replace("A TV","ATV"),
    name.replace("TV 8","TV8")
  ];
}

async function resolveVavoo(name){

  const cached = cache.get(name);

  if(cached) return cached;

  await loadCatalog();

  for(const candidate of aliases(name)){

    const id = channelMap.get(normalize(candidate));

    if(!id) continue;

    const data = await getJSON(`${BASE}/stream/tv/${id}.json`);

    if(data.streams?.length){

      const url = data.streams[0].url;

      cache.set(name,url);

      return url;
    }
  }

  return null;
}

module.exports = { resolveVavoo };
