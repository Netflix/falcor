if (typeof falcor === 'undefined') {
    var falcor = {};
}

function now() {
    return Date.now();
}

falcor.__Internals = {};
falcor.Observable = Rx.Observable;
falcor.EXPIRES_NOW = 0;
falcor.EXPIRES_NEVER = 1;

module.exports = falcor;