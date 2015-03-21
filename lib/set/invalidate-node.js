module.exports = invalidate;

var removeNode = require("./remove-node");

function invalidate(lru, parent, node, key) {
    
    var type  = node && node.$type || undefined;
    var value = !!type ? node.value : node;
    
    removeNode(lru, parent, node, key);
    
    if(!type && node != null && typeof node == "object") {
        for(var key in node) {
            if((key[0] != "_" || key[1] != "_") && (key !== "/" && key !== "./" && key !== "../")) {
                invalidate(node, node[key], key);
            }
        }
    }
    
    return node;
}