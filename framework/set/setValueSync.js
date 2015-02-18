function setValueSync(model, path, value, errorSelector) {
    
    ++__GENERATION_VERSION;
    
    if(Array.isArray(path) === false) {
        if(typeof errorSelector !== "function") {
            errorSelector = value;
        }
        value = path.value;
        path  = path.path;
    }
    
    (typeof errorSelector === "function") || (errorSelector = model._errorSelector) || (errorSelector = function(x, y){return y;});
    
    var root       = model._root  || model,
        boxed      = model._boxed || false,
        expired    = root.expired || (root.expired = []),
        _cache     = model._cache || {},
        optimizedPath = [], appendNullKey = false,
        depth = 0, length = 0, height = 0,
        reference, refIndex = 0, refDepth = 0, refLength = 0, refHeight = 0,
        nodeRoot = _cache, nodeParent = nodeRoot, node = nodeParent,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    curried errorSelector2 = errorSelector(requestedPath);
    
    NodeMixin(root, expired, errorSelector2, value)
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    
    curried checkNodeExpired = checkExpired(visit),
            setEmptyNode     = setNode(checkNodeExpired),
            setEdgeValue     = setEdge(checkNodeExpired, value),
            checkEdgeExpired = checkExpiredOrPromote(setEdgeValue),
            optimizeRefN     = addRequestedKey(checkNodeExpired, optimizedPath),
            optimizeRefE     = setHardLink(optimizeRefN, reference),
            setReferenceNode = walkReference(keySetFalse, optimizeRefN, optimizeRefE, appendNullKey, reference),
            setHardRefNode   = followHardRef(setReferenceNode, optimizedPath),
            
            optimizedNode    = addOptimizedKey(checkNodeExpired, optimizedPath, refIndex, refLength),
            optimizedEdge    = addOptimizedKey(checkEdgeExpired, optimizedPath, refIndex, refLength),
            
            followNodeRef    = followRef(setHardRefNode, optimizedPath, reference, refIndex, refDepth, refHeight, refLength),
            setOptimizedNode = optimizeNode(optimizedNode, followNodeRef),
            
            setPath = walkPath(getKeySet, setOptimizedNode, optimizedEdge, path);
    
    node = setPath(
        depth, length, height, path,
        nodeRoot, nodeParent, node,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
    )
    
    optimizedPath.length = depth + (refLength - refIndex) + 1;
    
    if(boxed === false) {
        node = clone object nodeValue without falcorKeys;
    }
    if(nodeType === ERROR) {
        node[$TYPE] = ERROR;
    }
    
    var shorted = appendNullKey;
    while(!shorted && ++depth <= height) {
        shorted = path[depth] != null;
    }
    
    return {
        value: node,
        path: optimizedPath,
        shorted: shorted
    };
}
