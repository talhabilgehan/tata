const { resolveTata } = require("./tata");
const { resolveVavoo } = require("./vavoo");
const { isHealthy } = require("./health");
const healthStore = require("./healthStore");

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tataTask(id) {
  const url = await resolveTata(id);

  if (!url) throw new Error("No TATA stream");

  const healthy = await Promise.race([
    isHealthy(url),
    wait(3000).then(() => false)
  ]);

  if (!healthy) throw new Error("TATA unhealthy");

  return {
    source: "TATA",
    stream: { url }
  };
}

async function vavooTask(name) {
  const stream = await Promise.race([
    resolveVavoo(name),
    wait(3000).then(() => null)
  ]);

  if (!stream) throw new Error("No VAVOO stream");

  return {
    source: "VAVOO",
    stream
  };
}

async function resolveChannel(id, name) {

  const cached = healthStore.get(id);

  if (cached && Date.now() - cached.updated < 300000) {
    return cached;
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
