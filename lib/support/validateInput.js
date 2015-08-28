var isArray = Array.isArray;
var isPathValue = require("./../support/isPathValue");
var isJSONGraphEnvelope = require("./../support/isJSONGraphEnvelope");
var isJSONEnvelope = require("./../support/isJSONEnvelope");
var pathSyntax = require("falcor-path-syntax");

/**
 *
 * @param {Object} allowedInput - allowedInput is a map of input styles
 * that are allowed
 * @private
 */
module.exports = function validateInput(args, allowedInput, method) {
    for (var i = 0, len = args.length; i < len; ++i) {
        var arg = args[i];
        var valid = false;

        // Path
        if (isArray(arg) && allowedInput.path) {
            valid = true;
        }

        // Path Syntax
        else if (typeof arg === "string" && allowedInput.pathSyntax) {
            valid = true;
        }

        // Path Value
        else if (isPathValue(arg) && allowedInput.pathValue) {
            arg.path = pathSyntax.fromPath(arg.path);
            valid = true;
        }

        // jsonGraph {jsonGraph: { ... }, paths: [ ... ]}
        else if (isJSONGraphEnvelope(arg) && allowedInput.jsonGraph) {
            valid = true;
        }

        // json env {json: {...}}
        else if (isJSONEnvelope(arg) && allowedInput.json) {
            valid = true;
        }

        // selector functions
        else if (typeof arg === "function" &&
                 i + 1 === len &&
                 allowedInput.selector) {
            valid = true;
        }

        if (!valid) {
            return new Error("Unrecognized argument " + (typeof arg) + " [" + String(arg) + "] " + "to Model#" + method + "");
        }
    }
    return true;
};
