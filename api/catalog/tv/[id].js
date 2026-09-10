const RAW = "https://raw.githubusercontent.com/talhabilgehan/tata/main/tata.m3u";

const GROUPS = {
  ulusal: ["Ulusal"],
  haber: ["Haber"],
  spor: ["Spor"],
  belgesel: ["Belgesel"],
  cocuk: ["Çocuk","Cocuk"]
};

function parseM3U(text){
  const lines=text.split(/\r?\n/);
  const out=[];
  let c=null;

  for(const line of lines){
    if(line.startsWith("#EXTINF")){
      c={
        name: line.match(/,(.*)$/)?.[1]?.trim()||"",
        group: line.match(/group-title="([^"]+)"/)?.[1]||"",
        logo: line.match(/tvg-logo="([^"]+)"/)?.[1]||""
      };
    }else if(c && line.startsWith("http")){
      c.url=line.trim();
      out.push(c);
      c=null;
    }
  }
  return out;
}

module.exports = async (req,res)=>{
  const txt=await fetch(RAW).then(r=>r.text());
  const channels=parseM3U(txt);

  const metas=channels
    .filter(c=>GROUPS[req.query.id]?.some(g=>c.group.includes(g)))
    .map(c=>({
      id:`tv-${c.name}`,
      type:"tv",
      name:c.name,
      poster:c.logo,
      logo:c.logo,
      posterShape:"square"
    }));

  res.status(200).json({metas});
};
