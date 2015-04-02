var setSeedsOnGroups = require('./setSeedsOnGroups');
module.exports = function setSeedsOrOnNext(operations, seedRequired, seeds, onNext, selector) {
    if (seedRequired) {
        setSeedsOnGroups(operations, seeds, selector);
    } else {
        for (i = 0; i < operations.length; i++) {
            operations[i].onNext = onNext;
        }
    }
};
