function getPathSetsAsValues(model, pathSets, values, errorSelector, boundPath) {
    
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
        materialized = (model._materialized || false) && !model._dataSource && !model._router;
    errorSelector = errorSelector || model._errorSelector;
    var errorsAsValues = model._errorsAsValues || false,
        
        path,
        depth  = 0, linkDepth  = 0,
        height = 0, linkHeight = 0,
        linkPath , linkIndex  = 0,
        
        requestedPath = [], requestedPaths = [], requestedMissingPaths = [],
        optimizedPath = [], optimizedPaths = [], optimizedMissingPaths = [],
        
        errors = [], refs = [],
        
        nodeLoc = getBoundPath(model),
        nodePath = nodeLoc.path,
        
        nodes = [], nodeRoot = model._cache, nodeParent = nodeLoc.value, node = nodeParent,
        
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    var offset = boundPath && boundPath.length || 0;
    refs[-1]  = nodePath;
    nodes[-1] = nodeParent;
    
    NodeMixin(root, expired, errorSelector, node)
    NodeMixin(root, expired, errorSelector, nodeValue)
    
    curried  addReqPathKey    = addKeyAtDepth(requestedPath),
             addOptPathKey    = addKeyAtLinkDepth(optimizedPath, linkIndex, linkHeight),
             addOptLinkKey    = addKeyAtDepth(optimizedPath),
             addReqLeafKey    = addNullLeafKey(requestedPath),
             
             addRequestedPath = addSuccessPath(requestedPaths, requestedPath),
             addOptimizedPath = addSuccessPath(optimizedPaths, optimizedPath),
             addPathValue2    = addPathValue(values, onNext, requestedPath, materialized, boxed, errorsAsValues),
             addErrorValue2   = addErrorValue(errors, requestedPath),
             
             addRequestedMiss = addRequestedMissingPath(requestedMissingPaths, requestedPath, path, height, nodePath, index),
             addOptimizedMiss = addOptimizedMissingPath(optimizedMissingPaths, optimizedPath, path, height),
             
             setupHardLink    = addHardLink(linkPath),
             visitRefNodeKey  = visitNode(addOptLinkKey);
    
    sequence visitRefNode     = [visitRefNodeKey],
             visitRefEdge     = [addReqLeafKey, setupHardLink];
    
    curried  walkReference    = walkLink(visitRefNode, visitRefEdge),
             followReference  = followHardLink(walkReference, refs, optimizedPath, linkPath, linkIndex, linkDepth, linkHeight);
    
    sequence visitNodeKey     = [addOptPathKey],
             visitLeafKey     = [addRequestedPath, addOptimizedPath, addPathValue2],
             visitMissKey     = [addRequestedMiss, addOptimizedMiss];
    
    curried  visitNodeKey2    = visitNode(visitNodeKey),
             visitEdgeLeaf    = visitLeaf(visitLeafKey, noop, materialized, errorsAsValues),
             visitEdgeError   = visitError(addErrorValue2),
             visitEdgeMiss    = visitMiss(visitMissKey, refreshing);
    
    sequence visitPathNode    = [addReqPathKey, visitNodeKey2],
             visitPathLink    = [followReference],
             visitPathEdge    = [visitEdgeLeaf, visitEdgeError, visitEdgeMiss];
    
    for(var index = -1, count = pathSets.length; ++index < count;) {
        
        path  = pathSets[index];
        depth = 0;
        
        while(depth > -1) {
            depth = hydrateKeysAtDepth(linkIndex, linkHeight, refs, requestedPath, optimizedPath, depth)
            node  = walkPathSet(
                keyToKeySet, visitPathNode, visitPathLink, visitPathEdge,
                path, depth, height,
                nodes, nodeRoot, nodeParent, node,
                nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
            )
            depth = depthToKeySet(path, depth)
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
