function isProxyEnabled() {
  return String(process.env.PROXY_ENABLED || "").toLowerCase() === "true";
}

function getProxyConfig() {
  return {
    enabled: isProxyEnabled(),
    baseUrl: process.env.PROXY_BASE_URL || "",
    password: process.env.PROXY_PASSWORD || ""
  };
}

module.exports = {
  isProxyEnabled,
  getProxyConfig
};
