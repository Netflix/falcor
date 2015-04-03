if (typeof falcor === 'undefined') {
    var falcor = {};
}
var Rx = require('./rx.ultralite');

falcor.__Internals = {};
falcor.Observable = Rx.Observable;
falcor.EXPIRES_NOW = 0;
falcor.EXPIRES_NEVER = 1;
falcor.now = function now() {
    return Date.now();
};
falcor.NOOP = function() {};

module.exports = falcor;
