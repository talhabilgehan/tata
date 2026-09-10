const { resolveVavoo } = require("./providers/vavoo");

(async () => {
    console.log(await resolveVavoo("TRT 1"));
})();
