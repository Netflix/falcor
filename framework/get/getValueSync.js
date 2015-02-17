function getValueSync(model, path) {
    
    var root       = model._root  || model,
        boxed      = model._boxed || false,
        expired    = root.expired || (root.expired = []),
        _cache     = model._cache || {},
        errorSelector = model._errorSelector || function(x, y){return y;},
        optimizedPath = [], appendNullKey = false,
        depth = 0, length = 0, height = 0,
        reference, refIndex = 0, refDepth = 0, refLength = 0, refHeight = 0,
        nodeRoot = _cache, nodeParent = nodeRoot, node = nodeParent,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    curried errorSelector2 = errorSelector(optimizedPath);
    
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    
    curried checkNodeExpired = checkExpired(visit),
            checkEdgeExpired = checkExpiredOrPromote(visit),
            optimizeRefN     = addRequestedKey(checkNodeExpired, optimizedPath),
            optimizeRefE     = setHardLink(optimizeRefN, reference),
            getReferenceNode = walkReference(keySetFalse, optimizeRefN, optimizeRefE, appendNullKey, reference),
            getHardRefNode   = followHardRef(getReferenceNode, optimizedPath),
            
            optimizedNode    = addOptimizedKey(checkNodeExpired, optimizedPath, refIndex, refLength),
            optimizedEdge    = addOptimizedKey(checkEdgeExpired, optimizedPath, refIndex, refLength),
            
            followNodeRef    = followRef(getHardRefNode, optimizedPath, reference, refIndex, refDepth, refHeight, refLength),
            getOptimizedNode = optimizeNode(optimizedNode, followNodeRef),
            
            getPath = walkPath(getKeySet, getOptimizedNode, optimizedEdge, path);
    
    node = getPath(
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
    
    return {
        value: node,
        path: optimizedPath,
        shorted: depth < height || appendNullKey
    };
}
