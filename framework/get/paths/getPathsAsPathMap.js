function getPathsAsPathMap(model, pathSets, values, errorSelector, boundPath) {
    
    var boundLength = 0,
        nodeRoot = model._cache || (model._cache = {}),
        nodeParent, node;
    
    if(Array.isArray(boundPath)) {
        nodeParent  = nodeRoot;
        boundLength = boundPath.length;
    } else {
        nodeParent  = getBoundContext(model);
        boundPath   = model._path || [];
    }
    
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
    
    curried checkNodeExpired    = checkExpired(visit),
            checkEdgeExpired    = checkExpiredOrPromote(visit),
            optimizePathMapRefN = addRequestedKey(checkNodeExpired, optimizedPath),
            optimizePathMapRefE = setHardLink(optimizePathMapRefN, reference),
            getReferenceNode    = walkReference(keySetFalse, optimizePathMapRefN, optimizePathMapRefE, appendNullKey, reference),
            getHardRefNode      = followHardRef(getReferenceNode, optimizedPath),
            
            requestedPathMapKey = getRequestedKeySet(getKeySet, requestedPath, boundLength),
            optimizePathMapNode = addOptimizedKey(checkNodeExpired, optimizedPath, refIndex, refLength),
            optimizePathMapEdge = addOptimizedKey(checkEdgeExpired, optimizedPath, refIndex, refLength),
            
            followPathMapRef    = followPathSetRef(getHardRefNode, optimizedPath, reference, refs, refIndex, refDepth, refHeight, refLength),
            getOptimizedNode    = optimizeNode(optimizePathMapNode, followPathMapRef),
            getPathMapNode      = nodeAsPathMap(getOptimizedNode, jsonParent, jsonNode, boundLength, boxed),
            getPathMapEdge      = edgeAsPathMap(optimizePathMapEdge, jsons, jsonParent, boundLength, boxed),
            
            onPathMapNext       = onNext(requestedPath, optimizedPath, requestedPaths, optimizedPaths, appendNullKey),
            onPathMapNext2      = nextAsPathMap(onPathMapNext, hasValue, jsons, jsonParent, boxed),
            onPathMapError      = onError(errors, boxed, requestedPath, appendNullKey),
            onPathMapMiss       = onPathSetMiss(boundPath, boundLength, requestedPath, optimizedPath, requestedMissingPaths, optimizedMissingPaths),
            
            getPathSetAsPathMap = walkPathSet(requestedPathMapKey, getPathMapNode, getPathMapEdge, appendNullKey, path),
            getPathSetComboAsPathMap = walkPathSetCombo(
                getPathSetAsPathMap, unwindPath,
                onPathMapNext2, onPathMapError, onPathMapMiss,
                boxed, refreshing, appendNullKey,
                refs, refIndex, refLength,
                requestedPath, optimizedPath
            );
    
    values = walkPathSets(noop, getPathSetComboAsPathMap, pathSets,
        path, depth, length, height,
        nodes, nodeRoot, nodeParent, node,
        jsons, jsonRoot, jsonParent, jsonNode,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
    )
    
    values && (values[0] = hasValue && {
        json : jsons[-1]
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
