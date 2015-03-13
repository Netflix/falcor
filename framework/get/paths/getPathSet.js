function getPathSet(model, path, boundPath) {
    
    var root = model._root,
        expired = root.expired,
        
        boxed = model._boxed || false,
        refreshing = model._refreshing || false,
        materialized = model._materialized || false;
    
    var errorsAsValues = model._errorsAsValues || false,
        depth  = 0, linkDepth  = 0,
        height = 0, linkHeight = 0,
        linkPath  , linkIndex  = 0,
        optimizedPath = [], keysets = [],
        nodes = [], nodeRoot = model._cache, nodeParent = nodeRoot, node = nodeParent,
        jsons = [], jsonRoot = Object.create(null), jsonParent = jsonRoot, json = jsonParent,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    var offset = boundPath && boundPath.length || 0;
    
    nodes[-1] = nodeParent;
    jsons[offset - 1] = jsonRoot;
    jsons[offset - 2] = jsons;
    keysets[offset-1] = offset - 1;
    
    NodeMixin(root, expired, noop, node)
    NodeMixin(root, expired, noop, nodeValue)
    NodeMixin(root, expired, noop, json)
    
    curried  addJSONKeySet    = addKeySetAtDepth(keysets),
             addJSONLink      = addLinkJSON(offset, jsons, jsonRoot, jsonParent, json, keysets),
             addJSONEdge      = addEdgeJSON(offset, jsons, jsonRoot, jsonParent, json, keysets, materialized, boxed, errorsAsValues),
             setupHardLink    = addHardLink(linkPath),
             walkReference    = walkLink(noop, setupHardLink),
             followReference  = followHardLink(
                 walkReference, noop, optimizedPath,
                 linkPath, linkIndex, linkDepth, linkHeight
             ),
             visitNodeKey     = visitNode(addJSONLink),
             visitEdgeLeaf    = visitLeaf(addJSONEdge, noop, materialized, errorsAsValues);
    
    sequence visitPathNode    = [addJSONKeySet, visitNodeKey],
             visitPathLink    = [followReference],
             visitPathEdge    = [visitEdgeLeaf];
    
    while(depth > -1) {
        node  = walkPathSet(
            keyToKeySet, visitPathNode, visitPathLink, visitPathEdge,
            path, depth, height,
            nodes, nodeRoot, nodeParent, node,
            nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
        )
        depth = depthToKeySet(path, depth)
    }
    
    return jsons[offset - 1];
}