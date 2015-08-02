var $expiresNow = require("./../values/expires-now");
var $expiresNever = require("./../values/expires-never");
var __invalidated = require("./../internal/invalidated");
var now = require("./../support/now");
var splice = require("./../lru/splice");

module.exports = function isExpired(roots, node) {
    var expires = node.$expires;
    if ((expires != null) && (
        expires !== $expiresNever) && (
        expires === $expiresNow || expires < now())) {
        if (!node[__invalidated]) {
            node[__invalidated] = true;
            roots.expired.push(node);
            splice(roots.lru, node);
        }
        return true;
    }
    return false;
};
