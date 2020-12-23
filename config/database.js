module.exports = ({ env }) => {
  const isUri = env.bool("ISURI", false);
  let config = {};
  if (isUri) {
    config = {
      defaultConnection: "default",
      connections: {
        default: {
          connector: "mongoose",
          settings: {
            uri: env("DATABASE_URI" || ""),
          },
          options: {
            ssl: env.bool("DATABASE_SSL", false),
          },
        },
      },
    };
  } else {
    config = {
      defaultConnection: "default",
      connections: {
        default: {
          connector: "mongoose",
          settings: {
            database: env("DB_NAME", "be-lms"),
            host: env("DB_HOST", "127.0.0.1"),
            srv: env.bool("DB_HOST", false),
            port: env.int("DB_PORT", 27017),
            username: env("DB_USERNAME", ""),
            password: env("DB_PASSWORD", ""),
          },
          options: {
            authenticationDatabase: env("AUTHENTICATION_DATABASE", null),
            ssl: env.bool("DATABASE_SSL", false),
          },
        },
      },
    };
  }
  return config;
};
