var now = require("./now");
module.exports = function(opts, set, depth, key, isKeySet) {
    var node  = opts.node;
    if(node != null) {
        var expires = node.$expires;
        if((expires != null                 ) && (
            expires != 1                    ) && (
            expires == 0 || expires < now()))    {
            if(node.__invalidated == false) {
                var expired = opts.expired;
                expired[expired.length] = node;
                node.__invalidated = true;
            }
            opts.node = undefined;
            opts.type = undefined;
        }
    }
    return true;
}