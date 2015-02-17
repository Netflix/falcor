function invalidatePaths(model, pathSets, values, errorSelector) {
    
    var nodeRoot = model._cache || (model._cache = {}),
        nodeParent  = getBoundContext(model),
        node = nodeParent, root = model._root  || model,
        expired = root.expired || (root.expired = []),
        appendNullKey = false,
        path, length = 0, height = 0,
        depth = 0, refIndex = 0, refDepth = 0,
        reference, refLength = 0, refHeight = 0,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    default var pathSets <- nodes: [], optimizedPath: [];
    
    nodes[-1] = nodeParent;
    
    NodeMixin(root, expired, errorSelector, node)
    NodeMixin(root, expired, errorSelector, nodeParent)
    
    curried optimizeRefE     = setHardLink(visit, reference),
            getReferenceNode = walkReference(keySetFalse, visit, optimizeRefE, appendNullKey, reference),
            getHardRefNode   = followHardRef(getReferenceNode, optimizedPath),
            followNodeRef    = followRef(getHardRefNode, optimizedPath, reference, refIndex, refDepth, refHeight, refLength),
            getOptimizedNode = optimizeNode(visit, followNodeRef),
            getPathSet       = walkPathSet(getKeySet, getOptimizedNode, invalidate, appendNullKey, path);
    
    var index = -1, count = pathSets.length;
    while(++index < count) {
        path = pathSets[index];
        depth  = 0;
        length = path.length;
        height = length - 1;
        while(depth > -1) {
            node = getPathSet(
                depth, height, length, path,
                nodes, nodeRoot, nodeParent, node,
                nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
            )
            depth = unwindPath(path, index, depth)
        }
    }
    
    return {
        "values": [],
        "errors": [],
        "requestedPaths": [],
        "optimizedPaths": [],
        "requestedMissingPaths": [],
        "optimizedMissingPaths": []
    };
}
