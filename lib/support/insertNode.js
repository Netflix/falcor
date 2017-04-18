module.exports = function insertNode(node, parent, key, version, optimizedPath) {
    // eslint-disable-next-line camelcase
    node.$_key = key;
    // eslint-disable-next-line camelcase
    node.$_parent = parent;

    if (version !== undefined) {
        // eslint-disable-next-line camelcase
        node.$_version = version;
    }
    // eslint-disable-next-line camelcase
    if (!node.$_absolutePath) {
        // eslint-disable-next-line camelcase
        node.$_absolutePath = optimizedPath.slice(0, optimizedPath.index).concat(key);
    }

    parent[key] = node;

    return node;
};
