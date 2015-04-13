var jsong = require("../../index");
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

var prefix = require("../../lib/types/internal-prefix");
var __head = prefix + "head";
var __tail = prefix + "tail";
var __next = prefix + "next";
var __prev = prefix + "prev";

describe('Expired', function() {
    describe('Input Paths', function() {
        describe('AsJSONG', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expired'], 'toJSONG').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsPathValues', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expired'], 'toPathValues').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsJSON', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expired'], 'toJSON').
                    subscribe(noOp, done, done);
            });
        });
        describe('Selector', function() {
            it('should splice expired item.', function(done) {
                spliceExpired(['expired'], 'selector').
                    subscribe(noOp, done, done);
            });
        });
    });
    describe('Input PathMaps', function() {
        describe('AsJSONG', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({expired: null}, 'toJSONG').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsPathValues', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({expired: null}, 'toPathValues').
                    subscribe(noOp, done, done);
            });
        });
        describe('AsJSON', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({expired: null}, 'toJSON').
                    subscribe(noOp, done, done);
            });
        });
        describe('Selector', function() {
            it('should splice expired item.', function(done) {
                spliceExpired({expired: null}, 'selector').
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
                "$type": "sentinel",
                "value": 'sad panda'
            }
        }
    }});

    expect(model._root[__head].value).to.equal('sad panda');

    return Rx.Observable.
        return('').
        delay(100).
        flatMap(function() {
            return testRunner.get(model, _.cloneDeep(query), output);
        }).
        do(function() {
        }, function() {}, function() {
            expect(model._root[__head]).to.be.not.ok;
            expect(model._root[__tail]).to.be.not.ok;
        });
}
