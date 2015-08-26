var isExpired = require("./util/isExpired");
var hardLink = require("./util/hardlink");
var lru = require("./util/lru");
var removeHardlink = hardLink.remove;
var splice = lru.splice;
var $error = require("./../types/error");
var onError = require("./onError");
var onValue = require("./onValue");
var onMissing = require("./onMissing");

/**
 * When we land on a valueType (or nothing) then we need to report it out to
 * the outerResults.
 *
 * @private
 */
module.exports = function onValueType(
    model, node, pathOrJSON, depth, seed, outerResults,
    requestedPath, optimizedPath, isJSONG, fromReference) {

    var currType = node && node.$type;

    // There are is nothing here, ether report value, or report the value
    // that is missing.  If there is no type then report the missing value.
    if (!node || !currType) {
        if (isMaterialized(model)) {
            onValue(model, node, seed, outerResults,
                    requestedPath, optimizedPath, isJSONG, fromReference);
        } else {
            onMissing(model, node, pathOrJSON, depth,
                      outerResults, requestedPath, optimizedPath);
        }
        return;
    }

    // If there is an error, then report it as a value if
    else if (currType === $error) {
        if (fromReference) {
            requestedPath.push(null);
        }
        if (isJSONG || model._treatErrorsAsValues) {
            onValue(model, node, seed, outerResults,
                    requestedPath, optimizedPath, isJSONG, fromReference);
        } else {
            onError(model, node, requestedPath, outerResults);
        }
    }

    // If there are expired value, then report it as missing
    else if (isExpired(node)) {
        if (!node[__invalidated]) {
            splice(model, node);
            removeHardlink(node);
        }
        onMissing(model, node, pathOrJSON, depth,
                  outerResults, requestedPath, optimizedPath);
    }

    // Report the value
    else {
        if (fromReference) {
            requestedPath.push(null);
        }
        onValue(model, node, seed, outerResults,
                requestedPath, optimizedPath, isJSONG, fromReference);
    }
};

