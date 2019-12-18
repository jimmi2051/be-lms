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
    const finalResult = {
      statusCode: 200,
      success: true,
      message: "Import data successfully."
    };

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
        skipEmptyLines: true,
        complete: result => {
          let nameModels = result.data[0];
          if (_.isArray(nameModels)) {
            nameModels = nameModels[0];
          }

          for (let key in strapi.services) {
            console.log("key>>>>", key);
            // skip loop if the property is from prototype
            if (!strapi.services.hasOwnProperty(key)) continue;
            // get service of model by nameModels
            if (key === nameModels) {
              let model = strapi.services[key];

              const listData = result.data;

              for (let i = 2; i < listData.length; i++) {
                let objModel = {};

                for (let y = 0; y < listData[i].length; y++) {
                  objModel[listData[1][y]] = listData[i][y];
                }
                model.create(objModel);
              }
            }
          }
          ctx.send(finalResult);
        }
      });
    } catch {
      return ctx.badRequest(null, "The format of the file is wrong. ");
    }
  }
};
