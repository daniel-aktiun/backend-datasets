const express = require("express");
const datasets = require("../routes/datasets");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/datasets", datasets);
};
