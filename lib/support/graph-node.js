var __parent = require("../internal/parent");
var __key = require("../internal/key");
var __generation = require("../internal/generation");

module.exports = function(root, parent, node, key, generation) {
    node[__parent] = parent;
    node[__key] = key;
    node[__generation] = generation;
    return node;
}