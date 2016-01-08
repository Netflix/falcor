var Model = require('./../../../lib').Model;
var promote = require('./../../../lib/lru/promote');
var objs = [];
var root = {};

for (var i = 0; i < 10; i++) {
    objs[i] = Model.atom(1);
    promote(root, objs[i]);
}

function p() {
    objs.forEach(function(x) {
        promote(root, x);
    });
}
module.exports = function lru(out, count) {
    count = count || 5;
    out = out || {};

    for (var i = 0; i < count; ++i) {
        out['promote.' + i] = p;
    }

    return out;
};

