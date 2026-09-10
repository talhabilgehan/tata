const https = require("https");
const cache = require("./cache");

const BASE = "https://tvvoo.hayd.uk";

const channelMap = new Map();
let loaded = false;

function getJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 7000 }, (res) => {

      let body = "";

      res.on("data", c => body += c);

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

function normalize(text){
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^\w\s]/g,"")
    .replace(/\s+/g," ")
    .trim();
}

async function loadCatalog(){

  if(loaded) return;

  const data = await getJSON(`${BASE}/catalog/tv/vavoo_tv_tr.json`);

  for(const ch of data.metas||[]){
    channelMap.set(normalize(ch.name), ch.id);
  }

  loaded=true;
}

function aliases(name){

  return[
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

    const data = await getJSON(
      `${BASE}/stream/tv/${encodeURIComponent(id)}.json`
    );

    if(data.streams?.length){

      const stream = data.streams[0];

      cache.set(name,stream);

      return stream;
    }
  }

  return null;
}

module.exports={resolveVavoo};
