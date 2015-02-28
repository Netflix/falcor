// TODO: Objectify?
function walk(model, root, node, path, depth, seedOrFunction, generations, outerResults, optimizedPath, requestedPath, outputFormat) {
    generations = generations || [];
    
    var k = path[depth];
    var memo = {done: false};
    var first = true;
    var permuteGenerations = generations;
    var permuteRequested = requestedPath;
    var permuteOptimized = optimizedPath;
    var asPathMap = outputFormat === 'PathMap';
    depth++;

    var key;
    if (typeof k === 'object' && k) {
        memo.isArray = Array.isArray(k);
        memo.arrOffset = 0;
        key = permuteKey(k, memo);
    } else {
        key = k;
        memo.done = true;
    }
    while (!memo.done || first) {
        first = false;
        if (!memo.done) {
            permuteOptimized = fastCopy(optimizedPath);
            permuteRequested = fastCopy(requestedPath);
            if (asPathMap) {
                permuteGenerations = fastCopy(generations);
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
                permuteGenerations.push(next.__generation);
            }

            if (isExpired(next)) {
                outerResults.requestedMissingPaths.push(fastCat(permuteRequested, fastCopy(path, depth)));
                outerResults.optimizedMissingPaths.push(fastCatSkipNulls(permuteOptimized, fastCopy(path, depth)));
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
                            emitValues(model, refNode, path, depth, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permuteGenerations, outputFormat);
                        }

                        else if (rType === 'error') {
                            outerResults.errors.push({path: fastCopy(permuteRequested), value: copyCacheObject(rValue)});
                            updateTrailingNullCase(path, depth, permuteRequested);
                            lruPromote(model, refNode);
                            outerResults.requestedPaths.push(permuteRequested);
                            outerResults.optimizedPaths.push(permuteOptimized);
                        }

                        else {
                            walk(model, root, refNode, path, depth, seedOrFunction, permuteGenerations, outerResults, permuteOptimized, permuteRequested, outputFormat);
                        }
                    } else {
                        outerResults.requestedMissingPaths.push(fastCat(permuteRequested, fastCopy(path, depth)));
                        outerResults.optimizedMissingPaths.push(fastCatSkipNulls(permuteOptimized, fastCopy(path, depth)));
                    }
                }

                else if (nType === 'error') {
                    outerResults.errors.push({path: fastCopy(permuteRequested), value: copyCacheObject(value)});
                    updateTrailingNullCase(path, depth, permuteRequested);
                    lruPromote(model, next);
                    outerResults.requestedPaths.push(permuteRequested);
                    outerResults.optimizedPaths.push(permuteOptimized);
                }

                else if (nType === 'leaf') {
                    emitValues(model, next, path, depth, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permuteGenerations, outputFormat);
                }

                else {
                    walk(model, root, value, path, depth, seedOrFunction, permuteGenerations, outerResults, permuteOptimized, permuteRequested, outputFormat);
                }
            }

            // we are the last depth.  This needs to be returned
            else {
                if (nType || valueIsArray) {
                    emitValues(model, next, path, depth, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permuteGenerations, outputFormat);
                } else {
                    outerResults.requestedMissingPaths.push(fastCat(permuteRequested, fastCopy(path, depth)));
                    outerResults.optimizedMissingPaths.push(fastCatSkipNulls(permuteOptimized, fastCopy(path, depth)));
                }
            }
        } else {
            outerResults.requestedMissingPaths.push(fastCat(permuteRequested, fastCopy(path, depth - 1)));
            outerResults.optimizedMissingPaths.push(fastCatSkipNulls(permuteOptimized, fastCopy(path, depth - 1)));
        }
        key = permuteKey(k, memo);
    }
    
    if (depth === 0) {
        // we need to log out the found pathMap
    }
}
function emitValues(model, node, path, depth, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permuteGeneration, outputFormat) {
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
                var curr = seedOrFunction;
                for (var i = 0, len = permuteRequested.length - 1; i < len; i++) {
                    var k = permuteRequested[i];
                    if (k === null) {
                        continue;
                    }
                    if (!curr[k]) {
                        curr[k] = {__key: k, __generation: permuteGeneration[i]};
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
