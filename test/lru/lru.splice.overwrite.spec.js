var jsong = require("./../../lib/");
var Model = jsong.Model;
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

describe('Overwrite', function() {
    describe('Input Paths', function() {
        describe('AsJSONG', function() {
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({path: ['expired'], value: 'overwrite'}, 'toJSONG').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsPathValues', function() {
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({path: ['expired'], value: 'overwrite'}, 'toPathValues').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsJSON', function() {
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({path: ['expired'], value: 'overwrite'}, 'toJSON').
                    subscribe(noOp, done, done);
            });
        });
        describe('Selector', function() {
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({path: ['expired'], value: 'overwrite'}, 'selector').
                    subscribe(noOp, done, done);
            });
        });
    });
    describe('Input PathMaps', function() {
        describe('AsJSONG', function() {
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({json: 'overwrite'}, 'toJSONG').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsPathValues', function() {
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({json: 'overwrite'}, 'toPathValues').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsJSON', function() {
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({json: 'overwrite'}, 'toJSON').
                    subscribe(noOp, done, done);
            });
        });
        describe('Selector', function() {
            it('should splice an overwritten item.', function(done) {
                spliceOverwrite({json: 'overwrite'}, 'selector').
                    subscribe(noOp, done, done);
            });
        });
    });
});
function spliceOverwrite(query, output) {
    var model = new Model({cache: {}});
    return model.
        set({ json: 'you are terminated' }).
        flatMap(function() {
            return testRunner.set(model, _.cloneDeep(query), output);
        }).
        do(function() {
            expect(model._root[__head].value).to.equal('overwrite');
            expect(model._root[__head][__next]).to.be.not.ok;
            expect(model._root[__head][__prev]).to.be.not.ok;
            expect(model._root[__tail]).to.be.not.ok;
        });
}

