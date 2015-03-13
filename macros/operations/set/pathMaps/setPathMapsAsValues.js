function setPathMapsAsValues(model, pathMaps, values, offset) {
    
    ++__GENERATION_VERSION;
    
    var onNext;
    if(Array.isArray(values)) {
        values.length = 0;
    } else {
        onNext = values;
        values = undefined;
    }
    
    var root = model._root,
        expired = root.expired,
        
        boxed = model._boxed || false,
        refreshing = model._refreshing || false,
        materialized = model._materialized || false,
        errorSelector = model._errorSelector,
        errorsAsValues = model._errorsAsValues || false,
        
        map,
        depth  = 0, linkDepth  = 0,
        height = 0, linkHeight = 0,
        linkPath , linkIndex  = 0,
        
        requestedPath = [], requestedPaths = [], requestedMissingPaths = [],
        optimizedPath = [], optimizedPaths = [], optimizedMissingPaths = [],
        
        errors = [], refs = [], mapStack = [],
        
        nodeLoc = getBoundPath(model),
        nodePath = nodeLoc.path,
        
        nodes = [], nodeRoot = model._cache, nodeParent = nodeLoc.value, node = nodeParent,
        
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    offset || (offset = 0);
    refs[-1]  = nodePath;
    nodes[-1] = nodeParent;
    
    curried errorSelector2 = errorSelector(requestedPath);
    
    NodeMixin(root, expired, errorSelector2, map)
    NodeMixin(root, expired, errorSelector2, json)
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, nodeValue)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    
    curried  addReqPathKey    = addKeyAtDepth(requestedPath),
             addOptPathKey    = addKeyAtLinkDepth(optimizedPath, linkIndex, linkHeight),
             addOptLinkKey    = addKeyAtDepth(optimizedPath),
             addReqLeafKey    = addNullLeafKey(requestedPath),
             
             addRequestedPath = addSuccessPath(requestedPaths, requestedPath),
             addOptimizedPath = addSuccessPath(optimizedPaths, optimizedPath),
             addPathValue2    = addPathValue(values, onNext, requestedPath, materialized, boxed, errorsAsValues),
             
             setMapBranch     = setNodeMap(map),
             setEdgeValue     = setEdge(map),
             addErrorValue2   = addErrorValue(errors, requestedPath),
             
             addMissingPaths  = addMissingPathMaps(
                 requestedMissingPaths, requestedPath,
                 optimizedMissingPaths, optimizedPath,
                 mapStack, nodePath, index
             ),
             setupHardLink    = addHardLink(linkPath);
    
    sequence visitRefNodeKey  = [setMapBranch, addOptLinkKey],
             visitRefEdge     = [addReqLeafKey, setupHardLink];
    
    curried  visitRefNode     = visitNode(visitRefNodeKey),
             walkReference    = walkLink(visitRefNode, visitRefEdge),
             followReference  = followHardLink(walkReference, refs, optimizedPath, linkPath, linkIndex, linkDepth, linkHeight);
    
    sequence visitNodeKey     = [addOptPathKey, setMapBranch],
             visitLeafKey     = [addRequestedPath, addOptimizedPath, addPathValue2],
             visitMissKey     = [addMissingPaths];
    
    curried  visitNodeKey2    = visitNode(visitNodeKey),
             visitEdgeKey     = visitEdge(setEdgeValue),
             visitEdgeLeaf    = visitLeaf(visitLeafKey, noop, materialized, errorsAsValues),
             visitEdgeError   = visitError(addErrorValue2),
             visitEdgeMiss    = visitMiss(visitMissKey, refreshing);
    
    sequence visitPathNode    = [addReqPathKey, visitNodeKey2],
             visitPathLink    = [followReference],
             visitPathEdge    = [visitEdgeKey, visitEdgeLeaf, visitEdgeError, visitEdgeMiss];
    
    for(var index = -1, count = pathMaps.length; ++index < count;) {
        
        map = mapStack[0] = pathMaps[index];
        depth = 0;
        refs.length = 0;
        
        while(depth > -1) {
            depth = hydrateKeysAtDepth(linkIndex, linkHeight, refs, requestedPath, optimizedPath, depth)
            node  = walkPathMap(
                keyToKeySet, visitPathNode, visitPathLink, visitPathEdge,
                mapStack, map, depth, height,
                nodes, nodeRoot, nodeParent, node,
                nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
            )
            depth = depthToPathMap(mapStack, depth)
        }
    }
    
    return {
        "values": values,
        "errors": errors,
        "requestedPaths": requestedPaths,
        "optimizedPaths": optimizedPaths,
        "requestedMissingPaths": requestedMissingPaths,
        "optimizedMissingPaths": optimizedMissingPaths
    };
}
