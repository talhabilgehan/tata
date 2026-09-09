export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  res.status(200).json({
    metas: [
      {
        id: "tata-trt1",
        type: "tv",
        name: "TRT 1",
        poster: "https://itv224186.tmp.tivibu.com.tr:6430/images/poster/20250801839124.png",
        logo: "https://itv224186.tmp.tivibu.com.tr:6430/images/poster/20250801839124.png"
      },
      {
        id: "tata-atv",
        type: "tv",
        name: "ATV",
        poster: "https://itv224234.tmp.tivibu.com.tr:6430/images/poster/20250801838305.png",
        logo: "https://itv224234.tmp.tivibu.com.tr:6430/images/poster/20250801838305.png"
      },
      {
        id: "tata-kanald",
        type: "tv",
        name: "KANAL D",
        poster: "https://itv224234.tmp.tivibu.com.tr:6430/images/poster/20250801838833.png",
        logo: "https://itv224234.tmp.tivibu.com.tr:6430/images/poster/20250801838833.png"
      }
    ]
  });
}
