function invalidatePathMaps(model, pathMaps, values, errorSelector, boundPath) {
    var root = model._root,
        expired = root.expired,
        
        boxed = model._boxed || false,
        refreshing = model._refreshing || false,
        materialized = (model._materialized || false) && !model._dataSource && !model._router;
    var errorSelector = model._errorSelector;
    var map, mapStack = [],
        depth  = 0, linkDepth  = 0,
        height = 0, linkHeight = 0,
        linkPath , linkIndex  = 0,
        
        nodeLoc = getBoundPath(model),
        nodes = [], nodeRoot = model._cache, nodeParent = nodeLoc.value, node = nodeParent,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    var offset = boundPath && boundPath.length || 0;
    nodes[-1] = nodeParent;
    
    NodeMixin(root, expired, errorSelector, node)
    NodeMixin(root, expired, errorSelector, value)
    NodeMixin(root, expired, errorSelector, nodeValue)
    NodeMixin(root, expired, errorSelector, nodeParent)
    
    curried  setupHardLink    = addHardLink(linkPath),
             walkReference    = walkLink(noop, setupHardLink),
             followReference  = followHardLink(walkReference, noop, optimizedPath, linkPath, linkIndex, linkDepth, linkHeight),
             visitNodeKey     = visitNode(noop);
    
    for(var index = -1, count = pathMaps.length; ++index < count;) {
        
        map = mapStack[0] = pathMaps[index];
        depth = 0;
        
        while(depth > -1) {
            node  = walkPathMap(
                keyToKeySet, visitNodeKey, followReference, invalidateEdge,
                mapStack, map, depth, height,
                nodes, nodeRoot, nodeParent, node,
                nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
            )
            depth = depthToPathMap(mapStack, depth)
        }
    }
    
    return {
        "values": [model],
        "errors": [],
        "requestedPaths": [0],
        "optimizedPaths": [0],
        "requestedMissingPaths": [],
        "optimizedMissingPaths": []
    };
}