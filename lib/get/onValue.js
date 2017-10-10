var promote = require("./../lru/promote");
var clone = require("./util/clone");
var $ref = require("./../types/ref");
var $atom = require("./../types/atom");
var $error = require("./../types/error");

module.exports = function onValue(model, node, seed, depth, outerResults,
                                  branchInfo, requestedPath, optimizedPath,
                                  optimizedLength, isJSONG) {
    // Promote first.  Even if no output is produced we should still promote.
    if (node) {
        promote(model._root, node);
    }

    // Preload
    if (!seed) {
        return;
    }

    var i, len, k, key, curr, prev = null, prevK;
    var materialized = false, valueNode;

    if (!node || node.value === undefined) {
        materialized = model._materialized;
    }

    // materialized
    if (materialized) {
        valueNode = {$type: $atom};
    }

    // Boxed Mode will clone the node.
    else if (model._boxed) {
        valueNode = clone(node);
    }

    // We don't want to emit references in json output
    else if (!model._emitReferencesInOutput && !isJSONG && node.$type === $ref) {
        valueNode = undefined;
    }

    // JSONG always clones the node.
    else if (node.$type === $ref || node.$type === $error) {
        if (isJSONG) {
            valueNode = clone(node);
        } else {
            valueNode = node.value;
        }
    }

    else if (isJSONG) {
        var isObject = node.value && typeof node.value === "object";
        var isUserCreatedNode = !node.$_modelCreated;
        if (isObject || isUserCreatedNode) {
            valueNode = clone(node);
        } else {
            valueNode = node.value;
        }
    }

    else {
        valueNode = node.value;
    }

    if (outerResults) {
        outerResults.hasValue = true;
    }

    if (isJSONG) {
        curr = seed.jsonGraph;
        if (!curr) {
            curr = seed.jsonGraph = {};
            seed.paths = [];
        }
        for (i = 0, len = optimizedLength - 1; i < len; i++) {
            key = optimizedPath[i];

            if (!curr[key]) {
                curr[key] = {};
            }
            curr = curr[key];
        }

        // assign the last
        key = optimizedPath[i];

        // TODO: Special case? do string comparisons make big difference?
        curr[key] = materialized ? {$type: $atom} : valueNode;
        if (requestedPath) {
            seed.paths.push(requestedPath.slice(0, depth));
        }
    }

    // The output is pathMap and the depth is 0.  It is just a
    // value report it as the found JSON
    else if (depth === 0) {
        seed.json = valueNode;
    }

    // The output is pathMap but we need to build the pathMap before
    // reporting the value.
    else {
        curr = seed.json;
        if (!curr) {
            curr = seed.json = {};
        }
        for (i = 0; i < depth - 1; i++) {
            k = requestedPath[i];

            // The branch info is already generated output from the walk algo
            // with the required __path information on it.
            if (!curr[k]) {
                curr[k] = branchInfo[i];
            }

            prev = curr;
            prevK = k;
            curr = curr[k];
        }
        k = requestedPath[i];
        if (k !== null) {
            curr[k] = valueNode !== undefined ? valueNode : curr[k];
        } else {
            // We are protected from reaching here when depth is 1 and prev is
            // undefined by the InvalidModelError and NullInPathError checks.
            prev[prevK] = valueNode;
        }
    }
};
