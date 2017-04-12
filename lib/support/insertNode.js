module.exports = function insertNode(node, parent, key, version, optimizedPath) {
    node.$key = key;
    node.$parent = parent;

    if (version !== undefined) {
        node.$version = version;
    }
    if (!node.$absolutePath) {
        node.$absolutePath = optimizedPath.slice(0, optimizedPath.index).concat(key);
    }

    parent[key] = node;

    return node;
};
