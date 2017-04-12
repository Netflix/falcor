module.exports = function insertNode(node, parent, key, version, optimizedPath) {
    node.$_key = key;
    node.$_parent = parent;

    if (version !== undefined) {
        node.$_version = version;
    }
    if (!node.$_absolutePath) {
        node.$_absolutePath = optimizedPath.slice(0, optimizedPath.index).concat(key);
    }

    parent[key] = node;

    return node;
};
