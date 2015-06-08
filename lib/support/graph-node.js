var __parent = require("falcor/internal/parent");
var __key = require("falcor/internal/key");
var __generation = require("falcor/internal/generation");

module.exports = function graph_node(root, parent, node, key, generation) {
    node[__parent] = parent;
    node[__key] = key;
    node[__generation] = generation;
    return node;
};