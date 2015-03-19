module.exports = function(root, parent, node, key, generation) {
    if(node["./"] == null) {
        node["/"] = root;
        node["./"] = node;
        node["../"] = parent;
        node["__key"] = key;
        node["__generation"] = generation;
    }
    return node;
}