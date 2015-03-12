var jsong = require("../bin/Falcor");
var Model = jsong.Model;
var chai = require("chai");
var expect = chai.expect;
var _ = require("lodash");
var noOp = function() {};
var Cache = require("./data/Cache");
var cache = Cache();
var testRunner = require("./testRunner");

function getModel(newModel, cache) {
    return newModel ? testRunner.getModel(null, cache) : model;
}

function followReference(cache, path) {
    path.forEach(function(v) {
        cache = cache && cache[v] && (cache[v].$type === "sentinel" ? cache[v].value : cache[v]);
    });
    return cache;
}

function removeLeafs(root) {
    Object.keys(root).forEach(function(k) {
        var node = root[k];
        if (typeof node === "object" && !Array.isArray(node)) {
            removeLeafs(node);
        } else {
            root[k] = {};
        }
    });
    return root;
}

// Do you even mini-falcor?
function fillInReferences(model, pathTo, prefix) {
    var followed = [];
    var c = cache;
    var value;
    var modelC = model._cache;
    prefix = prefix || [];

    // Rage the references.
    modelC = followReference(modelC, prefix);
    c = followReference(c, prefix);
    while (Array.isArray(c)) {
        modelC = followReference(model._cache, c);
        c = followReference(cache, c);
    }

    // TODO: Should i do the -1?  I don"t think i should set the last value.
    for (var i = 0; i < pathTo.length - 1; i++) {
        // no complex keys yet.
        var k = pathTo[i];
        value = c[k];
        c = c[k] && (c[k].$type === "sentinel" ? c[k].value : c[k]);
        modelC = modelC && modelC[k] || undefined;

        // TODO: Does this work with intentional missing items from c (lists, missing-list)
        if (c) {
            followed.push(k);

            // reference to follow.
            if (Array.isArray(c)) {

                // fills in reference if dne
                // Also considers
                !modelC && model._setPathSetsAsValues(model, [{path: prefix.concat(followed), value: value}]);
                fillInReferences(model, pathTo.slice(i + 1), c);
                return;
            }
        }
    }

    // Finally put in the final object into the cache so that we can set it while following references.
    // since a reference that points to an empty spot in the cache will be considered a "miss"
    // If something is there then it will put nothing there.
    (followReference(cache, prefix.concat(followed)) === undefined) && model._setPathSetsAsValues(model, [{path: prefix.concat(followed), value: {$type: "sentinel", value: null}}]);
}

function setTestRunner(data, options) {
    it("perform _set*", function() {
        var model;
        options = _.extend({
            fillReferences: true
        }, options);
        var testRunnerResults = testRunner.transformData(data);
        var prefixesAndSuffixes = testRunnerResults.prefixesAndSuffixes;
        var universalExpectedValues = testRunnerResults.universalExpectedValues;
        var expected, expectedValues, actual;
        var preCallFn = options.preCall || noOp;
        var clearModel = options.clearModel === undefined && true || options.clearModel;
        var modelCache = options.modelCache || {};
        var thisModel = options.oneModel;
        var count;
        prefixesAndSuffixes[0].
            filter(function (prefix) {
                return ~prefix.indexOf("set");
            }).
            map(function (prefix) {
                prefixesAndSuffixes[1].map(function (suffix) {
                    var query = data[prefix].query;
                    var op = "_" + prefix + suffix;
                    model = thisModel || getModel(clearModel, _.cloneDeep(modelCache));

                    count = getCountArray(data[prefix]);

                    // Primes the cache with the appropriate references.
                    // Note: JSONG should have all the required references
                    if (prefix !== 'setJSONGs') {
                        query.forEach(function(q) {
                            var paths = q.path || q.paths || jsong.__Internals.buildQueries(removeLeafs(_.cloneDeep(q)));
                            options.fillReferences && fillInReferences(model, paths);
                            if (options.hardLink) {
                                model._getPathSetsAsValues(model, [paths]);
                            }
                        });
                    }
                    expectedValues = data[suffix];
                    expected = _.assign({}, expectedValues, universalExpectedValues);

                    // For doing any preprocessing.
                    preCallFn(model, op, _.cloneDeep(query), count);

                    actual = model[op](model, _.cloneDeep(query), count);

                    // validates that the results from the operation and the expected values are valid.
                    testRunner.validateData(expected, actual);

                    // validates against the expected vs actual
                    testRunner.validateOperation(op, expected, actual);
                    
                    // reperform the get request with the getPaths* if available.
                    query = data['getPaths'];
                    if (query) {
                        var suffixMessage = 'Confirming that ' + op + ' has correctly taken place.';
                        op = "_getPathSets" + suffix;
                        count = getCountArray(data[prefix]);
                        actual = model[op](model, _.cloneDeep(query), count, model._errorSelector);

                        testRunner.validateData(expected, actual);
                        testRunner.validateOperation(op, expected, actual, suffixMessage);
                    }
                });
            });
        });
    }

    function getCountArray(data) {
    var count = data.count === undefined ? 1 : 0;
    return Array(count).join(",").split(",").map(function() { return {}; });
}

module.exports = setTestRunner;
