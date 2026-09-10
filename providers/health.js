const axios = require("axios");

async function isHealthy(url) {
    if (!url) return false;

    try {
        const res = await axios.get(url, {
            timeout: 10000,      // 10 saniye
            maxRedirects: 3,
            responseType: "text"
        });

        if (res.status !== 200) return false;

        const body = res.data || "";

        // HLS playlist doğrulaması
        return body.includes("#EXTM3U");

    } catch {
        return false;
    }
}

module.exports = { isHealthy };
