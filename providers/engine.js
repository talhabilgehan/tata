const { resolveTata } = require("./tata");
const { isHealthy } = require("./health");
const healthStore = require("./healthStore");

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tataTask(id) {
  const url = await resolveTata(id);

  if (!url) throw new Error("No stream");

  const healthy = await Promise.race([
    isHealthy(url),
    wait(3000).then(() => false)
  ]);

  if (!healthy) throw new Error("Unhealthy");

  return {
    source: "TATA",
    stream: { url }
  };
}

async function resolveChannel(id) {
  const cached = healthStore.get(id);

  if (cached && Date.now() - cached.updated < 300000) {
    return cached;
  }

  const result = await tataTask(id).catch(() => null);

  if (!result) {
    return {
      source: "OFFLINE",
      stream: null
    };
  }

  healthStore.set(id, result);
  return result;
}

module.exports = {
  resolveChannel
};
