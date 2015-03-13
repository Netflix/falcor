function setPath(model, path, value) {
    
    ++__GENERATION_VERSION;
    
    if(Array.isArray(path) === false) {
        value = path.value;
        path  = path.path;
    }
    
    var root = model._root,
        expired = root.expired,
        errorSelector = model._errorSelector,
        depth  = 0, linkDepth  = 0,
        height = 0, linkHeight = 0,
        linkPath, linkIndex = 0,
        optimizedPath = [],
        nodeRoot = model._cache,
        nodeParent = nodeRoot, node = nodeParent,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    
    curried errorSelector2 = errorSelector(optimizedPath);
    
    NodeMixin(root, expired, errorSelector2, node)
    NodeMixin(root, expired, errorSelector2, value)
    NodeMixin(root, expired, errorSelector2, nodeValue)
    NodeMixin(root, expired, errorSelector2, nodeParent)
    
    curried  addOptPathKey   = addKeyAtLinkDepth(optimizedPath, linkIndex, linkHeight),
             addOptLinkKey   = addKeyAtDepth(optimizedPath),
             addReqLeafKey   = addNullErrorKey(optimizedPath),
             setupHardLink   = addHardLink(linkPath),
             setEdgeValue    = setEdge(value);
    
    sequence visitRefNodeKey = [setNode, addOptLinkKey],
             visitRefEdge    = [addReqLeafKey, setupHardLink];
    
    curried  visitRefNode    = visitNode(visitRefNodeKey),
             walkReference   = walkLink(visitRefNode, visitRefEdge),
             followReference = followHardLink(
                 walkReference, noop, optimizedPath,
                 linkPath, linkIndex, linkDepth, linkHeight
             );
    
    sequence visitNodeKey    = [addOptPathKey, setNode];
    curried  visitNodeKey2   = visitNode(visitNodeKey),
             visitLeafKey    = visitEdge(setEdgeValue),
             followPath      = walkPath(visitNodeKey2, followReference, visitLeafKey);
    
    node = followPath(
        path, depth, height,
        nodeRoot, nodeParent, node, nodeType,
        nodeValue, nodeSize, nodeTimestamp, nodeExpires
    )
    
    return { path: optimizedPath, value: node };
}
