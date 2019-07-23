module.exports = function zipSpy(maxCount, cb, maxTime) {
    let isTimedOut = false;
    let callCount = 0;

    if (maxTime) {
        setTimeout(() => {
            if (callCount !== maxCount) {
                isTimedOut = true;
                cb(callCount);
            }
        }, maxTime);
    }

    return jest.fn(() => {
        if (isTimedOut) {
            return;
        }

        callCount++;
        if (callCount === maxCount) {
            cb(callCount);
        }
    });
};
