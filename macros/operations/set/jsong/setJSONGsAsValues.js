function setJSONGsAsValues(model, envelopes, values, offset) {
    
    ++__GENERATION_VERSION;
    
    offset = 0;
    
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
        
        path,
        depth  = 0, linkDepth  = 0,
        height = 0, linkHeight = 0,
        linkPath  , linkIndex  = 0,
        
        requestedPath = [], requestedPaths = [], requestedMissingPaths = [],
        optimizedPath = [], optimizedPaths = [], optimizedMissingPaths = [],
        
        errors = [], refs = [],
        
        nodePath = [],
        nodes = [], nodeRoot = model._cache, nodeParent = nodeRoot, node = nodeParent,
        messages = [], messageRoot, messageParent, message,
        
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires,
        messageType, messageValue, messageSize, messageTimestamp, messageExpires;
    
    refs[-1]  = nodePath;
    nodes[-1] = nodeParent;
    
    curried errorSelector2 = errorSelector(requestedPath);
    
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, message)
    NodeMixin(root, expired, errorSelector2, nodeValue)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    NodeMixin(root, expired, errorSelector2, messageParent)
    
    curried  addReqPathKey    = addKeyAtDepth(requestedPath),
             addOptPathKey    = addKeyAtLinkDepth(optimizedPath, linkIndex, linkHeight),
             addOptLinkKey    = addKeyAtDepth(optimizedPath),
             addReqLeafKey    = addNullLeafKey(requestedPath),
             
             addRequestedPath = addSuccessPath(requestedPaths, requestedPath),
             addOptimizedPath = addSuccessPath(optimizedPaths, optimizedPath),
             
             addPathValue2    = addPathValue(values, onNext, requestedPath, materialized, boxed, errorsAsValues),
             addErrorValue2   = addErrorValue(errors, requestedPath),
             
             addRequestedMiss = addRequestedMissingPath(requestedMissingPaths, requestedPath, path, height, nodePath, pathSetIndex),
             addOptimizedMiss = addOptimizedMissingPath(optimizedMissingPaths, optimizedPath, path, height),
             
             setupHardLink    = addHardLink(linkPath);
             
    sequence visitRefNodeKey  = [addOptLinkKey, mergeNode],
             visitRefEdge     = [addReqLeafKey, setupHardLink];
    
    curried  visitRefNode     = visitNode(visitRefNodeKey),
             walkReference    = walkLink(visitRefNode, visitRefEdge),
             followReference  = followLink(walkReference, refs, optimizedPath, linkPath, linkIndex, linkDepth, linkHeight);
    
    sequence visitNodeKey     = [addOptPathKey, mergeNode],
             visitLeafKey     = [addRequestedPath, addOptimizedPath, addPathValue2],
             visitMissKey     = [addRequestedMiss, addOptimizedMiss];
    
    curried  visitNodeKey2    = visitNode(visitNodeKey),
             visitEdgeKey     = visitEdge(mergeEdge),
             visitEdgeLeaf    = visitLeaf(visitLeafKey, noop, materialized, errorsAsValues),
             visitEdgeError   = visitError(addErrorValue2),
             visitEdgeMiss    = visitMiss(visitMissKey, refreshing);
    
    sequence visitPathNode    = [addReqPathKey, visitNodeKey2],
             visitPathLink    = [followReference],
             visitPathEdge    = [visitEdgeKey, visitEdgeLeaf, visitEdgeError, visitEdgeMiss];
    
    curried  hydratePaths     = hydrateKeysAtDepth(linkIndex, linkHeight, refs, requestedPath, optimizedPath);
    
    var envelope, pathSets, pathSetIndex = -1;
    
    for(var envelopeIndex = -1, envelopeCount = envelopes.length; ++envelopeIndex < envelopeCount;) {
        
        envelope = envelopes[envelopeIndex];
        pathSets = envelope.paths;
        messages[-1] = messageRoot = envelope.jsong || envelope.values || envelope.value;
        
        for(var index = -1, count = pathSets.length; ++index < count;) {
            
            pathSetIndex++;
            path = pathSets[index];
            depth = 0;
            refs.length = 0;
            
            while(depth > -1) {
                
                depth = hydratePaths(depth)
                
                node  = walkPathSet(
                    keyToKeySet, visitPathNode, visitPathLink, visitPathEdge,
                    path, depth, height,
                    nodes, nodeRoot, nodeParent, node,
                    messages, messageRoot, messageParent, message,
                    nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires,
                    messageType, messageValue, messageSize, messageTimestamp, messageExpires
                )
                
                depth = depthToKeySet(path, depth)
            }
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
