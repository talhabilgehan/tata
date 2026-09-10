const { resolveTata } = require("./tata");
const { resolveVavoo } = require("./vavoo");
const { isHealthy } = require("./health");

async function resolveChannel(id,name){

  const tataUrl = await resolveTata(id);

  if(await isHealthy(tataUrl)){
    return{
      source:"TATA",
      stream:{
        url:tataUrl
      }
    };
  }

  const vavoo = await resolveVavoo(name);

  if(vavoo){
    return{
      source:"VAVOO",
      stream:vavoo
    };
  }

  return{
    source:"OFFLINE",
    stream:null
  };
}

module.exports={resolveChannel};
