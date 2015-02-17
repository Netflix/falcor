function getPathsAsJSONG(model, pathSets, values, errorSelector, boundPath) {
    
    var nodeRoot = model._cache || (model._cache = {}),
        nodeParent = nodeRoot, node = nodeParent,
        boundLength = 0;
    
    boundPath = model._path || [];
    
    var root       = model._root  || model,
        boxed      = model._boxed || false,
        expired    = root.expired || (root.expired = []),
        refreshing = model._refreshing || false,
        appendNullKey = false;
    
    (typeof errorSelector === "function") || (errorSelector = model._errorSelector) || (errorSelector = function(x, y){return y;});
    
    default var pathSets <-
        nodes: [], jsons: [],
        errors: [], refs: [],
        depth: 0, refIndex: 0, refDepth: 0,
        requestedPath: [], optimizedPath: [],
        requestedPaths: [], optimizedPaths: [],
        requestedMissingPaths: [], optimizedMissingPaths: [],
        hasValue: false,
        jsonRoot: values && values[0], jsonParent: jsonRoot, jsonNode: jsonParent;
    
    var path, length = 0, height = 0, reference, refLength = 0, refHeight = 0,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    refs[-1]  = boundPath;
    nodes[-1] = nodeParent;
    jsons[-1] = jsonParent;
    jsons[-2] = jsons;
    
    curried errorSelector2 = errorSelector(requestedPath);
    
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    NodeMixin(root, expired, errorSelector2, jsonNode)
    NodeMixin(root, expired, errorSelector2, jsonParent)
    NodeMixin(root, expired, errorSelector2, jsonRoot)
    
    curried checkNodeExpired   = checkExpired(visit),
            checkEdgeExpired   = checkExpiredOrPromote(visit),
            optimizeJSONGRefN  = addRequestedKey(checkNodeExpired, optimizedPath),
            getJSONGRefNode    = nodeAsJSONG(optimizeJSONGRefN, jsonParent, jsonNode, boxed),
            getJSONGRefEdge    = setHardLink(getJSONGRefNode, reference),
            getReferenceNode   = walkReference(keySetFalse, getJSONGRefNode, getJSONGRefEdge, appendNullKey, reference),
            
            requestedJSONGKey  = getRequestedKeySet(getKeySet, requestedPath, boundLength),
            optimizeJSONGNode  = addOptimizedKey(checkNodeExpired, optimizedPath, refIndex, refLength),
            optimizeJSONGEdge  = addOptimizedKey(checkEdgeExpired, optimizedPath, refIndex, refLength),
            
            getJSONGNode       = nodeAsJSONG(optimizeJSONGNode, jsonParent, jsonNode, boxed),
            getJSONGEdge       = edgeAsJSONG(optimizeJSONGEdge, jsons, jsonParent, boxed),
            followJSONGRef     = followPathSetRef(getReferenceNode, optimizedPath, reference, refs, refIndex, refDepth, refHeight, refLength),
            getOptimizedNode   = optimizeNode(getJSONGNode, followJSONGRef),
            
            onJSONGNext        = onNext(requestedPath, optimizedPath, requestedPaths, optimizedPaths, appendNullKey),
            onJSONGNext2       = nextAsPathMap(onJSONGNext, hasValue, jsons, jsonParent, boxed),
            onJSONGError       = onErrorAsJSONG(errors, boxed, requestedPath, appendNullKey),
            onJSONGMiss        = onPathSetMiss(boundPath, boundLength, requestedPath, optimizedPath, requestedMissingPaths, optimizedMissingPaths),
            
            getPathSetAsJSONG  = walkPathSet(requestedJSONGKey, getOptimizedNode, getJSONGEdge, appendNullKey, path),
            getPathSetComboAsJSONG = walkPathSetCombo(
                getPathSetAsJSONG, unwindPath,
                onJSONGNext2, onJSONGError, onJSONGMiss,
                boxed, refreshing, appendNullKey,
                refs, refIndex, refLength,
                requestedPath, optimizedPath
            );
    
    values = walkPathSets(noop, getPathSetComboAsJSONG, pathSets,
        path, depth, length, height,
        nodes, nodeRoot, nodeParent, node,
        jsons, jsonRoot, jsonParent, jsonNode,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
    )
    
    values && (values[0] = hasValue && {
        paths: requestedPaths,
        jsong: jsons[-1]
    } || undefined);
    
    return {
        "values": values,
        "errors": errors,
        "requestedPaths": requestedPaths,
        "optimizedPaths": optimizedPaths,
        "requestedMissingPaths": requestedMissingPaths,
        "optimizedMissingPaths": optimizedMissingPaths
    };
}