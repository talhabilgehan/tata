app.get("/stream/tv/:id.json", async (req,res)=>{

  const id=req.params.id.replace(/^tv-/,"");
  const channel=getChannel(id);

  if(!channel){
    return res.json({streams:[]});
  }

  const result=await resolveChannel(id,channel.name);

  if(!result.stream){
    return res.json({streams:[]});
  }

  result.stream.title=`${channel.name} • ${result.source}`;

  res.json({
    streams:[result.stream]
  });

});
