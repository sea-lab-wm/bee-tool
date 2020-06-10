"use strict";

const App = require("./app");
const config = require("./config");

const app = App();

app.listen(config.port, () => {
  console.info(`bug report checker listening on port ${config.port}`);
});