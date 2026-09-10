const https = require("https");

const BASE = "https://tvvoo.hayd.uk";

const channelMap = new Map();
let loaded = false;

function getJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = "";

            res.on("data", chunk => data += chunk);

            res.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on("error", reject);
    });
}

async function loadCatalog() {

    if (loaded) return;

    const data = await getJSON(`${BASE}/catalog/tv/vavoo_tv_tr.json`);

    for (const ch of data.metas || []) {
        channelMap.set(ch.name.toLowerCase(), ch.id);
    }

    loaded = true;
}

async function resolveVavoo(name) {

    await loadCatalog();

    const id = channelMap.get(name.toLowerCase());

    if (!id) return null;

    const stream = await getJSON(`${BASE}/stream/tv/${id}.json`);

    return stream.streams?.[0]?.url || null;
}

module.exports = { resolveVavoo };
