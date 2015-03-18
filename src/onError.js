function onError(model, node, nodeValue, permuteRequested, permuteOptimized, outerResults, outputFormat) {

    outerResults.errors.push({path: permuteRequested, value: cloneAsValue(model, nodeValue, outputFormat)});

    lruPromote(model, node);
    
    if (permuteOptimized) {
        outerResults.requestedPaths.push(permuteRequested);
        outerResults.optimizedPaths.push(permuteOptimized);
    }
}

