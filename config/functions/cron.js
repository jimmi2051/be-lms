"use strict";

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
 */
const shell = require("shelljs");
module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */
  "59 23 * * *": () => {
    let path = `${__dirname}/backup.sh`;
    shell.exec(`${path}`);
  }
};
