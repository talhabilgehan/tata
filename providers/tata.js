const { getChannel } = require("../parse-m3u");

async function resolveTata(id) {
    const channel = getChannel(id);
    return channel ? channel.stream : null;
}

module.exports = { resolveTata };
