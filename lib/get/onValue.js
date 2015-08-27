var lru = require("./util/lru");
var clone = require("./util/clone");
var promote = lru.promote;
var $ref = require("./../types/ref");
var $atom = require("./../types/atom");
var $error = require("./../types/error");
var $modelCreated = require("./../internal/model-created");

module.exports = function onValue(model, node, seed, depth, outerResults,
                                  requestedPath, optimizedPath, isJSONG,
                                  fromReference) {
    //Preload
    if (!seed) {
        return;
    }

    var i, len, k, key, curr, prev, prevK;
    var materialized = false, valueNode;
    if (node) {
        promote(model, node);
    }

    if (!node || node.value === void 0) {
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
        var isUserCreatedNode = !node[$modelCreated];
        if (isObject || isUserCreatedNode) {
            valueNode = clone(node);
        } else {
            valueNode = node.value;
        }
    }

    else {
        valueNode = node.value;
    }

    // Required so outside knows that there was at least one value retrieved.
    outerResults.hasValue = true;

    if (isJSONG) {
        curr = seed.jsonGraph;
        if (!curr) {
            curr = seed.jsonGraph = {};
            seed.paths = [];
        }
        for (i = 0, len = optimizedPath.length - 1; i < len; i++) {
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
            seed.paths.push(requestedPath.concat());
        }
    }

    // The output is pathMap
    else {
        if (depth === 0) {
            seed.json = valueNode;
        } else {
            curr = seed.json;
            if (!curr) {
                curr = seed.json = {};
            }
            for (i = 0; i < depth - 1; i++) {
                k = requestedPath[i];
                if (!curr[k]) {
                    curr[k] = {};
                }
                prev = curr;
                prevK = k;
                curr = curr[k];
            }
            k = requestedPath[i];
            if (k !== null) {
                curr[k] = valueNode;
            } else {
                prev[prevK] = valueNode;
            }
        }
    }
};
