var prefix = require("../types/internal-prefix");
var __root = "/";
var __self = "./";
var __parent = "../";
var __key = prefix + "key";
var __generation = prefix + "generation";

module.exports = function(root, parent, node, key, generation) {
    node[__root] = root;
    node[__self] = node;
    node[__parent] = parent;
    node[__key] = key;
    node[__generation] = generation;
    return node;
}