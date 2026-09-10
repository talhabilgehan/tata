const fs = require("fs");

const input = JSON.parse(
  fs.readFileSync("vavoo_tv_tr.json", "utf8")
);

const map = {};

for (const ch of input.metas || []) {
  if (ch.name && ch.id) {
    map[ch.name] = ch.id;
  }
}

fs.writeFileSync(
  "providers/channelMap.json",
  JSON.stringify(map, null, 2),
  "utf8"
);

console.log(`Tamamlandı: ${Object.keys(map).length} kanal yazıldı.`);
