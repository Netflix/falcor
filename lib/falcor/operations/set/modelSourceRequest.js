var getSourceObserver = require('./../support/getSourceObserever');
var combineOperations = require('./../support/combineOperations');
var setSeedsOrOnNext = require('./../support/setSeedsOrOnNext');

module.exports = modelSourceRequest;

function modelSourceRequest(model, args, seeds, format, selector, onNext) {
    return function innerModelSourceRequest(relativeSeeds, combinedResults, cb) {
        // gather all the paths and jsongs into one.
        var jsong = relativeSeeds[0].jsong;
        var paths = relativeSeeds[0].paths;
        var seedRequired = seeds && seeds.length > 0;
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

