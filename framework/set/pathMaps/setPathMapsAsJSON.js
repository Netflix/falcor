function setPathMapsAsJSON(model, pathMaps, values, errorSelector, boundPath) {
    
    ++__GENERATION_VERSION;
    
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
    
    default var pathMaps <-
        jsonKeys: [], pathMapStack: [],
        nodes: [], jsons: [],
        errors: [], refs: [],
        depth: 0, refIndex: 0, refDepth: 0,
        requestedPath: [], optimizedPath: [],
        requestedPaths: [], optimizedPaths: [],
        requestedMissingPaths: [], optimizedMissingPaths: [],
        hasValue: false,
        jsonRoot: values && values[0], jsonParent: jsonRoot, jsonNode: jsonParent;
    
    var pathMap, length = 0, height = 0, reference, refLength = 0, refHeight = 0,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    refs[-1]  = boundPath;
    nodes[-1] = nodeParent;
    jsons[-2] = jsons;
    jsonKeys[-1] = -1;
    
    curried errorSelector2 = errorSelector(requestedPath);
    
    NodeMixin(root, expired, errorSelector2, pathMap)
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    NodeMixin(root, expired, errorSelector2, jsonNode)
    NodeMixin(root, expired, errorSelector2, jsonParent)
    NodeMixin(root, expired, errorSelector2, jsonRoot)
    
    curried initMapStack     = initPathMapStack(pathMapStack),
            unwindMapStack   = unwindPathMap(pathMapStack),
            getPathAsJSON    = pathAsJSON(initMapStack, hasValue, values, jsons, jsonRoot, jsonKeys),
            unwindAsJSON     = unwindPathAsJSON(unwindMapStack, hasValue, values, jsons, jsonRoot),
            checkNodeExpired = checkExpired(visit),
            setEmptyNode     = setNode(checkNodeExpired),
            setEdgeValue     = setEdge(checkNodeExpired, pathMap),
            checkEdgeExpired = checkExpiredOrPromote(setEdgeValue),
            optimizeJSONRefN = addRequestedKey(setEmptyNode, optimizedPath),
            optimizeJSONRefE = setHardLink(optimizeJSONRefN, reference),
            setReferenceNode = walkReference(keySetFalse, optimizeJSONRefN, optimizeJSONRefE, appendNullKey, reference),
            setHardRefNode   = followHardRef(setReferenceNode, optimizedPath),
            
            requestedJSONKey = getRequestedKeySet(noop, requestedPath, boundLength),
            optimizeJSONNode = addOptimizedKey(setEmptyNode, optimizedPath, refIndex, refLength),
            optimizeJSONEdge = addOptimizedKey(checkEdgeExpired, optimizedPath, refIndex, refLength),
            
            getJSONNode      = nodeAsJSON(optimizeJSONNode, jsonKeys, jsonParent, jsonNode, boundLength),
            getJSONEdge      = edgeAsJSON(optimizeJSONEdge, jsonKeys, jsons, jsonParent, boundLength),
            followJSONRef    = followPathSetRef(setHardRefNode, optimizedPath, reference, refs, refIndex, refDepth, refHeight, refLength),
            getOptimizedNode = optimizeNode(getJSONNode, followJSONRef),
            
            onJSONNext       = onNext(requestedPath, optimizedPath, requestedPaths, optimizedPaths, appendNullKey),
            onJSONNext2      = nextAsJSON(onJSONNext, hasValue, jsonKeys, jsons, jsonParent, boxed),
            onJSONError      = onError(errors, boxed, requestedPath, appendNullKey),
            onJSONMiss       = onPathMapMiss(boundPath, boundLength, requestedPath, optimizedPath, requestedMissingPaths, optimizedMissingPaths, pathMapStack, pathMap),
            
            getPathMapAsJSON = walkPathMap(requestedJSONKey, getOptimizedNode, getJSONEdge, appendNullKey, pathMapStack, pathMap),
            getPathMapComboAsJSON = walkPathSetCombo(
                getPathMapAsJSON, unwindAsJSON,
                onJSONNext2, onJSONError, onJSONMiss,
                boxed, refreshing, appendNullKey,
                refs, refIndex, refLength,
                requestedPath, optimizedPath
            );
    
    values = walkPathSets(
        getPathAsJSON, getPathMapComboAsJSON, pathMaps,
        pathMap, depth, length, height,
        nodes, nodeRoot, nodeParent, node,
        jsons, jsonRoot, jsonParent, jsonNode,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
    )
    
    return {
        "values": values,
        "errors": errors,
        "requestedPaths": requestedPaths,
        "optimizedPaths": optimizedPaths,
        "requestedMissingPaths": requestedMissingPaths,
        "optimizedMissingPaths": optimizedMissingPaths
    };
}
