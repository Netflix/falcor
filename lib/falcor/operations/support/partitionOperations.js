var buildJSONGOperation = require('./buildJSONGOperation');

/**
 * It performs the opposite of combine operations.  It will take a JSONG
 * response and partition them into the required amount of operations.
 * @param {{jsong: {}, paths:[]}} jsongResponse
 */
module.exports = partitionOperations;

function partitionOperations(
        jsongResponse, seeds, format, onNext) {

    var partitionedOps = [];
    var requestedMissingPaths = jsongResponse.paths;

    if (format === 'AsJSON') {
        // fast collapse ass the requestedMissingPaths into their
        // respective groups
        var opsFromRequestedMissingPaths = [];
        var op = null;
        for (var i = 0, len = requestedMissingPaths.length; i < len; i++) {
            var missingPath = requestedMissingPaths[i];
            if (!op || op.idx !== missingPath.pathSetIndex) {
                op = {
                    idx: missingPath.pathSetIndex,
                    paths: []
                };
                opsFromRequestedMissingPaths.push(op);
            }
            op.paths.push(missingPath);
        }
        opsFromRequestedMissingPaths.forEach(function(op, i) {
            var seed = [seeds[op.idx]];
            var jsong = {
                jsong: jsongResponse.jsong,
                paths: op.paths
            };
            partitionedOps.push(buildJSONGOperation(
                format,
                seed,
                jsong,
                op.idx,
                onNext));
        });
    } else {
        partitionedOps[0] = buildJSONGOperation(format, seeds, jsongResponse, 0, onNext);
    }
    return partitionedOps;
}

