"use strict";
// const gulp = require("gulp");
// const build = require("@microsoft/sp-build-web");
// const webpackMerge = require("webpack-merge");
// const customConfig = require("./config/webpack.config");

// build.configureWebpack.mergeConfig({
//   additionalConfiguration: (generatedConfiguration) => {
//     return webpackMerge.merge(generatedConfiguration, customConfig);
//   },
// });

// // Initialize SPFx build tasks
// build.initialize(gulp);

////

const build = require("@microsoft/sp-build-web");

build.addSuppression(
  `Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`
);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set("serve", result.get("serve-deprecated"));

  return result;
};

build.initialize(require("gulp"));
