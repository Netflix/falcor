var hydrateKeys = require('./hydrateKeys');
var fromKeySet = require('./fromKeySet');
var permuteKey = require('./permuteKey');

module.exports = function(onNode, onEdge, options, pathset) {
    
    var depth = 0;
    var height = pathset.length;
    var outerKey, isKeySet, innerKey;
    
    while(depth > -1) {
        
        options.shorted = false;
        options = hydrateKeys(options, depth);
        
        walk: do {
            
            outerKey = pathset[depth];
            isKeySet = outerKey != null && typeof outerKey === "object";
            innerKey = fromKeySet(outerKey, isKeySet);
            
            if(depth < height) {
                if(onNode(options, pathset, depth, innerKey, isKeySet) !== false) {
                    if(depth < height - 1) {
                        depth += 1;
                        continue walk;
                    }
                }
            }
            
            onEdge(options, pathset, depth, innerKey, isKeySet);
            
            break walk;
        } while(true);
        
        while(depth > -1 && permuteKey(pathset[depth])) {
            depth -= 1;
        }
    }
    
    return options;
}