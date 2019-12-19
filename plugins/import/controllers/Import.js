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
    const pluginsStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "content-manager"
    });

    const pluginModels = await pluginsStore.get({ key: "schema" });
    let { models } = pluginModels;
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
          // Get fields of content type
          let fields = {};

          if (models.hasOwnProperty(nameModels)) {
            fields = models[nameModels].attributes;
          } else {
            return ctx.badRequest(null, "Content Type name couldn't be found");
          }

          let model = {};

          if (strapi.services.hasOwnProperty(nameModels)) {
            model = strapi.services[nameModels];
          } else {
            return ctx.badRequest(null, "Content Type name couldn't be found");
          }

          const listData = result.data;

          for (let i = 2; i < listData.length; i++) {
            let objModel = {};
            for (let y = 0; y < listData[i].length; y++) {
              const headerObject = listData[1][y];
              if (fields.hasOwnProperty(headerObject)) {
                let data = listData[i][y];
                if (fields[headerObject].hasOwnProperty("collection")) {
                  data = data.toString();
                  data = data.split("“").join('"');
                  data = data.split("”").join('"');
                  data = JSON.parse(data);
                }
                switch (fields[headerObject].type) {
                  //parse to JSON data
                  case "json":
                    data = data.toString();
                    data = data.split("“").join('"');
                    data = data.split("”").join('"');
                    data = JSON.parse(data);
                    break;
                  //parse string boolean of csv
                  case "boolean":
                    data = data.toLowerCase();
                    break;
                  default:
                    break;
                }
                objModel[headerObject] = data;
              }
            }
            model.create(objModel);
          }

          ctx.send(finalResult);
        }
      });
    } catch {
      return ctx.badRequest(null, "The format of the file is wrong. ");
    }
  }
};
