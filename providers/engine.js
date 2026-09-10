const { resolveTata } = require("./tata");
const { resolveVavoo } = require("./vavoo");
const { isHealthy } = require("./health");

function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), ms);
  });
}

async function tataTask(id) {
  const url = await resolveTata(id);

  if (!url) {
    throw new Error("No TATA stream");
  }

  const healthy = await Promise.race([
    isHealthy(url),
    timeout(3000)
  ]);

  if (!healthy) {
    throw new Error("TATA unhealthy");
  }

  return {
    source: "TATA",
    stream: {
      url
    }
  };
}

async function vavooTask(name) {
  const stream = await Promise.race([
    resolveVavoo(name),
    timeout(3000)
  ]);

  if (!stream) {
    throw new Error("No VAVOO stream");
  }

  return {
    source: "VAVOO",
    stream
  };
}

async function resolveChannel(id, name) {
  const results = await Promise.allSettled([
    tataTask(id),
    vavooTask(name)
  ]);

  const tata = results[0];
  const vavoo = results[1];

  // Öncelik: TATA sağlıklıysa onu kullan
  if (tata.status === "fulfilled") {
    return tata.value;
  }

  // TATA başarısızsa VAVOO
  if (vavoo.status === "fulfilled") {
    return vavoo.value;
  }

  return {
    source: "OFFLINE",
    stream: null
  };
}

module.exports = {
  resolveChannel
};
