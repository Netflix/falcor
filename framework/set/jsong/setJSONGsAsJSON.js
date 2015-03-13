function setJSONGsAsJSON(model, envelopes, values, errorSelector, boundPath) {
    
    ++__GENERATION_VERSION;
    
    offset = 0;
    
    var root = model._root,
        expired = root.expired,
        
        boxed = model._boxed || false,
        refreshing = model._refreshing || false,
        materialized = model._materialized || false;
    errorSelector = errorSelector || model._errorSelector;
    var errorsAsValues = model._errorsAsValues || false,
        
        path, hasValue = false,
        depth  = 0, linkDepth  = 0,
        height = 0, linkHeight = 0,
        linkPath  , linkIndex  = 0,
        
        requestedPath = [], requestedPaths = [], requestedMissingPaths = [],
        optimizedPath = [], optimizedPaths = [], optimizedMissingPaths = [],
        
        errors = [], refs = [], keysets = [],
        
        nodePath = [],
        nodes = [], nodeRoot = model._cache, nodeParent = nodeRoot, node = nodeParent,
        messages = [], messageRoot, messageParent, message,
        jsons = [], jsonRoot, jsonParent, json,
        
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires,
        messageType, messageValue, messageSize, messageTimestamp, messageExpires;
    
    refs[-1]  = nodePath;
    nodes[-1] = nodeParent;
    jsons[offset - 2] = jsons;
    keysets[offset-1] = offset - 1;
    
    curried errorSelector2 = errorSelector(requestedPath);
    
    NodeMixin(root, expired, errorSelector2, json)
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, message)
    NodeMixin(root, expired, errorSelector2, nodeValue)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    NodeMixin(root, expired, errorSelector2, messageParent)
    
    curried  addJSONKeySet    = addKeySetAtDepth(keysets),
             addJSONLink      = addLinkJSON(offset, jsons, jsonRoot, jsonParent, json, keysets),
             addJSONEdge      = addEdgeJSON(offset, jsons, jsonRoot, jsonParent, json, keysets, materialized, boxed, errorsAsValues),
             
             addReqPathKey    = addKeyAtDepth(requestedPath),
             addOptPathKey    = addKeyAtLinkDepth(optimizedPath, linkIndex, linkHeight),
             addOptLinkKey    = addKeyAtDepth(optimizedPath),
             addReqLeafKey    = addNullLeafKey(requestedPath),
             
             addRequestedPath = addSuccessPath(requestedPaths, requestedPath),
             addOptimizedPath = addSuccessPath(optimizedPaths, optimizedPath),
             
             addErrorValue2   = addErrorValue(errors, requestedPath),
             
             addRequestedMiss = addRequestedMissingPath(requestedMissingPaths, requestedPath, path, height, nodePath, pathSetIndex),
             addOptimizedMiss = addOptimizedMissingPath(optimizedMissingPaths, optimizedPath, path, height),
             
             setupHardLink    = addHardLink(linkPath);
             
    sequence visitRefNodeKey  = [addOptLinkKey, mergeNode],
             visitRefEdge     = [addReqLeafKey, setupHardLink];
    
    curried  visitRefNode     = visitNode(visitRefNodeKey),
             walkReference    = walkLink(visitRefNode, visitRefEdge),
             followReference  = followLink(
                 walkReference, refs, optimizedPath,
                 linkPath, linkIndex, linkDepth, linkHeight
             );
    
    sequence visitNodeKey     = [addOptPathKey, mergeNode, addJSONLink],
             visitLeafKey     = [addRequestedPath, addOptimizedPath, addJSONEdge],
             visitMissKey     = [addRequestedMiss, addOptimizedMiss];
    
    curried  visitNodeKey2    = visitNode(visitNodeKey),
             visitEdgeKey     = visitEdge(mergeEdge),
             visitEdgeLeaf    = visitLeaf(visitLeafKey, hasValue, materialized, errorsAsValues),
             visitEdgeError   = visitError(addErrorValue2),
             visitEdgeMiss    = visitMiss(visitMissKey, refreshing);
    
    sequence visitPathNode    = [addReqPathKey, addJSONKeySet, visitNodeKey2],
             visitPathLink    = [followReference],
             visitPathEdge    = [visitEdgeKey, visitEdgeLeaf, visitEdgeError, visitEdgeMiss];
    
    curried  hydratePaths     = hydrateKeysAtDepth(linkIndex, linkHeight, refs, requestedPath, optimizedPath);
    
    var envelope, pathSets, pathSetIndex = 0;
    
    for(var envelopeIndex = -1, envelopeCount = envelopes.length; ++envelopeIndex < envelopeCount;) {
        
        envelope = envelopes[envelopeIndex];
        pathSets = envelope.paths;
        messages[-1] = messageRoot = envelope.jsong || envelope.values || envelope.value;
        
        for(var index = -1, count = pathSets.length; ++index < count;) {
            
            path = pathSets[index];
            depth = 0;
            refs.length = 0;
            jsons.length = 0;
            keysets.length = 0;
            jsons[offset - 1] = jsonRoot = jsonParent = json = values && values[pathSetIndex];
            
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
            
            values && (values[pathSetIndex++] = !(hasValue = !hasValue) && { json: jsons[offset - 1] } || undefined);
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
