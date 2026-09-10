const { resolveTata } = require("./tata");
const { resolveVavoo } = require("./vavoo");
const { isHealthy } = require("./health");

async function resolveChannel(id, name) {
  let url = await resolveTata(id);

  if (await isHealthy(url)) {
    return {
      source: "TATA",
      url
    };
  }

  const vavoo = await resolveVavoo(name);

  if (vavoo && await isHealthy(vavoo)) {
    return {
      source: "VAVOO",
      url: vavoo
    };
  }

  return {
    source: "OFFLINE",
    url: null
  };
}

module.exports = { resolveChannel };
