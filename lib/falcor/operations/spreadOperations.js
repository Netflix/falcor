var fastCollapse = require('./fastCollapse.js');
/**
 * It performs the opposite of combine operations.  It will take a JSONG
 * response and spread it into the required amount of operations.
 * @param {{jsong: {}, paths:[]}} jsongResponse
 */
module.exports = spreadOperations;

function spreadOperations(jsongResponse, requestedMissingPaths, format, seeds, onNext) {
    var spreadOps = [];
    var nextSeeds = [];
    if (format === 'AsJSON') {
        // fast collapse ass the requestedMissingPaths into their
        // respective groups
        var opsFromRequestedMissingPaths = [];
        var op = null;
        for (var i = 0, len = requestedMissingPaths.length; i < len; i++) {
            var missingPath = requestedMissingPaths[i];
            if (!op || op.idx !== missingPath.pathSetIndex) {
                if (op) {
                    op.paths = fastCollapse(op.paths);
                }
                op = {
                    idx: missingPath.pathSetIndex,
                    paths: []
                };
                opsFromRequestedMissingPaths.push(op);
            }
            op.paths.push(missingPath);
        }
        op.paths = fastCollapse(op.paths);
        opsFromRequestedMissingPaths.forEach(function(op, i) {
            var seed = [seeds[op.idx]];
            spreadOps.push(buildOp(
                format,
                seed,
                jsongResponse,
                i,
                onNext));
            nextSeeds.push(seed);
        });
    } else {
        spreadOps[0] = buildOp(format, seeds, jsongResponse, 0, onNext);
    }
    return [spreadOps, nextSeeds];
}

function buildOp(format, seeds, jsongOp, seedOffset, onNext) {
    return {
        methodName: '_setJSONGs' + format,
        format: format,
        isValues: format === 'AsValues',
        onNext: onNext,
        seeds: seeds,
        seedsOffset: seedOffset,
        args: [jsongOp]
    };
}
