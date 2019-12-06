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
          const length = ctx.response.header["content-length"];
          ctx.response["Content-Range"] = `bytes 0-${length}/${length}`
          ctx.response["Accept-Range"] = `bytes`
        }
        console.log("ctx>>>>", ctx);
      });
    }
  };
};
