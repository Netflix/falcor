var isArray = Array.isArray;
var walk = require('walk/link');
var linkOpts = { linkIndex: 0, linkHeight: 0 };

module.exports = function(onNode) {
    return function(opts, set, depth, key, isKeySet) {
        
        var type  = opts.type;
        var value = opts.value;
        
        if(!opts.shorted && (!type || type == "sentinel") && isArray(value)) {
            
            var json;
            var jsonRoot = opts.jsonRoot;
            
            var root = opts.root;
            var node = opts.node;
            var refs = opts.refs;
            var nodes = opts.nodes;
            var jsons = opts.jsons;
            var optimizedPath = opts.optimizedPath;
            
            opts.linkIndex = depth;
            linkOpts.optimizedPath = optimizedPath;
            
            do {
                var link       = value;
                var linkDepth  = 0;
                var linkHeight = link.length;
                var container  = node;
                var location   = container.__context;
                
                refs[depth] = link;
                opts.linkHeight = linkHeight;
                
                node = root;
                type  = node && node.$type || undefined;
                value = type == "sentinel" ? node.value : node;
                
                linkOpts.json  = jsonRoot;
                linkOpts.node  = node;
                linkOpts.type  = type;
                linkOpts.value = value;
                
                linkOpts = walk(onNode, linkOpts, link);
                
                node = linkOpts.node;
                json = linkOpts.json;
                
                if(linkOpts.shorted) {
                    opts.shorted = true;
                    break;
                }
                
                if(node != null && typeof node == "object") {
                    var backRefs = node.__refs_length || 0;
                    node["__ref" + backRefs] = container;
                    node.__refs_length = backRefs + 1;
                    container.__ref_index = backRefs;
                    container.__context = node;
                }
                
                type  = node && node.$type || undefined;
                value = type == "sentinel" ? node.value : node;
                
            } while((!type || type == "sentinel") && isArray(value));
            
            if(nodes) { nodes[depth - 1] = node; }
            if(jsons) { jsons[depth - 1] = json; }
            
            opts.json  = json;
            opts.node  = node;
            opts.type  = type;
            opts.value = value;
            
            delete linkOpts.opts;
            delete linkOpts.optimizedPath;
            delete linkOpts.node;
            delete linkOpts.type;
            delete linkOpts.value;
            delete linkOpts.node;
            delete linkOpts.shorted;
            
            return !opts.shorted;
        }
        
        return true;
    }
}