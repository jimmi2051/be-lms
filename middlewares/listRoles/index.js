const fs = require('fs')
const pathModule = require('path')
module.exports = strapi => {
  const regexVideo = /\w+\.mp4$/;
  return {
    initialize() {
      strapi.app.use(async (ctx, next) => {
        await next();
        // Process with api role
        if (
          ctx.method == "GET" &&
          ctx.url == "/users-permissions/roles" &&
          !ctx.request.admin
        ) {
          let tempBody = ctx.response.body.roles;
          let result = [];
          tempBody.map((item, index) => {
            if (item.type === "creator" || item.type === "user") {
              result.push(item);
            }
          });
          ctx.body.roles = result;
        }
        // Process url mp4
        if (regexVideo.test(ctx.url)) {
          const path = `${pathModule.resolve(".")}/public${ctx.url}`;
          const stat = fs.statSync(path)
          const fileSize = stat.size
          const range = ctx.headers.range
          if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1]
              ? parseInt(parts[1], 10)
              : fileSize - 1

            if (start >= fileSize) {
              ctx.response.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
              return
            }

            const chunksize = (end - start) + 1
            const file = fs.createReadStream(path, { start, end })
            ctx.response.header["Content-Range"] = `bytes ${start}-${end}/${fileSize}`,
              ctx.response.header["Accept-Ranges"] = `bytes`,
              file.pipe(ctx.response)
          } else {
            fs.createReadStream(path).pipe(ctx.response)
          }
        }
      });
    }
  };
};
