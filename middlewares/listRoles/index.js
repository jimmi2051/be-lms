module.exports = strapi => {
  return {
    initialize() {
      strapi.app.use(async (ctx, next) => {
        await next();
        if (ctx.method == "GET" && ctx.url == "/users-permissions/roles") {
          let tempBody = ctx.response.body.roles;
          let result = [];
          tempBody.map((item, index) => {
            if (item.type === "creator" || item.type === "user") {
              result.push(item);
            }
          });
          ctx.body.roles = result;
        }
      });
    }
  };
};
