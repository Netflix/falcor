var isExpired = require("./util/isExpired");
var hardLink = require("./util/hardlink");
var lru = require("./util/lru");
var removeHardlink = hardLink.remove;
var splice = lru.splice;
var $error = require("./../types/error");
var onError = require("./onError");
var onValue = require("./onValue");
var onMissing = require("./onMissing");
var isMaterialized = require("./util/isMaterialzed");
var __invalidated = require("./../internal/invalidated");

/**
 * When we land on a valueType (or nothing) then we need to report it out to
 * the outerResults through errors, missing, or values.
 *
 * @private
 */
module.exports = function onValueType(
    model, node, path, depth, seed, outerResults,
    requestedPath, optimizedPath, optimizedLength, isJSONG, fromReference) {

    var currType = node && node.$type;
    var requiresMaterializedToReport = node && node.value === undefined;

    // There are is nothing here, ether report value, or report the value
    // that is missing.  If there is no type then report the missing value.
    if (!node || !currType) {
        if (isMaterialized(model)) {
            onValue(model, node, seed, depth, outerResults,
                    requestedPath, optimizedPath, optimizedLength,
                    isJSONG, fromReference);
        } else {
            onMissing(model, path, depth,
                      outerResults, requestedPath,
                      optimizedPath, optimizedLength);
        }
        return;
    }

    // If there are expired value, then report it as missing
    else if (isExpired(node)) {
        if (!node[__invalidated]) {
            splice(model, node);
            removeHardlink(node);
        }
        onMissing(model, path, depth,
                  outerResults, requestedPath,
                  optimizedPath, optimizedLength);
    }

    // If there is an error, then report it as a value if
    else if (currType === $error) {
        if (fromReference) {
            requestedPath[depth] = null;
        }
        if (isJSONG || model._treatErrorsAsValues) {
            onValue(model, node, seed, depth, outerResults, requestedPath,
                    optimizedPath, optimizedLength, isJSONG, fromReference);
        } else {
            onError(model, node, depth, requestedPath, outerResults);
        }
    }

    // Report the value
    else {
        if (fromReference) {
            requestedPath[depth] = null;
        }

        if (!requiresMaterializedToReport ||
            requiresMaterializedToReport && model._materialized) {

            onValue(model, node, seed, depth, outerResults, requestedPath,
                    optimizedPath, optimizedLength, isJSONG, fromReference);
        }
    }
};

