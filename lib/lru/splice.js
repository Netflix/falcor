var __head = require("./../internal/head");
var __tail = require("./../internal/tail");
var __next = require("./../internal/next");
var __prev = require("./../internal/prev");

module.exports = function lruSplice(root, node) {

    var head = root[__head],
        tail = root[__tail],
        next = node[__next],
        prev = node[__prev];

    if (next != null && typeof next === "object") {
        next[__prev] = prev;
    }

    if (prev != null && typeof prev === "object") {
        prev[__next] = next;
    }

    if (node === head) {
        root[__head] = root[__next] = next;
    }

    if (node === tail) {
        root[__tail] = root[__prev] = prev;
    }

    node[__next] = node[__prev] = void 0;
    head = tail = next = prev = void 0;
};
