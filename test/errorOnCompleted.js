module.exports = function(done) {
    return function() {
        done(new Error('should not onCompleted'));
    };
};
