const axios = require("axios");

const BASE = "https://tvvoo.hayd.uk";

const channelMap = new Map();
let loaded = false;

async function loadCatalog() {
    if (loaded) return;

    const res = await axios.get(
        `${BASE}/catalog/tv/vavoo_tv_tr.json`,
        { timeout: 10000 }
    );

    for (const ch of res.data.metas || []) {
        channelMap.set(ch.name.toLowerCase(), ch.id);
    }

    loaded = true;
}

async function resolveVavoo(channelName) {

    await loadCatalog();

    const id = channelMap.get(channelName.toLowerCase());

    if (!id) return null;

    const res = await axios.get(
        `${BASE}/stream/tv/${id}.json`,
        { timeout: 10000 }
    );

    const stream = res.data.streams?.[0];

    return stream ? stream.url : null;
}

module.exports = { resolveVavoo };
