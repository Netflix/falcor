module.exports = function(opts, depth) {
    
    var requestedPath = opts.requestedPath;
    var optimizedPath = opts.optimizedPath;
    var ref = linkIndex = linkHeight = depth;
    var refs = opts.refs;
    
    refs.length = depth + 1;
    
    while(linkIndex >= -1) {
        if(!!(ref = refs[linkIndex])) {
            ~linkIndex || ++linkIndex;
            linkHeight = ref.length;
            var i = 0, j = 0;
            while(i < linkHeight) {
                optimizedPath[j++] = ref[i++];
            }
            i = linkIndex;
            while(i < depth) {
                optimizedPath[j++] = requestedPath[i++];
            }
            requestedPath.length = i;
            optimizedPath.length = j;
            break;
        }
        --linkIndex;
    }
    
    var nodes = opts.nodes;
    if(nodes) {
        var node  = nodes[depth - 1];
        var type  = node && node.$type || undefined;
        var value = type == "sentinel" ? node.value : value;
        opts.node  = node;
        opts.type  = type;
        opts.value = value;
    }
    
    var jsons = opts.jsons;
    if(jsons) { opts.json = jsons[depth - 1]; }
    
    var messages = opts.messages;
    if(messages) { opts.message = messages[depth - 1]; }
    
    opts.linkIndex = linkIndex;
    opts.linkHeight = linkHeight;
    
    return opts;
}