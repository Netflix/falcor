var falcor = require("./../../lib/");
var Model = falcor.Model;
var Rx = require("rx");
var LocalDataSource = require("../data/LocalDataSource");
var Cache = require("../data/Cache");
var ReducedCache = require("../data/ReducedCache");
var Expected = require("../data/expected");
var getTestRunner = require("../getTestRunner");
var testRunner = require("../testRunner");
var Bound = Expected.Bound;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
var getDataModel = testRunner.getModel;
var _ = require('lodash');

var __head = require("./../../lib/internal/head");
var __tail = require("./../../lib/internal/tail");
var __next = require("./../../lib/internal/next");
var __prev = require("./../../lib/internal/prev");

describe('Get', function () {
    describe('getPaths', function () {
        it('should promote the get item to the head _toJSONG.', function (done) {
            testPaths('_toJSONG').
                subscribe(noOp, done, done);
        });
        it('should promote the get item to the head toJSON.', function (done) {
            testPaths('toJSON').
                subscribe(noOp, done, done);
        });
    });
});
describe('Multiple Gets', function () {
    it('should promote the get item to the head toJSON.', function (done) {
        testMultiplePaths('toJSON').
            subscribe(noOp, done, done);
    });
    it('should promote the get item to the head _toJSONG.', function (done) {
        testMultiplePaths('_toJSONG').
            subscribe(noOp, done, done);
    });
});

var cache = {
    1: {
        $type: 'atom',
        value: 'i am 1'
    },
    2: {
        $type: 'atom',
        value: 'i am 2'
    },
    3: {
        $type: 'atom',
        value: 'i am 3'
    }
};
var getPaths1 = ['1'];
var getPaths2 = ['2'];
var getPaths3 = ['3'];
function testPaths(output, model, q) {
    model = model || new Model({cache: _.cloneDeep(cache)});
    q = q || getQueryPath(model);
    return testRunner.
        get(model, q, output).
        do(noOp, noOp, function() {
            expect(model._root[__head].value).to.equal(cache[q[0]].value);
        });
}
function testMultiplePaths(output) {
    var model = new Model({cache: _.cloneDeep(cache)});
    var multipleOrder = ['i am 3', 'i am 2', 'i am 1'];
    return testPaths(output, model, getPaths1).
        concat(testPaths(output, model, getPaths2)).
        concat(testPaths(output, model, getPaths3)).
        do(noOp, noOp, function() {
            var curr = model._root[__head];
            multipleOrder.forEach(function(value) {
                expect(curr.value).to.equal(value);
                curr = curr[__next];
            });
            curr = model._root[__tail];
            multipleOrder.reverse().forEach(function(value) {
                expect(curr.value).to.equal(value);
                curr = curr[__prev];
            });
        });
}

function getQueryPath(model) {
    if (model._root[__head].value === 'i am 1') {
        return _.cloneDeep(getPaths2);
    }
    return _.cloneDeep(getPaths1);
}
