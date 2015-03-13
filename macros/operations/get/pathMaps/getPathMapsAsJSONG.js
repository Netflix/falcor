function getPathMapsAsJSONG(model, pathMaps, values, offset) {
    
    var root = model._root,
        expired = root.expired,
        
        boxed = model._boxed || false,
        refreshing = model._refreshing || false,
        materialized = model._materialized || false,
        errorSelector = model._errorSelector,
        errorsAsValues = true,
        
        map, hasValue = false,
        depth  = 0, linkDepth  = 0,
        height = 0, linkHeight = 0,
        linkPath , linkIndex  = 0,
        
        requestedPath = [], requestedPaths = [], requestedMissingPaths = [],
        optimizedPath = [], optimizedPaths = [], optimizedMissingPaths = [],
        
        errors = [], refs = [], mapStack = [],
        
        nodeLoc = getBoundPath(model),
        nodePath = nodeLoc.path,
        
        nodes = [], nodeRoot = model._cache, nodeParent = nodeLoc.value, node = nodeParent,
        jsons = [], jsonRoot, jsonParent, json,
        
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    offset || (offset = 0)
    refs[-1]  = nodePath;
    nodes[-1] = nodeParent;
    
    NodeMixin(root, expired, errorSelector, node)
    NodeMixin(root, expired, errorSelector, nodeValue)
    NodeMixin(root, expired, errorSelector, json)
    
    curried  addJSONNode      = addNodeJSONG(jsonRoot, jsonParent, json, boxed),
             addJSONLink      = addLinkJSONG(jsonRoot, jsonParent, json, materialized, boxed, errorsAsValues),
             addJSONEdge      = addEdgeJSONG(jsonRoot, jsonParent, json, materialized, boxed, errorsAsValues),
             
             addReqPathKey    = addKeyAtDepth(requestedPath),
             addOptPathKey    = addKeyAtLinkDepth(optimizedPath, linkIndex, linkHeight),
             addOptLinkKey    = addKeyAtDepth(optimizedPath),
             addReqLeafKey    = addNullLeafKey(requestedPath),
             
             addRequestedPath = addSuccessPath(requestedPaths, requestedPath),
             addOptimizedPath = addSuccessPath(optimizedPaths, optimizedPath),
             
             addErrorValue2   = addErrorValue(errors, requestedPath),
             
             addMissingPaths  = addMissingPathMaps(
                 requestedMissingPaths, requestedPath,
                 optimizedMissingPaths, optimizedPath,
                 mapStack, nodePath, index
             ),
             
             setupHardLink    = addHardLink(linkPath);
    
    sequence visitRefNodeKey  = [addOptLinkKey, addJSONLink];
    
    curried  visitRefNodeKey2 = visitNode(visitRefNodeKey);
    
    sequence visitRefNode     = [visitRefNodeKey2],
             visitRefEdge     = [addReqLeafKey, setupHardLink];
    
    curried  walkReference    = walkLink(visitRefNode, visitRefEdge),
             followReference  = followLink(walkReference, refs, optimizedPath, linkPath, linkIndex, linkDepth, linkHeight);
    
    sequence visitNodeKey     = [addOptPathKey, addJSONNode],
             visitLeafKey     = [addRequestedPath, addOptimizedPath, addJSONEdge],
             visitMissKey     = [addMissingPaths];
    
    curried  visitNodeKey2    = visitNode(visitNodeKey),
             visitEdgeLeaf    = visitLeaf(visitLeafKey, hasValue, materialized, errorsAsValues),
             visitEdgeError   = visitError(addErrorValue2),
             visitEdgeMiss    = visitMiss(visitMissKey, refreshing);
    
    sequence visitPathNode    = [addReqPathKey, visitNodeKey2],
             visitPathLink    = [followReference],
             visitPathEdge    = [visitEdgeLeaf, visitEdgeError, visitEdgeMiss];
    
    for(var index = -1, count = pathMaps.length; ++index < count;) {
        
        map = mapStack[0] = pathMaps[index];
        depth = 0;
        refs.length  = 0;
        jsons.length = 0;
        jsons[offset - 1] = jsonRoot = jsonParent = json = values && values[0];
        
        while(depth > -1) {
            depth = hydrateKeysAtDepth(linkIndex, linkHeight, refs, requestedPath, optimizedPath, depth)
            node  = walkPathMap(
                keyToKeySet, visitPathNode, visitPathLink, visitPathEdge,
                mapStack, map, depth, height,
                nodes, nodeRoot, nodeParent, node,
                jsons, jsonRoot, jsonParent, json,
                nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
            )
            depth = depthToPathMap(mapStack, depth)
        }
    }
    
    values && (values[0] = !(hasValue = !hasValue) && { jsong: jsons[offset - 1], paths: requestedPaths } || undefined);
    
    return {
        "values": values,
        "errors": errors,
        "requestedPaths": requestedPaths,
        "optimizedPaths": optimizedPaths,
        "requestedMissingPaths": requestedMissingPaths,
        "optimizedMissingPaths": optimizedMissingPaths
    };
}
