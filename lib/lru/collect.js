var update_graph = require("../support/update-graph");
module.exports = function(lru, expired, version, total, max, ratio) {
    
    var targetSize = max * ratio;
    var context, size;
    
    while(!!(context = expired.pop())) {
        size = context.$size || 0;
        total -= size;
        update_graph(context, size, version, lru);
    }
    
    if(total >= max) {
        var tail = lru.__tail;
        while((total >= targetSize) && !!(context = tail)) {
            tail = tail.__prev;
            size = context.$size || 0;
            total -= size;
            update_graph(context, size, version, lru);
        }
        
        if((lru.__tail = lru.__prev = tail) == null) {
            lru.__head = lru.__next = undefined;
        } else {
            tail.__next = undefined;
        }
    }
};