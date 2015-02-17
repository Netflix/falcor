function setJSONGsAsJSONG(model, envelopes, values, errorSelector, boundPath) {
    
    ++__GENERATION_VERSION;
    
    var nodeRoot = model._cache || (model._cache = {}),
        nodeParent = nodeRoot, node = nodeParent,
        boundLength = 0;
    
    boundPath = model._path || [];
    
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
    
    curried checkNodeExpired   = checkExpired(visit),
            mergeMessageNode   = mergeNode(checkNodeExpired),
            mergeMessageEdge   = mergeEdge(checkNodeExpired),
            optimizeJSONGRefN  = addRequestedKey(mergeMessageNode, optimizedPath),
            setJSONGRefNode    = nodeAsJSONG(optimizeJSONGRefN, jsonParent, jsonNode, boxed),
            setJSONGRefEdge    = setHardLink(setJSONGRefNode, reference),
            setReferenceNode   = walkReference(keySetFalse, setJSONGRefNode, setJSONGRefEdge, appendNullKey, reference),
            
            requestedJSONGKey  = getRequestedKeySet(getKeySet, requestedPath, boundLength),
            optimizeJSONGNode  = addOptimizedKey(mergeMessageNode, optimizedPath, refIndex, refLength),
            optimizeJSONGEdge  = addOptimizedKey(mergeMessageEdge, optimizedPath, refIndex, refLength),
            
            setJSONGNode       = nodeAsJSONG(optimizeJSONGNode, jsonParent, jsonNode, boxed),
            setJSONGEdge       = edgeAsJSONG(optimizeJSONGEdge, jsons, jsonParent, boxed),
            followJSONGRef     = followPathSetRef(setReferenceNode, optimizedPath, reference, refs, refIndex, refDepth, refHeight, refLength),
            setOptimizedNode   = optimizeNode(setJSONGNode, followJSONGRef),
            
            onJSONGNext        = onNext(requestedPath, optimizedPath, requestedPaths, optimizedPaths, appendNullKey),
            onJSONGNext2       = nextAsPathMap(onJSONGNext, hasValue, jsons, jsonParent, boxed),
            onJSONGError       = onErrorAsJSONG(errors, boxed, requestedPath, appendNullKey),
            onJSONGMiss        = onPathSetMiss(boundPath, boundLength, requestedPath, optimizedPath, requestedMissingPaths, optimizedMissingPaths),
            
            setPathSetAsJSONG  = walkPathSet(requestedJSONGKey, setOptimizedNode, setJSONGEdge, appendNullKey, path),
            setPathSetComboAsJSONG = walkPathSetCombo(
                setPathSetAsJSONG, unwindPath,
                onJSONGNext2, onJSONGError, onJSONGMiss,
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
            noop, setPathSetComboAsJSONG, pathSets,
            path, depth, length, height,
            nodes, nodeRoot, nodeParent, node,
            messages, messageRoot, messageParent, message,
            jsons, jsonRoot, jsonParent, jsonNode,
            nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires,
            messageType, messageValue, messageSize, messageTimestamp, messageExpires
        )
    }
    
    values && (values[0] = hasValue && {
        paths: requestedPaths,
        jsong: jsons[-1]
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