module.exports = function insertNode(node, parent, key, version, optimizedPath) {
    node.ツkey = key;
    node.ツparent = parent;

    if (version !== undefined) {
        node.ツversion = version;
    }
    if (!node.ツabsolutePath) {
        node.ツabsolutePath = optimizedPath.slice(0, optimizedPath.index).concat(key);
    }

    parent[key] = node;

    return node;
};
