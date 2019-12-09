const range = require("koa-range");
module.exports = strapi => {
  return {
    initialize() {
      strapi.app.use(range);
    }
  };
};
