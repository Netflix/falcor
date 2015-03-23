var followReference = require('./followReference');
module.exports = function getValueSync(model, simplePath) {
    var root = model._cache;
    var len = simplePath.length;
    var optimizedPath = [];
    var shorted = false;
    var depth = 0;
    var key, next, type, curr = root, out, ref, refNode;
    do {
        
        key = simplePath[depth++];
        next = curr[key];
        
        if (!next) {
            out = undefined;
            break;
        }
        
        type = next.$type;
        optimizedPath.push(key);

        // Up to the last key we follow references
        if (depth < len) {
            if (type === 'reference') {
                ref = followReference();
                refNode = ref[0];

                if (!refNode) {
                    out = undefined;
                    break;
                }
                
                type = refNode.$type;
                next = refNode;
                optimizedPath = ref[1];
            } 
            
            if (type) {
                shorted = true;
                out = next;
                break;
            }
        } 
        
        // If there is a value, then we have great success, else, report an undefined.
        else {
            if (type) {
                out = next.value;
            } else {
                out = undefined;
            }
        }
        curr = next;

    } while (next && depth < len);
    
    return {
        value: out,
        shorted: shorted,
        optimizedPath: optimizedPath
    };
};