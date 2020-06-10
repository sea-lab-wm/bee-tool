"use strict";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// exports.githubSecret = process.env.GITHUB_SECRET;
exports.githubPrivateKey = process.env.GITHUB_PRIVATE_KEY;
exports.githubAppId = process.env.GITHUB_APP_ID;
exports.port = process.env.PORT;
