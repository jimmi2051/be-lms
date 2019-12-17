"use strict";

/**
 * Import.js controller
 *
 * @description: A set of functions called "actions" of the `import` plugin.
 */
const _ = require("lodash");
const Papa = require("papaparse/papaparse.min.js");
const fs = require("fs");
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
    const { files = {} } = ctx.request.body.files;
    if (_.isEmpty(files)) {
      return ctx.badRequest(
        null,
        ctx.request.admin
          ? [{ messages: [{ id: "Upload.status.empty" }] }]
          : "Files are empty"
      );
    }
    const content = fs.readFileSync(files.path, "utf8");
    try {
      Papa.parse(content, {
        complete: result => {
          console.log("result>>>", result.data);
          ctx.send(result.data);
        }
      });
    } catch {
      return ctx.badRequest(null, "Format of file is wrong. ");
    }
  }
};
