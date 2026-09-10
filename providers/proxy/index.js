const { buildProxyUrl } = require("./build");
const { isProxyEnabled, getProxyConfig } = require("./config");

function wrapStreamUrl(url, headers = {}) {
  if (!isProxyEnabled()) {
    return url;
  }

  return buildProxyUrl(url, headers);
}

module.exports = {
  wrapStreamUrl,
  buildProxyUrl,
  isProxyEnabled,
  getProxyConfig
};
