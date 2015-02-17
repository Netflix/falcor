function setJSONGsAsPathMap(model, envelopes, values, errorSelector, boundPath) {
    
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
        nodes: [], messages: [], jsons: [],
        errors: [], refs: [],
        depth: 0, refIndex: 0, refDepth: 0,
        requestedPath: [], optimizedPath: [],
        requestedPaths: [], optimizedPaths: [],
        requestedMissingPaths: [], optimizedMissingPaths: [],
        hasValue: false,
        jsonRoot: values && values[0], jsonParent: jsonRoot, jsonNode: jsonParent;
    
    var path, length = 0, height = 0, reference, refLength = 0, refHeight = 0,
        messageRoot, messageParent, message,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires,
        messageType, messageValue, messageSize, messageTimestamp, messageExpires;
    
    refs[-1]  = boundPath;
    nodes[-1] = nodeParent;
    jsons[-1] = jsonParent;
    jsons[-2] = jsons;
    
    curried errorSelector2 = errorSelector(requestedPath);
    
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    NodeMixin(root, expired, errorSelector2, message)
    NodeMixin(root, expired, errorSelector2, messageParent)
    NodeMixin(root, expired, errorSelector2, jsonNode)
    NodeMixin(root, expired, errorSelector2, jsonParent)
    NodeMixin(root, expired, errorSelector2, jsonRoot)
    
    curried checkNodeExpired    = checkExpired(visit),
            mergeMessageNode    = mergeNode(checkNodeExpired),
            mergeMessageEdge    = mergeEdge(checkNodeExpired),
            optimizePathMapRefN = addRequestedKey(mergeMessageNode, optimizedPath),
            optimizePathMapRefE = setHardLink(optimizePathMapRefN, reference),
            setReferenceNode    = walkReference(keySetFalse, optimizePathMapRefN, optimizePathMapRefE, appendNullKey, reference),
            
            requestedPathMapKey = getRequestedKeySet(getKeySet, requestedPath, boundLength),
            optimizePathMapNode = addOptimizedKey(mergeMessageNode, optimizedPath, refIndex, refLength),
            optimizePathMapEdge = addOptimizedKey(mergeMessageEdge, optimizedPath, refIndex, refLength),
            
            followPathMapRef    = followPathSetRef(setReferenceNode, optimizedPath, reference, refs, refIndex, refDepth, refHeight, refLength),
            setOptimizedNode    = optimizeNode(optimizePathMapNode, followPathMapRef),
            setPathMapNode      = nodeAsPathMap(setOptimizedNode, jsonParent, jsonNode, boundLength, boxed),
            setPathMapEdge      = edgeAsPathMap(optimizePathMapEdge, jsons, jsonParent, boundLength, boxed),
            
            onPathMapNext       = onNext(requestedPath, optimizedPath, requestedPaths, optimizedPaths, appendNullKey),
            onPathMapNext2      = nextAsPathMap(onPathMapNext, hasValue, jsons, jsonParent, boxed),
            onPathMapError      = onError(errors, boxed, requestedPath, appendNullKey),
            onPathMapMiss       = onPathSetMiss(boundPath, boundLength, requestedPath, optimizedPath, requestedMissingPaths, optimizedMissingPaths),
            
            setPathSetAsPathMap = walkPathSet(requestedPathMapKey, setPathMapNode, setPathMapEdge, appendNullKey, path),
            setPathSetComboAsPathMap = walkPathSetCombo(
                setPathSetAsPathMap, unwindPath,
                onPathMapNext2, onPathMapError, onPathMapMiss,
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
            noop, setPathSetComboAsPathMap, pathSets,
            path, depth, length, height,
            nodes, nodeRoot, nodeParent, node,
            messages, messageRoot, messageParent, message,
            jsons, jsonRoot, jsonParent, jsonNode,
            nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires,
            messageType, messageValue, messageSize, messageTimestamp, messageExpires
        )
    }
    
    values && (values[0] = hasValue && {
        json: jsons[-1]
    } || undefined);
    
    return {
        "values": values,
        "errors": errors,
        "requestedPaths": requestedPaths,
        "optimizedPaths": optimizedPaths,
        "requestedMissingPaths": requestedMissingPaths,
        "optimizedMissingPaths": optimizedMissingPaths
    };
}
