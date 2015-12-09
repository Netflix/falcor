module.exports = function(done) {
    return function(x) {
        done(new Error('should not onNext ' + x));
    };
};
