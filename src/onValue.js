function onValue(model, node, path, depth, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permutePosition, outputFormat) {

    var i, len, k, key, curr;
    if (permuteRequested[permuteRequested.length - 1] !== null) {
        updateTrailingNullCase(path, depth, permuteRequested);
    }
    lruPromote(model, node);


    if (permuteRequested) {
        outerResults.requestedPaths.push(permuteRequested);
        outerResults.optimizedPaths.push(permuteOptimized);
    }
    switch (outputFormat) {

        case 'Values':
            if (typeof seedOrFunction === 'function') {
                seedOrFunction({path: permuteRequested, value: cloneAsValue(model, node)});
            }
            break;

        case 'PathMap':
            if (seedOrFunction) {
                curr = seedOrFunction;
                for (i = 0, len = permuteRequested.length - 1; i < len; i++) {
                    k = permuteRequested[i];
                    if (k === null) {
                        continue;
                    }
                    if (!curr[k]) {
                        curr[k] = {};
                    }
                    curr = curr[k];
                }
                k = permuteRequested[i];
                if (k !== null) {
                    curr[k] = cloneAsValue(model, node);
                } else {
                    curr = cloneAsValue(model, node);
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
                    curr[key] = cloneAsValue(model, node);
                } else {
                    seedOrFunction.json = cloneAsValue(model, node);
                }
            }
            break;

        case 'JSONG':
            if (seedOrFunction) {
                curr = seedOrFunction.jsong;
                for (i = 0, len = permuteOptimized.length - 1; i < len; i++) {
                    key = permuteOptimized[i];

                    if (!curr[key]) {
                        curr[key] = {};
                    }
                    curr = curr[key];
                }

                // assign the last
                key = permuteOptimized[i];
                curr[key] = cloneAsValue(model, node);
                if (permuteRequested) {
                    seedOrFunction.paths.push(permuteRequested);
                }
            }
            break;
    }
}


