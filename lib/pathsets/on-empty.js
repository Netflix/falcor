module.exports = function(opts, set, depth, key, isKeySet) {
    
    var boundPath = opts.refs[-1];
    var requestedPath = opts.requestedPath;
    var optimizedPath = opts.optimizedPath;
    var requestedMissingPaths = opts.requestedMissingPaths;
    var optimizedMissingPaths = opts.optimizedMissingPaths;
    
    var i = -1, j = -1, l = 0,
        height = set.length,
        n = boundPath.length,
        k = depth,
        m, x, y, req = [];
    
    while(++i < n) { req[i] = boundPath[i]; }
    while(++j < k) {
        x = requestedPath[j];
        if(typeof (y = set[l++]) === "object") {
            req[i++] = [x];
        } else {
            req[i++] = x;
        }
    }
    
    m = n + l + height - depth;
    
    while(i < m) { req[i++] = set[l++]; }
    
    req.length = i;
    req.pathSetIndex = opts.index;
    requestedMissingPaths[requestedMissingPaths.length] = req;
    
    i = -1;
    n = depth + (opts.linkHeight - opts.linkIndex);
    
    var opt = new Array(n + height - depth);
    
    while(++i < n) { opt[i] = optimizedPath[i]; }
    for(j = depth, n = height; j < n;) {
        if((x = set[j++]) || x != null) {
            opt[i++] = x;
        }
    }
    
    opt.length = i;
    optimizedMissingPaths[optimizedMissingPaths.length] = opt;
    
    return true;
}