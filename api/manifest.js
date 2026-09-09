export default function handler(req, res) {
  res.setHeader("Content-Type","application/manifest+json");

  res.status(200).json({
    id:"talhabilgehan.tata.tv",
    version:"2.0.0",
    name:"TATA Live TV",
    description:"95 Kanallı Nuvio TV",
    resources:["catalog","stream"],
    types:["tv"],
    idPrefixes:["tv-"],
    catalogs:[
      {type:"tv",id:"ulusal",name:"Ulusal"},
      {type:"tv",id:"haber",name:"Haber"},
      {type:"tv",id:"spor",name:"Spor"},
      {type:"tv",id:"belgesel",name:"Belgesel"},
      {type:"tv",id:"cocuk",name:"Çocuk"}
    ]
  });
}
