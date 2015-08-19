var falcor = require("./lib");
var jsong = require("falcor-json-graph");

falcor.atom = jsong.atom;
falcor.ref = jsong.ref;
falcor.error = jsong.error;
falcor.pathValue = jsong.pathValue;

falcor.HttpDataSource = require("falcor-http-datasource");

module.exports = falcor;
