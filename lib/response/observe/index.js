var pathSyntax = require("falcor-path-syntax");

var validateInput = require("../../support/validateInput");
var GET_VALID_INPUT = require("../../response/get/validInput");
var ObserveResponse = require("./ObserveResponse");
var ModelResponse = require("../ModelResponse");

module.exports = function() {
  // Validates the input. If the input is not pathSets or strings then we
  // will onError.
  var out = validateInput(arguments, GET_VALID_INPUT, "observe");
  if (out !== true) {
      return new ModelResponse(function(o) {
          o.onError(out);
      });
  }

  var paths = pathSyntax.fromPathsOrPathValues(arguments);
  return new ObserveResponse(this, paths);
}