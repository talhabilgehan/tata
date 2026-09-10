const fs = require("fs");
const path = require("path");

const M3U_FILE = path.join(__dirname, "tata.m3u");

let channels = [];
let grouped = {};

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[Çç]/g, "c")
    .replace(/[Ğğ]/g, "g")
    .replace(/[İIı]/g, "i")
    .replace(/[Öö]/g, "o")
    .replace(/[Şş]/g, "s")
    .replace(/[Üü]/g, "u")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function normalizeGroup(group = "") {
  const g = group.toLowerCase();

  if (g.includes("ulusal")) return "Ulusal";
  if (g.includes("spor")) return "Spor";
  if (g.includes("haber")) return "Haber";
  if (g.includes("belgesel")) return "Belgesel";
  if (g.includes("çocuk") || g.includes("cocuk")) return "Çocuk";

  return null;
}

function loadM3U() {
  const text = fs.readFileSync(M3U_FILE, "utf8");
  const lines = text.split(/\r?\n/);

  channels = [];
  grouped = {
    Ulusal: [],
    Spor: [],
    Haber: [],
    Belgesel: [],
    Çocuk: []
  };

  let current = null;

  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      const name = line.match(/,(.*)$/)?.[1]?.trim() || "Kanal";

      const group = normalizeGroup(
        line.match(/group-title="([^"]+)"/)?.[1] || ""
      );

      current = {
        id: slugify(name),
        name,
        group,
        stream: ""
      };
    }

    else if (current && line.startsWith("http")) {
      current.stream = line.trim();

      channels.push(current);

      if (current.group && grouped[current.group]) {
        grouped[current.group].push(current);
      }

      current = null;
    }
  }

  return channels;
}

loadM3U();

module.exports = {
  loadM3U,
  getChannels: () => channels,
  getGroups: () => grouped,
  getChannel: (id) => channels.find(c => c.id === id)
};
