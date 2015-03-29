var lru = require('./../util/lru');
var clone = require('./../util/clone');
var promote = lru.promote;
var support = require('../util/support');
var materializeNode = {$type: 'sentinel'};
module.exports = function onValue(model, node, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permutePosition, outputFormat, fromReference) {
    var i, len, k, key, curr, prev, prevK;
    var materialized = false, valueNode;
    if (node) {
        promote(model, node);
        
    } 
    
    if (!node || node.value === undefined) {
        materialized = model._materialized;
    }
    
    // materialized
    if (materialized) {
        valueNode = materializeNode;
    } 
    
    // Boxed Mode & Reference Node & Error node (only happens when model is in treat errors as values).
    else if (model._boxed) {
        valueNode = clone(node);
    }
    
    else if (node.$type === 'path' || node.$type === 'error') {
        if (outputFormat === 'Values' || outputFormat === 'JSON') {
            valueNode = node.value;
        } else {
            valueNode = clone(node);
        }
    }

    else {
        valueNode = node.value;
    }


    if (permuteRequested) {
        if (fromReference && permuteRequested[permuteRequested.length - 1] !== null) {
            permuteRequested.push(null);
        }
        outerResults.requestedPaths.push(permuteRequested);
        outerResults.optimizedPaths.push(permuteOptimized);
    }
    switch (outputFormat) {

        case 'Values':
            if (seedOrFunction) {
                seedOrFunction({path: permuteRequested, value: valueNode});
            }
            break;

        case 'PathMap':
            len = permuteRequested.length - 1;
            if (len === -1) {
                seedOrFunction.json = valueNode;
            } else {
                curr = seedOrFunction.json;
                if (!curr) {
                    curr = seedOrFunction.json = {};
                }
                for (i = 0; i < len; i++) {
                    k = permuteRequested[i];
                    if (k === null) {
                        continue;
                    }
                    if (!curr[k]) {
                        curr[k] = {};
                    }
                    prev = curr;
                    prevK = k;
                    curr = curr[k];
                }
                k = permuteRequested[i];
                if (k !== null) {
                    curr[k] = valueNode;
                } else {
                    prev[prevK] = valueNode;
                }
            }
            break;

        case 'JSON':
            if (seedOrFunction) {

                if (permutePosition.length) {
                    if (!seedOrFunction.json) {
                        seedOrFunction.json = {};
                    }
                    curr = seedOrFunction.json;
                    for (i = 0, len = permutePosition.length - 1; i < len; i++) {
                        k = permutePosition[i];
                        key = permuteRequested[k];

                        if (!curr[key]) {
                            curr[key] = {};
                        }
                        curr = curr[key];
                    }

                    // assign the last
                    k = permutePosition[i];
                    key = permuteRequested[k];
                    curr[key] = valueNode;
                } else {
                    seedOrFunction.json = valueNode;
                }
            }
            break;

        case 'JSONG':
            if (seedOrFunction) {
                curr = seedOrFunction.jsong;
                if (!curr) {
                    curr = seedOrFunction.jsong = {};
                    seedOrFunction.paths = [];
                }
                for (i = 0, len = permuteOptimized.length - 1; i < len; i++) {
                    key = permuteOptimized[i];

                    if (!curr[key]) {
                        curr[key] = {};
                    }
                    curr = curr[key];
                }

                // assign the last
                key = permuteOptimized[i];
                
                // TODO: Special case? do string comparisons make big difference?
                curr[key] = materialized ? materializeNode : clone(node);
                if (permuteRequested) {
                    seedOrFunction.paths.push(permuteRequested);
                }
            }
            break;
    }
};


