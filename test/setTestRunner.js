var falcor = require("./../lib/");
var Model = falcor.Model;
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
        cache = cache && cache[v] && (cache[v].$type === "atom" ? cache[v].value : cache[v]);
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
    var modelC = model._root.cache;
    prefix = prefix || [];

    // Rage the references.
    modelC = followReference(modelC, prefix);
    c = followReference(c, prefix);
    while (Array.isArray(c)) {
        modelC = followReference(model._root.cache, c);
        c = followReference(cache, c);
    }

    // TODO: Should I do the -1?  I don't think i should set the last value.
    for (var i = 0; i < pathTo.length - 1; i++) {
        // no complex keys yet.
        var k = pathTo[i];
        value = c[k];
        c = c[k] && (c[k].$type === "atom" ? c[k].value : c[k]);
        modelC = modelC && modelC[k] || undefined;

        // TODO: Does this work with intentional missing items from c (lists, missing-list)
        if (c) {
            followed.push(k);

            // reference to follow.
            if (Array.isArray(c)) {

                // fills in reference if dne
                // Also considers
                !modelC && model._setPathValuesAsValues(model, [{path: prefix.concat(followed), value: value}]);
                fillInReferences(model, pathTo.slice(i + 1), c);
                return;
            }
        }
    }

    // Finally put in the final object into the cache so that we can set it while following references.
    // since a reference that points to an empty spot in the cache will be considered a "miss"
    // If something is there then it will put nothing there.
    (followReference(cache, prefix.concat(followed)) === undefined) && model._setPathValuesAsValues(model, [{path: prefix.concat(followed), value: {$type: "atom", value: null}}]);
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
        var countOrFunction;
        prefixesAndSuffixes[0].
            filter(function (prefix) {
                return ~prefix.indexOf("setPathValues");
            }).
            map(function (prefix) {
                prefixesAndSuffixes[1].map(function (suffix) {
                    var query = data[prefix].query;
                    var op = "_" + prefix + suffix;
                    model = thisModel || getModel(clearModel, _.cloneDeep(modelCache));

                    // Primes the cache with the appropriate references.
                    // Note: JSONG should have all the required references
                    if (prefix !== 'setJSONGs') {
                        query.forEach(function(q) {
                            var paths = q.path || q.paths || pathmapToPathsets(removeLeafs(_.cloneDeep(q))).sets;
                            options.fillReferences && fillInReferences(model, paths);
                            if (options.hardLink) {
                                model._getPathValuesAsValues(model, [paths]);
                            }
                        });
                    }
                    expectedValues = data[suffix];
                    expected = _.assign({}, expectedValues, universalExpectedValues);

                    countOrFunction = getCountArrayOrFunction(data[prefix], suffix, expected, testRunner);

                    // For doing any preprocessing.
                    preCallFn(model, op, _.cloneDeep(query), countOrFunction);

                    actual = model[op](model, _.cloneDeep(query), countOrFunction);

                    // validates that the results from the operation and the expected values are valid.
                    testRunner.validateData(expected, actual);

                    // validates against the expected vs actual
                    testRunner.validateOperation(op, expected, actual);

                    // reperform the get request with the getPaths* if available.
                    query = data['getPaths'];
                    if (query) {
                        var suffixMessage = 'Confirming that ' + op + ' has correctly taken place.';
                        op = "_getPathValues" + suffix;
                        countOrFunction = getCountArrayOrFunction(data[prefix], suffix, expected, testRunner);
                        actual = model[op](model, _.cloneDeep(query), countOrFunction, model._errorSelector);

                        testRunner.validateData(expected, actual);
                        testRunner.validateOperation(op, expected, actual, suffixMessage);
                    }
                });
            });
    });
}

function getCountArrayOrFunction(data, suffix, expected, testRunner) {
    if (suffix === 'AsValues') {
        var actualCount = 0;
        var vals = expected.values;
        expected.values = undefined;

        return function(pV) {
            if (vals && vals.length) {
                var tested = false;
                var path = pV.path.map(toString);
                for (var i = 0; i < vals.length; i++) {
                    var val = vals[i].path.map(toString);
                    if (_.isEqual(path, val)) {
                        actualCount++;
                        tested = true;
                        testRunner.compare(vals[i], pV);
                        break;
                    }
                }
                if (!tested) {
                    throw 'The path ' + pV.path + ' does not exist within ' + JSON.stringify(vals.map(function(x) { return x.path; }), null, 4);
                }
            } else {
                throw 'There are no more values to compare against AsValues onNext callback. ' + JSON.stringify(pV);
            }
        };
    }
    var count = data.count === undefined ? 1 : 0;
    return Array(count).join(",").split(",").map(function() { return {}; });
}

/**
 * Builds the set of collapsed
 * queries by traversing the tree
 * once
 */

/* jshint forin: false */
function pathmapToPathsets(pathmap, pathmapKey) {

    var key;
    var subs = Object.create(null);
    var subKeys = "";
    var pathsets = [];
    var pathsetsLength = 0;

    var subPath, subPathKeys, subPathKeysCount,
        subPathValues, subPathValuesCount, subPathValuesIndex;

    for(key in pathmap) {
        if(key === __count) {
            if(pathmapKey !== void 0) {
                subs[__prefix + pathmapKey] = {
                    key: pathmapKey,
                    keys: empty_array,
                    sets: empty_array
                };
            }
            delete pathmap[key];
        } else if(key[0] === __prefix) {
            continue;
        } else {
            subPath = pathmapToPathsets(pathmap[key], key);
            subPathKeys = subPath.key;
            subPathValues = subs[subPathKeys] || (subs[subPathKeys] = {
                key: subPathKeys,
                keys: [],
                sets: subPath.sets
            });
            subPathValues.key = key + ", " + subPathValues.key;
            subPathValues.keys.push(isNumber(key) ? parseInt(key, 10) : key);
        }
    }

    var pathset, pathsetCount, pathsetIndex,
        pathsetClone, firstSubPathsKey;

    for(key in subs) {

        subPath = subs[key];
        subPathKeys = subPath.keys;
        subPathKeysCount = subPathKeys.length;

        if(subPathKeysCount > 0) {

            subKeys += (subKeys ? ", " : "") + "[" + subPath.key + "]";
            subPathValues = subPath.sets;
            subPathValuesIndex = -1;
            subPathValuesCount = subPathValues.length;
            firstSubPathsKey = subPathKeys[0];

            while(++subPathValuesIndex < subPathValuesCount) {

                pathset = subPathValues[subPathValuesIndex];
                pathsetIndex = -1;
                pathsetCount = pathset.length;
                pathsetClone = new Array(pathsetCount);

                if(subPathKeysCount > 1) {
                    pathsetClone[0] = subPathKeys;
                } else {
                    pathsetClone[0] = firstSubPathsKey;
                }

                while(++pathsetIndex < pathsetCount) {
                    pathsetClone[pathsetIndex + 1] = pathset[pathsetIndex];
                }

                pathsets[pathsetsLength++] = pathsetClone;
            }
        } else {
            subKeys += subKeys ? ", []" : "[]";
            pathsets[pathsetsLength++] = empty_array;
        }
    }

    if(pathsetsLength === 0) {
        pathsets[0] = empty_array;
    }

    return {
        key: subKeys || "[]",
        sets: pathsets
    };
}

module.exports = setTestRunner;
