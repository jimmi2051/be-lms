"use strict";
// Public dependencies.
const _ = require("lodash");
/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {
  edit_custom: async (params, values) => {
    // Extract values related to relational data.
    const relations = _.pick(
      values,
      Activityuser.associations.map(a => a.alias)
    );
    const data = _.omit(
      values,
      Activityuser.associations.map(a => a.alias)
    );

    // Update entry with no-relational data.
    const entry = await Activityuser.updateOne(params, data, { multi: true });

    // Update relational data and return the entry.
    return Activityuser.updateRelations(
      Object.assign(params, { values: relations })
    );
  }
};
