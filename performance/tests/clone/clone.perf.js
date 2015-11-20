var Model = require("./../../../lib").Model;
var model = new Model();

module.exports = function cloneTest(out, count) {
    count = count || 5;
    out = out || {};

    for (var i = 0; i < count; ++i) {
        out['clone.test' + i] = clone;
    }

    return out;
};

clone();

function clone() {
    return model._clone({
        _path: ['to', 'here']
    });
}
