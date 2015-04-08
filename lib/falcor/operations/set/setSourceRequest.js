var getSourceObserver = require('./../support/getSourceObserever');
var combineOperations = require('./../support/combineOperations');
var setSeedsOrOnNext = require('./../support/setSeedsOrOnNext');

module.exports = setSourceRequest;

function setSourceRequest(
        options, onNext, seeds, relativeSeeds, combinedResults, cb) {

    // gather all the paths and jsongs into one.
    var jsong = relativeSeeds[0].jsong;
    var paths = relativeSeeds[0].paths;
    var seedRequired = seeds && seeds.length > 0;
    var model = options.operationModel;

    for (i = 1; i < relativeSeeds.length; i++) {
        paths = paths.concat(relativeSeeds[i].paths);
    }

    var jsongEnv = {jsong: jsong, paths: paths};
    return model._request.set(
        jsongEnv,
        getSourceObserver(
            model,
            jsongEnv.paths,
            function setSourceRequestCB(err, results) {
                if (err) {
                    cb(err);
                }

                // Sets the results into the model.
                model._setJSONGsAsJSON(model, [results], []);

                // Gets the original paths / maps back out.
                var operations = combineOperations(
                        options.operationArgs, options.format, 'get');
                setSeedsOrOnNext(
                    operations, seedRequired,
                    seeds, onNext, options.operationSelector);
                cb(null, [operations, seeds, false, {removeBoundPath: false}]);
            }));
}

