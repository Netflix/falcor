var $expires_now = require("falcor/values/expires-now");
var $expires_never = require("falcor/values/expires-never");
var __invalidated = require("falcor/internal/invalidated");
var now = require("falcor/support/now");
var splice = require("falcor/lru/splice");

module.exports = function isExpired(roots, node) {
    var expires = node.$expires;
    if((expires != null                            ) && (
        expires != $expires_never                  ) && (
        expires == $expires_now || expires < now()))    {
        if(!node[__invalidated]) {
            node[__invalidated] = true;
            roots.expired.push(node);
            splice(roots.lru, node);
        }
        return true;
    }
    return false;
}
