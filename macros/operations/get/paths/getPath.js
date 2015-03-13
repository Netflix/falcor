function getPath(model, path) {
    
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
    
    NodeMixin(root, expired, errorSelector, node)
    NodeMixin(root, expired, errorSelector, nodeValue)
    
    curried  addOptPathKey   = addKeyAtLinkDepth(optimizedPath, linkIndex, linkHeight),
             addOptLinkKey   = addKeyAtDepth(optimizedPath),
             addReqLeafKey   = addNullLeafKey(optimizedPath),
             setupHardLink   = addHardLink(linkPath),
             visitRefNodeKey = visitNode(addOptLinkKey);
    
    sequence visitRefEdge    = [addReqLeafKey, setupHardLink];
    
    curried  walkReference   = walkLink(visitRefNodeKey, visitRefEdge),
             followReference = followHardLink(
                 walkReference, noop, optimizedPath,
                 linkPath, linkIndex, linkDepth, linkHeight
             ),
             visitNodeKey    = visitNode(addOptPathKey),
             followPath      = walkPath(visitNodeKey, followReference, noop);
    
    node = followPath(
        path, depth, height,
        nodeRoot, nodeParent, node,
        nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires
    )
    
    return { path: optimizedPath, value: node };
}
