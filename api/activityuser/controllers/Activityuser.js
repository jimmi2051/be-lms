/* eslint-disable quotes */
"use strict";

/**
 * Read the documentation () to implement custom controller functions
 */
const _ = require("lodash");
module.exports = {
  update_custom: async (ctx, next) => {
    let result = {
      statusCode: 200,
      success: true,
      message: "Update successfully."
    };
    const { activityusers } = ctx.state.user;
    const trainingId = ctx.params._id;
    const moduleId = ctx.request.body.moduleId;
    // Check training exists in activity user ---
    let checkExist = false;
    let currentActivity = {};
    activityusers.map((item, index) => {
      const { training } = item;
      let itemTrainingId = _.isEmpty(training) ? "" : training.toString();
      if (itemTrainingId === trainingId) {
        checkExist = true;
        currentActivity = item;
      }
    });
    if (!checkExist) {
      result.statusCode = 400;
      result.success = false;
      result.message =
        "Error! Training not found. Please check your training and try again.";
      return result;
    }

    const populateLearningPath = Learningpath.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(" ");

    const populateRelationCourse = Learningpath.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(" ");

    let learningPathOfTraining;
    await Learningpath.find({})
      .where("training", trainingId)
      .populate(populateLearningPath)
      .exec()
      .then(result => {
        learningPathOfTraining = result;
        return result;
      });

    let relationCourseOfModule;
    await Relationcoursemodule.find({})
      .where("module", moduleId)
      .populate(populateRelationCourse)
      .exec()
      .then(result => {
        relationCourseOfModule = result;
        return result;
      });
    let listCourses = [];
    learningPathOfTraining.map((learningPath, idxLearning) => {
      relationCourseOfModule.map((relationCourse, idxRelation) => {
        if (
          _.isEqual(learningPath.course._id, relationCourse.course._id) &&
          !_.isNull(learningPath.course)
        ) {
          listCourses.push(learningPath.course._id);
        }
      });
    });

    let { courses, totalMark } = currentActivity;
    if (_.isArray(courses)) {
      listCourses.map((item, index) => {
        const idxCourse = _.findIndex(courses, course =>
          _.isEqual(course.id, item)
        );
        // Exists course in activity
        if (idxCourse > -1) {
          const currentCourse = courses[idxCourse];
          const idxModule = _.findIndex(
            currentCourse.modules,
            module => module === moduleId
          );
          if (idxModule === -1) {
            currentCourse.modules.push(moduleId);
          }
        } else {
          courses.push({
            id: item,
            modules: [moduleId]
          });
        }
      });
    }
    return strapi.services.activityuser.update(
      { _id: currentActivity._id },
      { courses: courses }
    );
  }
};
