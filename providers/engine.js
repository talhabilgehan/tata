const { resolveTata } = require("./tata");
const { resolveVavoo } = require("./vavoo");
const { isHealthy } = require("./health");

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    )
  ]);
}

async function resolveChannel(id, name) {
  // İkisini de aynı anda başlat
  const tataPromise = (async () => {
    const url = await resolveTata(id);

    if (!url) {
      throw new Error("No TATA stream");
    }

    const healthy = await withTimeout(isHealthy(url), 3000);

    if (!healthy) {
      throw new Error("TATA unhealthy");
    }

    return {
      source: "TATA",
      stream: {
        url
      }
    };
  })();

  const vavooPromise = (async () => {
    const stream = await withTimeout(resolveVavoo(name), 3000);

    if (!stream) {
      throw new Error("No VAVOO stream");
    }

    return {
      source: "VAVOO",
      stream
    };
  })();

  // Önce TATA'nın sonucunu bekle (en fazla 3 sn)
  try {
    return await tataPromise;
  } catch (_) {
    // TATA olmadıysa VAVOO'yu kullan
  }

  try {
    return await vavooPromise;
  } catch (_) {
    return {
      source: "OFFLINE",
      stream: null
    };
  }
}

module.exports = {
  resolveChannel
};
