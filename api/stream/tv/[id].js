const RAW="https://raw.githubusercontent.com/talhabilgehan/tata/main/tata.m3u";

function parseM3U(text){
  const lines=text.split(/\r?\n/);
  const out=[];
  let c=null;

  for(const line of lines){
    if(line.startsWith("#EXTINF")){
      c={name:line.match(/,(.*)$/)?.[1]?.trim()||""};
    }else if(c && line.startsWith("http")){
      c.url=line.trim();
      out.push(c);
      c=null;
    }
  }
  return out;
}

module.exports=async(req,res)=>{
  const txt=await fetch(RAW).then(r=>r.text());
  const channels=parseM3U(txt);

  const name=decodeURIComponent(req.query.id.replace(/^tv-/,""));
  const ch=channels.find(x=>x.name===name);

  res.status(200).json({
    streams: ch ? [{url:ch.url}] : []
  });
};
