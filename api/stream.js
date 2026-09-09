import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { id } = req.query;

  const m3u = fs.readFileSync(path.join(process.cwd(), "tata.m3u"), "utf8");
  const blocks = m3u.split("#EXTINF");

  let url = "";

  for (const block of blocks) {
    if (id === "tata-trt1" && block.includes("TRT 1")) {
      url = block.trim().split("\n").pop();
      break;
    }
    if (id === "tata-atv" && block.includes("ATV")) {
      url = block.trim().split("\n").pop();
      break;
    }
    if (id === "tata-kanald" && block.includes("KANAL D")) {
      url = block.trim().split("\n").pop();
      break;
    }
  }

  res.setHeader("Content-Type", "application/json");

  res.status(200).json({
    streams: [{ url }]
  });
}
