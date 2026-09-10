const channels = require("../../../tata.m3u");

module.exports = (req, res) => {
  const id = req.query.id;

  const groups = {
    ulusal: "Ulusal",
    haber: "Haber",
    spor: "Spor",
    belgesel: "Belgesel",
    cocuk: "Çocuk"
  };

  const metas = channels
    .filter(c => c.group === groups[id])
    .map(c => ({
      id: "tv-" + c.name,
      type: "tv",
      name: c.name,
      poster: c.logo || "",
      logo: c.logo || "",
      posterShape: "square"
    }));

  res.status(200).json({ metas });
};
