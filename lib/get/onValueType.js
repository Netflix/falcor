var isExpired = require("./util/isExpired");
var $error = require("./../types/error");
var onError = require("./onError");
var onValue = require("./onValue");
var onMissing = require("./onMissing");
var isMaterialized = require("./util/isMaterialzed");
var expireNode = require("./../support/expireNode");
var currentCacheVersion = require("../support/currentCacheVersion");


/**
 * When we land on a valueType (or nothing) then we need to report it out to
 * the outerResults through errors, missing, or values.
 *
 * @private
 */
module.exports = function onValueType(
    model, node, path, depth, seed, outerResults, branchInfo,
    requestedPath, optimizedPath, optimizedLength, isJSONG, fromReference) {

    var currType = node && node.$type;

    // There are is nothing here, ether report value, or report the value
    // that is missing.  If there is no type then report the missing value.
    if (!node || !currType) {
        var materialized = isMaterialized(model);
        if (materialized || !isJSONG) {
            onValue(model, node, seed, depth, outerResults, branchInfo,
                    requestedPath, optimizedPath, optimizedLength,
                    isJSONG);
        }

        if (!materialized) {
            onMissing(model, path, depth,
                      outerResults, requestedPath,
                      optimizedPath, optimizedLength);
        }
        return;
    }

    // If there are expired value, then report it as missing
    else if (isExpired(node) &&
        !(node.$_version === currentCacheVersion.getVersion() &&
            node.$expires === 0)) {
        if (!node.$_invalidated) {
            expireNode(node, model._root.expired, model._root);
        }
        onMissing(model, path, depth,
                  outerResults, requestedPath,
                  optimizedPath, optimizedLength);
    }

    // If there is an error, then report it as a value if
    else if (currType === $error) {
        if (fromReference) {
            requestedPath[depth] = null;
            depth += 1;
        }
        if (isJSONG || model._treatErrorsAsValues) {
            onValue(model, node, seed, depth, outerResults, branchInfo,
                    requestedPath, optimizedPath, optimizedLength,
                    isJSONG);
        } else {
            onValue(model, undefined, seed, depth, outerResults, branchInfo,
                    requestedPath, optimizedPath, optimizedLength,
                    isJSONG);
            onError(model, node, depth, requestedPath, outerResults);
        }
    }

    // Report the value
    else {
        if (fromReference) {
            requestedPath[depth] = null;
            depth += 1;
        }
        onValue(model, node, seed, depth, outerResults, branchInfo,
                requestedPath, optimizedPath, optimizedLength, isJSONG);
    }
};
