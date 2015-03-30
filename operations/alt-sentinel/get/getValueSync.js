var followReference = require('./followReference');
var clone = require('./../util/clone');
var isExpired = require('./../util/isExpired');
var promote = require('./../util/lru').promote;

module.exports = function getValueSync(model, simplePath) {
    var root = model._cache;
    var len = simplePath.length;
    var optimizedPath = [];
    var shorted = false, shouldShort = false;
    var depth = 0;
    var key, next, type, curr = root, out, ref, refNode;
    do {
        
        key = simplePath[depth++];
        if (key !== null) {
            next = curr[key];
        }

        if (!next) {
            out = undefined;
            break;
        }
        
        type = next.$type;
        optimizedPath.push(key);

        // Up to the last key we follow references
        if (depth < len) {
            if (type === 'path') {
                ref = followReference(model, root, root, next, next.value);
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
                
                // Unfortunately, if all that follows are nulls, then we have not shorted.
                for (;depth < len; ++depth) {
                    if (simplePath[depth] !== null) {
                        shouldShort = true;
                        break;
                    } 
                }
                
                // if we should short or report value.  Values are reported on nulls.
                if (shouldShort) {
                    shorted = true;
                    out = undefined;
                } else {
                    out = next;
                }
                break;
            }
        } 
        
        // If there is a value, then we have great success, else, report an undefined.
        else {
            out = next;
        }
        curr = next;

    } while (next && depth < len);
    
    // promotes if not expired
    if (out) {
        if (isExpired(out)) {
            out = undefined;
        } else {
            promote(model, out);
        }
    }

    if (out && out.$type === 'error' && !model._treatErrorsAsValues) {
        throw {path: simplePath, value: out.value};
    } else if (out && model._boxed) {
        out = clone(out);
    } else if (!out && model._materialized) {
        out = {$type: 'sentinel'};
    } else if (out) {
        out = out.value;
    }
    
    return {
        value: out,
        shorted: shorted,
        optimizedPath: optimizedPath
    };
};