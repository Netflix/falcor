function setCache(model, map) {
    
    var root = model._root,
        expired = root.expired,
        depth = 0, height = 0, mapStack = [],
        nodes = [], nodeRoot = model._cache, nodeParent = nodeRoot, node = nodeParent,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    mapStack[0] = map;
    nodes[-1] = nodeParent;
    
    NodeMixin(root, expired, noop, map)
    NodeMixin(root, expired, noop, node)
    NodeMixin(root, expired, noop, nodeValue)
    NodeMixin(root, expired, noop, nodeParent)
    
    curried  setMapBranch     = setNodeMap(map),
             setEdgeValue     = setEdge(map),
             visitNodeKey     = visitNode(setMapBranch),
             visitEdgeKey     = visitEdge(setEdgeValue);
    
    sequence visitPathNode    = [visitNodeKey],
             visitPathLink    = [],
             visitPathEdge    = [visitEdgeKey];
    
    while(depth > -1) {
        
        node  = walkPathMap(
            keyToKeySet, visitPathNode, visitPathLink, visitPathEdge,
            mapStack, map, depth, height,
            nodes, nodeRoot, nodeParent, node,
            nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
        )
        
        depth = depthToPathMap(mapStack, depth)
    }
    
    return nodeRoot;
}