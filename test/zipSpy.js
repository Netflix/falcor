module.exports = function zipSpy(count, cb, maxTime) {
    var done = false;
    if (maxTime) {
        setTimeout(function() {
            if (count !== 0) {
                done = true;
                cb();
            }
        }, maxTime);
    }

    return jest.fn(function() {
        if (done) {
            return;
        }

        --count;
        if (count === 0) {
            cb();
        }
    });
};
