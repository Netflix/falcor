module.exports = function isAssertionError(e) {
    return e.hasOwnProperty('actual') && e.hasOwnProperty('expected');
};
