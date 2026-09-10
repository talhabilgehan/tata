const { resolveTata } = require("./tata");
const { resolveVavoo } = require("./vavoo");
const { isHealthy } = require("./health");
const healthStore = require("./healthStore");

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function tataTask(id) {
  const url = await resolveTata(id);

  if (!url) throw new Error("no tata");

  const healthy = await Promise.race([
    isHealthy(url),
    delay(3000).then(() => false)
  ]);

  if (!healthy) throw new Error("tata unhealthy");

  return {
    source: "TATA",
    stream: { url }
  };
}

async function vavooTask(name) {
  const stream = await Promise.race([
    resolveVavoo(name),
    delay(3000).then(() => null)
  ]);

  if (!stream) throw new Error("no vavoo");

  return {
    source: "VAVOO",
    stream
  };
}

async function resolveChannel(id, name) {

  const cached = healthStore.get(id);

  if (cached && Date.now() - cached.updated < 300000) {
    return {
      source: cached.source,
      stream: cached.stream
    };
  }

  const tataPromise = tataTask(id).catch(() => null);
  const vavooPromise = vavooTask(name).catch(() => null);

  const tata = await tataPromise;

  if (tata) {
    healthStore.set(id, tata);
    return tata;
  }

  const vavoo = await vavooPromise;

  if (vavoo) {
    healthStore.set(id, vavoo);
    return vavoo;
  }

  return {
    source: "OFFLINE",
    stream: null
  };
}

module.exports = {
  resolveChannel
};
