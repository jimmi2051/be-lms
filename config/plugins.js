module.exports = ({ env }) => ({
  email: {
    provider: "sendgrid",
    providerOptions: {
      apiKey: env("SENDGRID_API_KEY"),
    },
    settings: {
      defaultFrom: "thanhnl0697@gmail.com",
      defaultReplyTo: "thanhnl0697@gmail.com",
    },
  },
});
