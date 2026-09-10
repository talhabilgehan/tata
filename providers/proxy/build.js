const { getProxyConfig } = require("./config");

function buildProxyUrl(url, headers = {}) {
  const cfg = getProxyConfig();

  if (!cfg.enabled || !cfg.baseUrl) {
    return url;
  }

  const params = new URLSearchParams();

  params.set("d", url);

  if (cfg.password) {
    params.set("api_password", cfg.password);
  }

  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      params.set(`h_${key.toLowerCase()}`, value);
    }
  });

  return `${cfg.baseUrl.replace(/\/$/, "")}/proxy/hls/manifest.m3u8?${params}`;
}

module.exports = {
  buildProxyUrl
};
