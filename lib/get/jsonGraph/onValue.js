var clone = require("./../clone");
var $ref = require("./../../types/ref");
var $atom = require("./../../types/atom");
var $error = require("./../../types/error");
var inlineValue = require("./inlineValue");

module.exports = onJSONGraphValue;

function onJSONGraphValue(node, type, depth, seed, results,
                          requestedPath, optimizedPath, optimizedLength,
                          fromReference, boxValues, materialized) {

    var value = node && node.value;
    var requiresMaterializedToReport = type && value === undefined;

    if (requiresMaterializedToReport) {
        if (materialized) {
            value = { $type: $atom };
        } else {
            return undefined;
        }
    }
    // boxValues always clones the node
    else if (boxValues ||
            /*
             * JSON Graph should always clone errors, refs, atoms we didn't
             * create, and atoms we created to wrap Object values.
             */
             $ref === type ||
             $error === type ||
             !node.ツmodelCreated ||
             "object" === typeof value) {
        value = clone(node);
    }

    if (results && requestedPath) {
        results.hasValue = true;
        inlineValue(value, optimizedPath, optimizedLength,
                    seed, boxValues, materialized);
        (seed.paths || (seed.paths = [])).push(
            requestedPath.slice(0, depth + !!fromReference) // depth + 1 if fromReference === true
        );
    }

    return value;
}
