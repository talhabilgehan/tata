export default async function handler(req,res){

const M3U=process.env.M3U_URL;

const txt=await fetch(M3U).then(r=>r.text());

const lines=txt.split("\n");

const cats={
ulusal:[],
haber:[],
spor:[],
belgesel:[],
cocuk:[]
};

let info="";

for(let i=0;i<lines.length;i++){

const line=lines[i];

if(line.startsWith("#EXTINF")){
info=line;
continue;
}

if(!line.startsWith("http")) continue;

const name=info.split(",").pop().trim();

const logo=(info.match(/tvg-logo="([^"]+)"/)||[])[1]||"";

const group=((info.match(/group-title="([^"]+)"/)||[])[1]||(info.match(/tvg-group="([^"]+)"/)||[])[1]||"").toLowerCase();

const item={
id:"tv-"+encodeURIComponent(name),
type:"tv",
name,
poster:logo,
logo,
posterShape:"square"
};

if(group.includes("haber"))
cats.haber.push(item);
else if(group.includes("spor"))
cats.spor.push(item);
else if(group.includes("belgesel"))
cats.belgesel.push(item);
else if(group.includes("çocuk")||group.includes("cocuk"))
cats.cocuk.push(item);
else
cats.ulusal.push(item);

}

const id=req.query.id||"ulusal";

res.json({
metas:cats[id]||[]
});

}
