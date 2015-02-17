function setJSONGsAsJSON(model, envelopes, values, errorSelector, boundPath) {
    
    ++__GENERATION_VERSION;
    
    var boundLength = 0,
        nodeRoot = model._cache || (model._cache = {}),
        nodeParent, node;
    
    if(Array.isArray(boundPath)) {
        nodeParent  = nodeRoot;
        boundLength = boundPath.length;
    } else {
        nodeParent  = getBoundContext(model);
        boundPath   = model._path || [];
    }
    
    var root       = model._root  || model,
        boxed      = model._boxed || false,
        expired    = root.expired || (root.expired = []),
        refreshing = model._refreshing || false,
        appendNullKey = false;
    
    (typeof errorSelector === "function") || (errorSelector = model._errorSelector) || (errorSelector = function(x, y){return y;});
    
    default var envelopes <-
        jsonKeys: [],
        nodes: [], messages: [], jsons: [],
        errors: [], refs: [],
        depth: 0, refIndex: 0, refDepth: 0,
        requestedPath: [], optimizedPath: [],
        requestedPaths: [], optimizedPaths: [],
        requestedMissingPaths: [], optimizedMissingPaths: [],
        hasValue: false,
        jsonRoot: values && values[0], jsonParent: jsonRoot, jsonNode: jsonParent;
    
    var path, length = 0, height = 0, reference, refLength = 0, refHeight = 0,
        jsonValueOffset = 0, messageRoot, messageParent, message,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires,
        messageType, messageValue, messageSize, messageTimestamp, messageExpires;
    
    refs[-1]  = boundPath;
    nodes[-1] = nodeParent;
    jsons[-1] = jsonParent;
    jsons[-2] = jsons;
    jsonKeys[-1] = -1;
    
    curried errorSelector2 = errorSelector(requestedPath);
    
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    NodeMixin(root, expired, errorSelector2, message)
    NodeMixin(root, expired, errorSelector2, messageParent)
    NodeMixin(root, expired, errorSelector2, jsonNode)
    NodeMixin(root, expired, errorSelector2, jsonParent)
    NodeMixin(root, expired, errorSelector2, jsonRoot)
    
    curried getPathAsJSON    = pathAsJSON(noop, hasValue, values, jsons, jsonRoot, jsonKeys),
            getPathAsJSONG   = jsongPathAsJSON(getPathAsJSON, jsonValueOffset),
            unwindAsJSONG    = unwindJSONGPathAsJSON(unwindPath, hasValue, values, jsons, jsonRoot, jsonValueOffset),
            checkNodeExpired = checkExpired(visit),
            mergeMessageNode = mergeNode(checkNodeExpired),
            mergeMessageEdge = mergeEdge(checkNodeExpired),
            optimizeJSONRefN = addRequestedKey(mergeMessageNode, optimizedPath),
            optimizeJSONRefE = setHardLink(optimizeJSONRefN, reference),
            setReferenceNode = walkReference(keySetFalse, optimizeJSONRefN, optimizeJSONRefE, appendNullKey, reference),
            
            requestedJSONKey = getRequestedKeySet(getKeySet, requestedPath, boundLength),
            optimizeJSONNode = addOptimizedKey(mergeMessageNode, optimizedPath, refIndex, refLength),
            optimizeJSONEdge = addOptimizedKey(mergeMessageEdge, optimizedPath, refIndex, refLength),
            
            setJSONNode      = nodeAsJSON(optimizeJSONNode, jsonKeys, jsonParent, jsonNode, boundLength),
            setJSONEdge      = edgeAsJSON(optimizeJSONEdge, jsonKeys, jsons, jsonParent, boundLength),
            followJSONRef    = followPathSetRef(setReferenceNode, optimizedPath, reference, refs, refIndex, refDepth, refHeight, refLength),
            setOptimizedNode = optimizeNode(setJSONNode, followJSONRef),
            
            onJSONNext       = onNext(requestedPath, optimizedPath, requestedPaths, optimizedPaths, appendNullKey),
            onJSONNext2      = nextAsJSON(onJSONNext, hasValue, jsonKeys, jsons, jsonParent, boxed),
            onJSONError      = onError(errors, boxed, requestedPath, appendNullKey),
            onJSONMiss       = onPathSetMiss(boundPath, boundLength, requestedPath, optimizedPath, requestedMissingPaths, optimizedMissingPaths),
            
            setPathSetAsJSON = walkPathSet(requestedJSONKey, setOptimizedNode, setJSONEdge, appendNullKey, path),
            setPathSetComboAsJSON = walkPathSetCombo(
                setPathSetAsJSON, unwindAsJSONG,
                onJSONNext2, onJSONError, onJSONMiss,
                boxed, refreshing, appendNullKey,
                refs, refIndex, refLength,
                requestedPath, optimizedPath
            );
    
    var envelope, pathSets, index = -1, count = envelopes.length;
    
    while(++index < count) {
        envelope = envelopes[index];
        pathSets = envelope.paths;
        messages[-1] = messageRoot = envelope.jsong || envelope.values || envelope.value || Object.create(null);
        
        values = walkPathSets(
            getPathAsJSONG, setPathSetComboAsJSON, pathSets,
            path, depth, length, height,
            nodes, nodeRoot, nodeParent, node,
            messages, messageRoot, messageParent, message,
            jsons, jsonRoot, jsonParent, jsonNode,
            nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires,
            messageType, messageValue, messageSize, messageTimestamp, messageExpires
        )
        
        jsonValueOffset += pathSets.length;
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