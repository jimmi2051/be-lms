"use strict";

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  update_custom: async (ctx, next) => {
    let result = {
      statusCode: 200,
      success: true,
      message: "Update successfully."
    };
    // console.log("ctx>>>", ctx.request.user);
    console.log("id>>>", ctx.params);
    console.log("body>>>", ctx.request.body);
    const { activityusers } = ctx.state.user;
    console.log("Activity User", activityusers);
    const populate = Learningpath.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(" ");
    console.log("populate...", populate);
    const training_query = Training.find({})
      .where("_id", ctx.params._id)
      .populate({
        path: "learningpaths"
      })
      .where({
        learningpaths_course: "5d9a052afa842c10ba72c545"
      });
    const query = Learningpath.find({}).where("training", ctx.params._id);
    const query_2 = Relationcoursemodule.find({
      module: { $ne: null }
    }).populate({
      path: "module",
      match: { _id: ctx.request.body.moduleId }
    });
    // const currentTraining = query.exec();
    // console.log("Learning path>>>>>", query);
    const query_3 = Relationcoursemodule.find({})
      .populate({
        path: "module"
      })
      .populate({
        path: "course",
        populate: {
          path: "learningpaths",
          populate: {
            path: "training"
          }
        }
      })
      .where("module", ctx.request.body.moduleId)
      .where("training", ctx.params._id)
      .exec();
    // console.log("query_2", query_2.prototype.all());
    return training_query;

    // return strapi.services.activityuser.edit_custom(
    //   ctx.params,
    //   ctx.request.body
    // );
    return 1;
  }
};
