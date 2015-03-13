function setPathSet(model, path, value, offset) {
    
    ++__GENERATION_VERSION;
    
    if(Array.isArray(path) === false) {
        if(typeof offset !== "number") {
            offset = value;
        }
        value = path.value;
        path  = path.path;
    }
    
    var root = model._root,
        expired = root.expired,
        
        boxed = model._boxed || false,
        refreshing = model._refreshing || false,
        materialized = model._materialized || false,
        errorSelector = model._errorSelector,
        errorsAsValues = model._errorsAsValues || false,
        
        depth  = 0, linkDepth  = 0,
        height = 0, linkHeight = 0,
        linkPath  , linkIndex  = 0,
        
        requestedPath = [], requestedPaths = [], requestedMissingPaths = [],
        optimizedPath = [], optimizedPaths = [], optimizedMissingPaths = [],
        
        errors = [], refs = [], keysets = [],
        
        nodeLoc = getBoundPath(model),
        nodePath = nodeLoc.path,
        
        nodes = [], nodeRoot = model._cache, nodeParent = nodeLoc.value, node = nodeParent,
        jsons = [], jsonRoot = Object.create(null), jsonParent = jsonRoot, json = jsonParent,
        
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    offset || (offset = 0);
    refs[-1]  = nodePath;
    nodes[-1] = nodeParent;
    jsons[offset - 1] = jsonRoot;
    jsons[offset - 2] = jsons;
    keysets[offset-1] = offset - 1;
    
    curried errorSelector2 = errorSelector(requestedPath);
    
    NodeMixin(root, expired, errorSelector2, json)
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, value)
    NodeMixin(root, expired, errorSelector2, nodeValue)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    
    curried  addJSONKeySet    = addKeySetAtDepth(keysets),
             addJSONLink      = addLinkJSON(offset, jsons, jsonRoot, jsonParent, json, keysets),
             addJSONEdge      = addEdgeJSON(offset, jsons, jsonRoot, jsonParent, json, keysets, materialized, boxed, errorsAsValues),
             
             addReqPathKey    = addKeyAtDepth(requestedPath),
             addOptPathKey    = addKeyAtLinkDepth(optimizedPath, linkIndex, linkHeight),
             addOptLinkKey    = addKeyAtDepth(optimizedPath),
             addReqLeafKey    = addNullLeafKey(requestedPath),
             
             addRequestedPath = addSuccessPath(requestedPaths, requestedPath),
             addOptimizedPath = addSuccessPath(optimizedPaths, optimizedPath),
             
             setEdgeValue     = setEdge(value),
             addErrorValue2   = addErrorValue(errors, requestedPath),
             
             addRequestedMiss = addRequestedMissingPath(requestedMissingPaths, requestedPath, path, height, nodePath, 0),
             addOptimizedMiss = addOptimizedMissingPath(optimizedMissingPaths, optimizedPath, path, height),
             
             setupHardLink    = addHardLink(linkPath);
             
    sequence visitRefNodeKey  = [setNode, addOptLinkKey],
             visitRefEdge     = [addReqLeafKey, setupHardLink];
    
    curried  visitRefNode     = visitNode(visitRefNodeKey),
             walkReference    = walkLink(visitRefNode, visitRefEdge),
             followReference  = followHardLink(
                 walkReference, refs, optimizedPath,
                 linkPath, linkIndex, linkDepth, linkHeight
             );
    
    sequence visitNodeKey     = [addOptPathKey, setNode, addJSONLink],
             visitLeafKey     = [addRequestedPath, addOptimizedPath, addJSONEdge],
             visitMissKey     = [addRequestedMiss, addOptimizedMiss];
    
    curried  visitNodeKey2    = visitNode(visitNodeKey),
             visitEdgeKey     = visitEdge(setEdgeValue),
             visitEdgeLeaf    = visitLeaf(visitLeafKey, noop, materialized, errorsAsValues),
             visitEdgeError   = visitError(addErrorValue2),
             visitEdgeMiss    = visitMiss(visitMissKey, refreshing);
    
    sequence visitPathNode    = [addReqPathKey, addJSONKeySet, visitNodeKey2],
             visitPathLink    = [followReference],
             visitPathEdge    = [visitEdgeKey, visitEdgeLeaf, visitEdgeError, visitEdgeMiss];
    
    curried  hydratePaths     = hydrateKeysAtDepth(linkIndex, linkHeight, refs, requestedPath, optimizedPath);
    
    while(depth > -1) {
        
        depth = hydratePaths(depth)
        
        node  = walkPathSet(
            keyToKeySet, visitPathNode, visitPathLink, visitPathEdge,
            path, depth, height,
            nodes, nodeRoot, nodeParent, node,
            nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
        )
        
        depth = depthToKeySet(path, depth)
    }
    
    return {
        "values": jsons[offset - 1],
        "errors": errors,
        "requestedPaths": requestedPaths,
        "optimizedPaths": optimizedPaths,
        "requestedMissingPaths": requestedMissingPaths,
        "optimizedMissingPaths": optimizedMissingPaths
    };
}
