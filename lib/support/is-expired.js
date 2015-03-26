var $expires_now = 0;
var $expires_never = 1;
var now = require("./now");
var splice = require("../lru/splice");
var is_object = require("./is-object");

module.exports = function(roots, node) {
    
    var expires = node.$expires;
    if((expires != null                            ) && (
        expires != $expires_never                  ) && (
        expires == $expires_now || expires < now()))    {
        if(!node.__invalidated) {
            node.__invalidated = true;
            roots.expired.push(node);
            splice(roots.lru, node);
            return true;
        }
    }
    
    return false;
}