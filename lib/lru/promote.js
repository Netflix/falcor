var $expiresNever = require("./../values/expires-never");
var __head = require("./../internal/head");
var __tail = require("./../internal/tail");
var __next = require("./../internal/next");
var __prev = require("./../internal/prev");

var isObject = require("./../support/isObject");

module.exports = function lruPromote(root, node) {

    if (isObject(node) && (node.$expires !== $expiresNever)) {

        var head = root[__head],
            tail = root[__tail],
            next = node[__next],
            prev = node[__prev];

        if (node !== head) {

            if (next != null && typeof next === "object") {
                next[__prev] = prev;
            }

            if (prev != null && typeof prev === "object") {
                prev[__next] = next;
            }

            next = head;

            if (head != null && typeof head === "object") {
                head[__prev] = node;
            }

            root[__head] = root[__next] = head = node;
            head[__next] = next;
            head[__prev] = void 0;
        }

        if (tail == null || node === tail) {
            root[__tail] = root[__prev] = tail = prev || node;
        }
    }
    return node;
};
