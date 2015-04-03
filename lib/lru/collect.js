var update_graph = require("../support/update-graph");
module.exports = function(lru, expired, version, total, max, ratio) {
    
    var targetSize = max * ratio;
    var node, size;
    
    while(!!(node = expired.pop())) {
        size = node.$size || 0;
        total -= size;
        update_graph(node, size, version, lru);
    }
    
    if(total >= max) {
        var tail = lru.__tail;
        while((total >= targetSize) && !!(node = tail)) {
            tail = tail.__prev;
            size = node.$size || 0;
            total -= size;
            update_graph(node, size, version, lru);
        }
        
        if((lru.__tail = lru.__prev = tail) == null) {
            lru.__head = lru.__next = undefined;
        } else {
            tail.__next = undefined;
        }
    }
};