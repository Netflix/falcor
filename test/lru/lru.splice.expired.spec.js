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

describe('Expired', function() {
    describe('Input Paths', function() {
        describe('AsJSONG', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expireSoon', 'summary'], 'toJSONG').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsPathValues', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expireSoon', 'summary'], 'toPathValues').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsJSON', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expireSoon', 'summary'], 'toJSON').
                    subscribe(noOp, done, done);
            });
        });
        describe('preload', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expireSoon', 'summary'], 'preload').
                    subscribe(noOp, done, done);
            });
        });
    });
    describe('Input PathMaps', function() {
        describe('AsJSONG', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({ json: { expireSoon: { summary: null } } }, 'toJSONG').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsPathValues', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({ json: { expireSoon: { summary: null } } }, 'toPathValues').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsJSON', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({ json: { expireSoon: { summary: null } } }, 'toJSON').
                    subscribe(noOp, done, done);
            });
        });
        describe('preload', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({ json: { expireSoon: { summary: null } } }, 'preload').
                    subscribe(noOp, done, done);
            });
        });
    });
});


function spliceExpired(query, output) {
    var model = new Model({cache: {
        "expireSoon": {
            "$size": 51,
            "summary": {
                "$size": 51,
                "$expires": Date.now() + 50,
                "$type": "atom",
                "value": 'sad panda'
            }
        }
    }});

    expect(model._root[__head].value).to.equal('sad panda');

    return Rx.Observable.timer(100).
        flatMap(function() {
            return testRunner.get(model, _.cloneDeep(query), output);
        }).
        do(function() {
        }, function() {}, function() {
            expect(model._root[__head]).to.be.not.ok;
            expect(model._root[__tail]).to.be.not.ok;
        });
}
