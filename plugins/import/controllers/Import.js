"use strict";

/**
 * Import.js controller
 *
 * @description: A set of functions called "actions" of the `import` plugin.
 */

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async ctx => {
    // Add your own logic here.
    const pluginsStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "content-manager"
    });

    const models = await pluginsStore.get({ key: "schema" });

    ctx.body = {
      models
    };
  },
  import: async ctx => {
    const pluginsStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "content-manager"
    });

    const models = await pluginsStore.get({ key: "schema" });

    ctx.body = {
      models
    };
  }
};
