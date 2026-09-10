const axios = require("axios");

async function isHealthy(url) {

    if (!url) return false;

    try {

        const res = await axios.get(url, {
            timeout: 5000,
            maxRedirects: 3
        });

        return res.status === 200;

    } catch {

        return false;

    }
}

module.exports = { isHealthy };
