var falcor = require("./../lib/");
var Model = falcor.Model;
var inspect = require("util").inspect;
var chai = require("chai");
var expect = chai.expect;
var Cache = require("./data/Cache");
var LocalDataSource = require("./data/LocalDataSource");
var _ = require("lodash");
var noOp = function() {};
var Rx = require('rx');
var cleanData = require('./cleanData');
var clean = cleanData.clean;
var strip = cleanData.strip;
var traverseAndConvert = cleanData.traverseAndConvert;
var __key = require("../lib/internal/key");

module.exports = {
    validateData: validateData,
    validateOperation: validateOperation,
    transformData: function(data) {
        var keys = Object.keys(data);
        var prefixesAndSuffixes = keys.reduce(function(acc, curr) {
            if (~curr.indexOf("As")) {
                acc[1].push(curr);
            } else if (~curr.indexOf("get") || ~curr.indexOf("set")) {
                acc[0].push(curr);
            } else {
                // optimizedPaths, missing paths, etc.
                acc[2].push(curr);
            }
            return acc;
        }, [[], [], []]);
        var universalExpectedValues = prefixesAndSuffixes.pop().reduce(function(acc, k) {
            acc[k] = data[k];
            return acc;
        }, {});
        return {
            prefixesAndSuffixes: prefixesAndSuffixes,
            universalExpectedValues: universalExpectedValues
        };
    },
    convertIntegers: traverseAndConvert,
    clean: function(item, strip) {
        strip = strip || [];
        return clean(item, {strip: strip});
    },
    compare: function(expected, actual, messageOrOptions, options) {
        var opts = _.extend({
            strip: []
        }, options);
        if (typeof messageOrOptions === 'object') {
            _.extend(opts, messageOrOptions);
            messageOrOptions = undefined;
        }
        expect(clean(actual, opts), messageOrOptions).to.deep.equals(clean(expected, opts));
    },
    getModel: function(dataSource, cache, errorSelector) {
        dataSource = dataSource || dataSource !== null && new LocalDataSource(Cache(), {errorSelector: errorSelector});
        cache = cache || Cache();
        return new Model({
            source: dataSource,
            cache: cache || {},
            errorSelector: errorSelector
        });
    },
    get: function(model, query, output) {
        var obs;
        if (output === 'preload') {
            obs = model.preload(query);
        }
        else if (output === 'toJSON') {
            obs = model.get(query);
        }

        else {
            obs = model.get(query)._toJSONG();
        }

        return obs;
    },
    set: function(model, query, output) {
        var obs;
        obs = model.set(query);
        if (output === '_toJSONG') {
            obs = obs._toJSONG();
        }

        return obs;
    }
};

function validateData(expected, actual) {
    expect(actual, "actual").to.be.ok;
    expect(expected, "expected").to.be.ok;
    var keys = Object.keys(expected);

    keys.forEach(function(key) {
        if(key == "values" && !actual[key]) {
            return;
        }
        expect(actual[key], "actual." + key).to.be.ok;
    });
}

function validateOperation(name, expected, actual, messageSuffix) {
    expected = _.cloneDeep(expected);

    // Removes all 5 !== "5" errors when it comes to pathValues.
    traverseAndConvert(actual);
    traverseAndConvert(expected);
    strip(expected, __key);
    strip(actual, __key, "pathSetIndex");

    if (expected.values) {
        expect(actual.values, name + ".values " + messageSuffix).
            to.deep.equals(expected.values);
    }
    if (expected.errors) {
        expect(actual.errors, name + ".errors " + messageSuffix).
            to.deep.equals(expected.errors);
    }
    if (expected.optimizedPaths) {
        expect(actual.optimizedPaths, name + ".optimizedPaths " + messageSuffix).
            to.deep.equals(expected.optimizedPaths);
    }
    if (expected.requestedMissingPaths) {
        expect(actual.requestedMissingPaths, name + ".requestedMissingPaths " + messageSuffix).
            to.deep.equals(expected.requestedMissingPaths);
    }
    if (expected.optimizedMissingPaths) {
        expect(actual.optimizedMissingPaths, name + ".optimizedMissingPaths " + messageSuffix).
            to.deep.equals(expected.optimizedMissingPaths);
    }
}

