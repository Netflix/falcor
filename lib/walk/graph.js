module.exports = walk_graph;

function walk_graph(node, onNode) {
    
    onNode(node);
    
    if(node["../"] != null) {
        walk_graph(node["../"], onNode);
    }
    
    var i = -1;
    var refsLen = node["__refs_length"] || 0;
    
    while(++i < refsLen) {
        walk_graph(node["__ref" + i], onNode);
    }
    
    return node;
}