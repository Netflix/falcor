var version = require("./inc-version");
module.exports = function(model, values) {
    
    var root = model._cache;
    var node = model._cache;
    var type = node && node.$type || undefined;
    var value = type == "sentinel" ? node.value : node;
    var refs = [];
    var nodes = [];
    var errors = [];
    var requestedPath = [];
    var optimizedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var requestedMissingPaths = [];
    var optimizedMissingPaths = [];
    
    refs[-1] = model._path;
    nodes[-2] = root;
    nodes[-1] = node;
    
    return {
        
        root: root,
        node: node,
        type: type,
        value: value,
        
        lru: model._root,
        boxed: model._boxed,
        expired: model._root.expired,
        materialized: model._materialized,
        errorsAsValues: model._errorsAsValues,
        
        version: version(),
        
        refs: refs,
        nodes: nodes,
        errors: errors,
        shorted: false,
        linkIndex: 0,
        linkHeight: 0,
        requestedPath: requestedPath,
        optimizedPath: optimizedPath,
        requestedPaths: requestedPaths,
        optimizedPaths: optimizedPaths,
        requestedMissingPaths: requestedMissingPaths,
        optimizedMissingPaths: optimizedMissingPaths,
        values: typeof values === "object" && values || undefined,
        onNext: typeof values === "function" && values || undefined
    };
}