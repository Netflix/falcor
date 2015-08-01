module.exports = walkReference;

var __ref = require("./../internal/ref");
var __context = require("./../internal/context");
var __refIndex = require("./../internal/ref-index");
var __refsLength = require("./../internal/refs-length");

var isObject = require("./../support/is-object");
var isPrimitive = require("./../support/is-primitive");

var positions = require("./../support/positions");
var _cache = positions.cache;

function walkReference(onNode, container, reference, roots, parents, nodes, requested, optimized) {

    optimized.length = 0;

    var index = -1;
    var count = reference.length;
    var node, key, keyset;

    while (++index < count) {

        node = nodes[_cache];

        if (node == null) {
            return nodes;
        } else if (isPrimitive(node) || node.$type) {
            onNode(reference, roots, parents, nodes, requested, optimized, true, false, keyset, null, false);
            return nodes;
        }

        do {
            key = reference[index];
            if (key != null) {
                keyset = key;
                optimized.push(key);
                onNode(reference, roots, parents, nodes, requested, optimized, true, index < count - 1, key, null, false);
                break;
            }
        } while (++index < count);
    }

    node = nodes[_cache];

    if (isObject(node) && container[__context] !== node) {
        var backrefs = node[__refsLength] || 0;
        node[__refsLength] = backrefs + 1;
        node[__ref + backrefs] = container;
        container[__context] = node;
        container[__refIndex] = backrefs;
    }

    return nodes;
}
