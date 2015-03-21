var walk = require("../walk/link");
var linkOpts = { linkIndex: 0, linkHeight: 0 };

module.exports = function(onNode) {
    return function(opts, set, depth, key, isKeySet) {
        
        var type  = opts.type;
        
        if(!opts.shorted && type == "reference") {
            
            var root = opts.root;
            var node = opts.node;
            var refs = opts.refs;
            var nodes = opts.nodes;
            var requestedPath = opts.requestedPath;
            var optimizedPath = opts.optimizedPath;
            
            opts.linkIndex = depth;
            linkOpts.optimizedPath = optimizedPath;
            
            do {
                var link       = node.value;
                var linkDepth  = 0;
                var linkHeight = link.length;
                var container  = node;
                var location   = container.__context;
                
                refs[depth] = link;
                opts.linkHeight = linkHeight;
                
                if(location != null) {
                    node = location;
                    type = node.$type || undefined;
                    while(linkDepth < linkHeight) {
                        optimizedPath[linkDepth] = link[linkDepth++];
                    }
                    optimizedPath.length = linkHeight;
                } else {
                    linkOpts.node = node = root;
                    linkOpts.type = type = node && node.$type || undefined;
                    linkOpts = walk(onNode, linkOpts, link);
                    node = linkOpts.node;
                    type = node && node.$type || undefined;
                    if(linkOpts.shorted || (!!type && type != "reference")) {
                        opts.linkHeight = linkOpts.depth;
                        opts.shorted = true;
                        requestedPath[depth] = null;
                        break;
                    }
                    if(node != null && typeof node == "object") {
                        var backRefs = node.__refs_length || 0;
                        node["__ref" + backRefs] = container;
                        node.__refs_length = backRefs + 1;
                        container.__ref_index = backRefs;
                        container.__context = node;
                    }
                }
                
                if(nodes) { nodes[depth - 1] = node; }
            } while(type == "reference");
            
            opts.node  = node;
            opts.type  = type;
            
            delete linkOpts.depth;
            delete linkOpts.optimizedPath;
            delete linkOpts.node;
            delete linkOpts.type;
            delete linkOpts.shorted;
            
            return !opts.shorted;
        }
        
        return true;
    }
}