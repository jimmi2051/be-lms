module.exports = {
  timeout: 10000,
  load: {
    before: ["responseTime", "logger", "cors", "responses", "gzip"],
    order: ["listRoles", "koaRange"],
    after: ["parser", "router"],
  },
};
