var getSourceObserver = require('./../support/getSourceObserever');

module.exports = modelSourceRequest;

function modelSourceRequest(model, args, seeds, format, selector) {
    return function innerModelSourceRequest(relativeSeeds, cb) {
        // gather all the paths and jsongs into one.
        var jsong = relativeSeeds[0].jsong;
        var paths = relativeSeeds[0].paths;
        for (i = 1; i < relativeSeeds.length; i++) {
            paths = paths.concat(relativeSeeds[i].paths);
        }

        var jsongEnv = {jsong: jsong, paths: paths};
        return model._request.set(
            jsongEnv,
            getSourceObserver(model, jsongEnv.paths, function(err, results) {
                if (err) {
                    cb(err);
                }
                debugger;

                // Sets the results into the model.
                model._setJSONGsAsJSON(model, [results], []);

                // Gets the original paths / maps back out.
                var operations = combineOperations(args, format, 'get');
                setSeedsOrOnNext(operations, seedRequired, seeds, onNext, selector);
                cb(null, [operations, seeds]);
            }));
    };
}

