// TODO: Objectify?
function walk(model, root, node, path, depth, seedOrFunction, positionalInfo, outerResults, optimizedPath, requestedPath, outputFormat) {
    positionalInfo = positionalInfo || [];

    var k = path[depth];
    var memo = {done: false};
    var first = true;
    var permutePosition = positionalInfo;
    var permuteRequested = requestedPath;
    var permuteOptimized = optimizedPath;
    var asPathMap = outputFormat === 'PathMap';
    var asJSONG = outputFormat === 'JSONG';
    var asJSON = outputFormat === 'JSON';
    var isKeySet = false;
    depth++;

    var key;
    if (typeof k === 'object' && k) {
        memo.isArray = Array.isArray(k);
        memo.arrOffset = 0;
        
        key = permuteKey(k, memo);
        isKeySet = true;
    } else {
        key = k;
        memo.done = true;
    }
    
    if (asJSON && isKeySet) {
        permutePosition.push(depth - 1);
    }
    
    while (!memo.done || first) {
        first = false;
        if (!memo.done) {
            permuteOptimized = fastCopy(optimizedPath);
            permuteRequested = fastCopy(requestedPath);
            if (asPathMap) {
                permutePosition = fastCopy(positionalInfo);
            }
        }

        var nodeIsSentinel = node.$type === 'sentinel';
        var next = nodeIsSentinel ? node.value[key] : node[key];

        if (next) {
            var nType = next.$type;
            var value = nType === 'sentinel' ? next.value : next;
            var valueIsArray = Array.isArray(value);

            if (key !== null) {
                permuteOptimized.push(key);
                permuteRequested.push(key);
            }
            if (asPathMap) {
                permutePosition.push(next.__generation);
            }

            if (isExpired(next)) {
                emitMissing(path, depth, permuteRequested, permuteOptimized, permutePosition, outerResults, outputFormat);
            }

            else if (depth < path.length) {

                if (valueIsArray) {
                    var ref = followReference(model, root, root, value);
                    var refNode = ref[0];
                    copyInto(permuteOptimized, ref[1]);

                    if (refNode) {
                        var rType = refNode.$type;
                        var rValue = rType === 'sentinel' ? refNode.value : refNode;

                        // short circuit case
                        if (rType === 'leaf') {
                            emitValues(model, refNode, path, depth, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permutePosition, outputFormat);
                        }

                        else if (rType === 'error') {
                            emitError(model, path, depth, refNode, rValue, permuteRequested, permuteOptimized, outerResults);
                        }

                        else {
                            walk(model, root, refNode, path, depth, seedOrFunction, permutePosition, outerResults, permuteOptimized, permuteRequested, outputFormat);
                        }
                    } else {
                        emitMissing(path, depth, permuteRequested, permuteOptimized, permutePosition, outerResults, outputFormat);
                    }
                }

                else if (nType === 'error') {
                    emitError(model, path, depth, next, value, permuteRequested, permuteOptimized, outerResults);
                }

                else if (nType === 'leaf') {
                    emitValues(model, next, path, depth, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permutePosition, outputFormat);
                }

                else {
                    walk(model, root, value, path, depth, seedOrFunction, permutePosition, outerResults, permuteOptimized, permuteRequested, outputFormat);
                }
            }

            // we are the last depth.  This needs to be returned
            else {
                if (nType || valueIsArray) {
                    emitValues(model, next, path, depth, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permutePosition, outputFormat);
                } else {
                    emitMissing(path, depth, permuteRequested, permuteOptimized, permutePosition, outerResults, outputFormat);
                }
            }
        } else {
            emitMissing(path, depth - 1, permuteRequested, permuteOptimized, permutePosition, outerResults, outputFormat);
        }
        key = permuteKey(k, memo);
    }
}

function emitError(model, path, depth, node, nodeValue, permuteRequested, permuteOptimized, outerResults) {
    outerResults.errors.push({path: fastCopy(permuteRequested), value: copyCacheObject(nodeValue)});
    updateTrailingNullCase(path, depth, permuteRequested);
    lruPromote(model, node);
    outerResults.requestedPaths.push(permuteRequested);
    outerResults.optimizedPaths.push(permuteOptimized);
}

function emitMissing(path, depth, permuteRequested, permuteOptimized, permutePosition, results, type) {
    var pathSlice;
    if (depth < path.length) {
        pathSlice = fastCopy(path, depth);
    } else {
        pathSlice = [];
    }
    
    if (type === 'JSON') {
        for (var i = 0, len = permutePosition.length; i < len; i++) {
            if (permutePosition[i]) {
                permuteRequested[i] = [permuteRequested[i]];
            }
        }
        results.requestedMissingPaths.push(fastCat(permuteRequested, pathSlice));
        results.optimizedMissingPaths.push(fastCatSkipNulls(permuteOptimized, pathSlice));
    } else {
        results.requestedMissingPaths.push(fastCat(permuteRequested, pathSlice));
        results.optimizedMissingPaths.push(fastCatSkipNulls(permuteOptimized, pathSlice));
    }
}
function emitValues(model, node, path, depth, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permutePosition, outputFormat) {
    
    var i, len, k, key, curr;
    updateTrailingNullCase(path, depth, permuteRequested);
    lruPromote(model, node);

    outerResults.requestedPaths.push(permuteRequested);
    outerResults.optimizedPaths.push(permuteOptimized);
    switch (outputFormat) {

        case 'Values':
            var pV = cloneToPathValue(model, node, permuteRequested);
            outerResults.values.push(pV);

            if (seedOrFunction) {
                seedOrFunction(pV);
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
                        curr[k] = {__key: k, __generation: permutePosition[i]};
                    }
                    curr = curr[k];
                }
                k = permuteRequested[i];
                if (k !== null) {
                    curr[k] = copyCacheObject(node, true);
                } else {
                    curr = copyCacheObject(node, true, curr);
                    delete curr.__key;
                    delete curr.__generation;
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
                    curr[key] = copyCacheObject(node);
                } else {
                    seedOrFunction.json = copyCacheObject(node);
                }
            }
            break;
    }
}

function followReference(model, root, node, reference) {

    var depth = 0;
    while (true) {
        var k = reference[depth++];
        var next = node[k];

        if (next) {
            var type = next.$type;
            var value = type === 'sentinel' ? next.value : next;

            if (depth < reference.length) {
                if (type) {
                    break;
                }
                if (isExpired(next)) {
                    break;
                }

                node = next;
                continue;
            }

            else if (depth === reference.length) {

                // hit expired branch
                if (isExpired(next)) {
                    break;
                }

                // Restart the reference follower.
                if (Array.isArray(value)) {
                    depth = 0;
                    reference = value;
                    node = root;
                    continue;
                }

                node = next;
                break;
            }
        }
        break;
    }

    return [node, reference];
}
