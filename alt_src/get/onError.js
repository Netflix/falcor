var lru = require('./../util/lru');
var clone = require('./../util/clone');
var promote = lru.promote;
module.exports = function onError(model, node, nodeValue, permuteRequested, permuteOptimized, outerResults, outputFormat) {

    outerResults.errors.push({path: permuteRequested, value: clone(model, nodeValue, outputFormat)});

    promote(model, node);
    
    if (permuteOptimized) {
        outerResults.requestedPaths.push(permuteRequested);
        outerResults.optimizedPaths.push(permuteOptimized);
    }
}

