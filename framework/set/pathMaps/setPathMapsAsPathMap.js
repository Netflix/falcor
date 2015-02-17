function setPathMapsAsPathMap(model, pathMaps, values, errorSelector, boundPath) {
    
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
        pathMapStack: [],
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
    jsons[-1] = jsonParent;
    jsons[-2] = jsons;
    
    curried errorSelector2 = errorSelector(requestedPath);
    
    NodeMixin(root, expired, errorSelector2, pathMap)
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    NodeMixin(root, expired, errorSelector2, jsonNode)
    NodeMixin(root, expired, errorSelector2, jsonParent)
    NodeMixin(root, expired, errorSelector2, jsonRoot)
    
    curried initMapStack        = initPathMapStack(pathMapStack),
            unwindMapStack      = unwindPathMap(pathMapStack),
            checkNodeExpired    = checkExpired(visit),
            setEmptyNode        = setNode(checkNodeExpired),
            setEdgeValue        = setEdge(checkNodeExpired, pathMap),
            checkEdgeExpired    = checkExpiredOrPromote(setEdgeValue),
            optimizePathMapRefN = addRequestedKey(setEmptyNode, optimizedPath),
            optimizePathMapRefE = setHardLink(optimizePathMapRefN, reference),
            setReferenceNode    = walkReference(keySetFalse, optimizePathMapRefN, optimizePathMapRefE, appendNullKey, reference),
            setHardRefNode      = followHardRef(setReferenceNode, optimizedPath),
            
            requestedPathMapKey = getRequestedKeySet(noop, requestedPath, boundLength),
            optimizePathMapNode = addOptimizedKey(setEmptyNode, optimizedPath, refIndex, refLength),
            optimizePathMapEdge = addOptimizedKey(checkEdgeExpired, optimizedPath, refIndex, refLength),
            
            followPathMapRef    = followPathSetRef(setHardRefNode, optimizedPath, reference, refs, refIndex, refDepth, refHeight, refLength),
            setOptimizedNode    = optimizeNode(optimizePathMapNode, followPathMapRef),
            setPathMapNode      = nodeAsPathMap(setOptimizedNode, jsonParent, jsonNode, boundLength, boxed),
            setPathMapEdge      = edgeAsPathMap(optimizePathMapEdge, jsons, jsonParent, boundLength, boxed),
            
            onPathMapNext       = onNext(requestedPath, optimizedPath, requestedPaths, optimizedPaths, appendNullKey),
            onPathMapNext2      = nextAsPathMap(onPathMapNext, hasValue, jsons, jsonParent, boxed),
            onPathMapError      = onError(errors, boxed, requestedPath, appendNullKey),
            onPathMapMiss2      = onPathMapMiss(boundPath, boundLength, requestedPath, optimizedPath, requestedMissingPaths, optimizedMissingPaths, pathMapStack),
            
            setPathMapAsPathMap = walkPathMap(requestedPathMapKey, setPathMapNode, setPathMapEdge, appendNullKey, pathMapStack, pathMap),
            setPathMapComboAsPathMap = walkPathSetCombo(
                setPathMapAsPathMap, unwindMapStack,
                onPathMapNext2, onPathMapError, onPathMapMiss2,
                boxed, refreshing, appendNullKey,
                refs, refIndex, refLength,
                requestedPath, optimizedPath
            );
    
    values = walkPathSets(
        initMapStack, setPathMapComboAsPathMap, pathMaps,
        pathMap, depth, length, height,
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
