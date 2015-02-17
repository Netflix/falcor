function setJSONGsAsValues(model, envelopes, values, errorSelector, boundPath) {
    
    ++__GENERATION_VERSION;
    
    Array.isArray(values) && (values.length = 0);
    
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
        nodes: [], messages: [],
        errors: [], refs: [],
        depth: 0, refIndex: 0, refDepth: 0,
        requestedPath: [], optimizedPath: [],
        requestedPaths: [], optimizedPaths: [],
        requestedMissingPaths: [], optimizedMissingPaths: [],
        hasValue: false;
    
    var path, length = 0, height = 0, reference, refLength = 0, refHeight = 0,
        messageRoot, messageParent, message,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires,
        messageType, messageValue, messageSize, messageTimestamp, messageExpires;
    
    refs[-1]  = boundPath;
    nodes[-1] = nodeParent;
    
    curried errorSelector2 = errorSelector(requestedPath);
    
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    NodeMixin(root, expired, errorSelector2, message)
    NodeMixin(root, expired, errorSelector2, messageParent)
    
    curried checkNodeExpired = checkExpired(visit),
            mergeMessageNode = mergeNode(checkNodeExpired),
            mergeMessageEdge = mergeEdge(checkNodeExpired),
            optimizeRefN     = addRequestedKey(mergeMessageNode, optimizedPath),
            optimizeRefE     = setHardLink(optimizeRefN, reference),
            setReferenceNode = walkReference(keySetFalse, optimizeRefN, optimizeRefE, appendNullKey, reference),
            
            requestedKey     = getRequestedKeySet(getKeySet, requestedPath, boundLength),
            optimizedNode    = addOptimizedKey(mergeMessageNode, optimizedPath, refIndex, refLength),
            optimizedEdge    = addOptimizedKey(mergeMessageEdge, optimizedPath, refIndex, refLength),
            
            followNodeRef    = followPathSetRef(setReferenceNode, optimizedPath, reference, refs, refIndex, refDepth, refHeight, refLength),
            setOptimizedNode = optimizeNode(optimizedNode, followNodeRef),
            
            onValueNext      = onNext(requestedPath, optimizedPath, requestedPaths, optimizedPaths, appendNullKey),
            onValueNext2     = nextAsValue(onValueNext, values, boxed, node, nodeValue, requestedPath, appendNullKey),
            onValueError     = onError(errors, boxed, requestedPath, appendNullKey),
            onValueMiss      = onPathSetMiss(boundPath, boundLength, requestedPath, optimizedPath, requestedMissingPaths, optimizedMissingPaths),
            
            setPathSet = walkPathSet(requestedKey, setOptimizedNode, optimizedEdge, appendNullKey, path),
            setPathSetCombo = walkPathSetCombo(
                setPathSet, unwindPath,
                onValueNext2, onValueError, onValueMiss,
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
            noop, setPathSetCombo, pathSets,
            path, depth, length, height,
            nodes, nodeRoot, nodeParent, node,
            messages, messageRoot, messageParent, message,
            nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires,
            messageType, messageValue, messageSize, messageTimestamp, messageExpires
        )
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
