
var $root = "/";
var $self = "./";
var $parent = "../";
var $key = "__key";
var $generation = "__generation";

module.exports = function(root, parent, node, key, generation) {
    node[$root] = root;
    node[$self] = node;
    node[$parent] = parent;
    node[$key] = key;
    node[$generation] = generation;
    return node;
}