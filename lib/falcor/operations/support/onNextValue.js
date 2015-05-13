/**
 * will onNext the observer with the seeds provided.
 * @param {Model} model
 * @param {Function} onNext
 * @param {Array.<Object>} seeds
 * @param {Function} [selector]
 */
module.exports = function onNextValues(model, onNext, seeds, selector) {
    var root = model._root;

    root.allowSync++;
    try {
        if (selector) {
            if (seeds.length) {
                // they should be wrapped in json items
                onNext(selector.apply(model, seeds.map(function(x, i) {
                    return x.json;
                })));
            } else {
                onNext(selector.call(model));
            }
        } else {
            // this means there is an onNext function that is not AsValues or progressive,
            // therefore there must only be one onNext call, which should only be the 0
            // index of the values of the array
            onNext(seeds[0]);
        }
    } finally {
        root.allowSync--;
    }
};
