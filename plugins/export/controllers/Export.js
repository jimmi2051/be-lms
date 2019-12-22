"use strict";

/**
 * Export.js controller
 *
 * @description: A set of functions called "actions" of the `export` plugin.
 */

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const _ = require("lodash");
module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async ctx => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: "ok"
    });
  },
  export: async ctx => {
    try {
      let result = {
        statusCode: 200,
        success: true,
        message: "",
        urlFile: ""
      };
      const pluginsStore = strapi.store({
        environment: "",
        type: "plugin",
        name: "content-manager"
      });
      const collectionName = ctx.request.body.collectionName;

      const pluginModels = await pluginsStore.get({ key: "schema" });
      let { models } = pluginModels;
      // Get list field of model to create header
      let fields;
      if (models.hasOwnProperty(collectionName)) {
        fields = models[collectionName].attributes;
      } else {
        return ctx.badRequest(null, "Content Type name couldn't be found");
      }
      // Get Service of Model
      let model;
      if (strapi.services.hasOwnProperty(collectionName)) {
        model = strapi.services[collectionName];
      } else {
        return ctx.badRequest(null, "Content Type name couldn't be found");
      }
      // Path to export file
      const path = "public/exports";
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
      let now = Date.now();
      let allRecord = model.find(ctx.query);
      allRecord.then(result => {
        let header = [];
        for (let key in fields) {
          header.push({
            id: key,
            title: key
          });
        }
        console.log("header>>>>", header);
        let data = [];
        result.map((item, index) => {
          data.push(item);
        });
        console.log("ata>>>>", data);

        const csvWriter = createCsvWriter({
          path: `${path}/${collectionName}-${now}.csv`,
          header
        });
        csvWriter.writeRecords(data);
      });

      result.urlFile = `https://be-lms/exports/${collectionName}-${now}.csv`;
      return result;
    } catch {
      return ctx.badRequest(
        null,
        "Something when wrong. Please wait a few minutes and try again. Thanks"
      );
    }
  }
};
