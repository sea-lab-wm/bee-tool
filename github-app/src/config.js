"use strict";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// exports.githubSecret = process.env.GITHUB_SECRET;
exports.githubWebhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
exports.githubAppId = process.env.GITHUB_APP_ID;
exports.port = process.env.PORT;
