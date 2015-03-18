if (typeof falcor === 'undefined') {
    var falcor = {};
}

falcor.__Internals = {};
falcor.Observable = Rx.Observable;
falcor.EXPIRES_NOW = 0;
falcor.EXPIRES_NEVER = 1;
falcor.now = function now() {
    return Date.now();
};

module.exports = falcor;