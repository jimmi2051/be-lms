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
      .populate({
        path: "course",
        populate: {
          path: "relationcoursemodules"
        }
      })
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

    let { courses, totalMark } = currentActivity;
    learningPathOfTraining.map((learningPath, idxLearning) => {
      relationCourseOfModule.map((relationCourse, idxRelation) => {
        if (
          !_.isNull(learningPath.course) &&
          !_.isNull(relationCourse.course) &&
          _.isEqual(learningPath.course._id, relationCourse.course._id)
        ) {
          const courseId = learningPath.course._id;
          if (_.isArray(courses)) {
            const idxCourse = _.findIndex(courses, course =>
              _.isEqual(course.id.toString(), courseId.toString())
            );
            // Exists course in activity
            if (idxCourse > -1) {
              const currentCourse = courses[idxCourse];
              const idxModule = _.findIndex(
                currentCourse.modules,
                module => module.toString() === moduleId.toString()
              );
              if (idxModule === -1) {
                currentCourse.modules.push(moduleId);
                if (
                  learningPath.course.relationcoursemodules.length ===
                  currentCourse.modules.length
                ) {
                  const mark = learningPath.markForCourse
                    ? learningPath.markForCourse
                    : 0;
                  totalMark += mark;
                }
              }
            } else {
              courses.push({
                id: courseId,
                modules: [moduleId]
              });
              if (learningPath.course.relationcoursemodules.length === 1) {
                totalMark += learningPath.markForCourse;
              }
            }
          }
        }
      });
    });

    return strapi.services.activityuser.update(
      { _id: currentActivity._id },
      { courses, totalMark }
    );
  }
};
