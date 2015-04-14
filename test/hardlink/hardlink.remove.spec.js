var jsong = require("../../index");
var Model = jsong.Model;
var expect = require('chai').expect;
var Cache = require("../data/Cache");
var ReducedCache = require("../data/ReducedCache");
var Expected = require("../data/expected");
var LocalDataSource = require("../data/LocalDataSource");
var Rx = require("rx");
var testRunner = require("../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var Bound = Expected.Bound;
var noOp = function() {};
var _ = require('lodash');

var __ref = require("../../lib/internal/ref");
var __context = require("../../lib/internal/context");
var __ref_index = require("../../lib/internal/ref-index");
var __refs_length = require("../../lib/internal/refs-length");

describe('Removing', function() {
    var getPath = ['genreList', 0, 0, 'summary'];
    var setPath = {path: ['genreList', 0], value: 4};
    var setJSON = {genreList: {0: 4}};
    describe('setPaths', function() {
        it('should perform a hard-link with back references toJSONG.', function(done) {
            getTest(getPath, 'toJSONG').
                flatMap(function() {
                    return setTest(setPath, 'toJSONG')
                }).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            getTest(getPath, 'toJSON').
                flatMap(function() {
                    return setTest(setPath, 'toJSON')
                }).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toPathValues.', function(done) {
            getTest(getPath, 'toPathValues').
                flatMap(function() {
                    return setTest(setPath, 'toPathValues')
                }).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references selector.', function(done) {
            getTest(getPath, 'selector').
                flatMap(function() {
                    return setTest(setPath, 'selector')
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('setJSON', function() {
        it('should perform a hard-link with back references toJSONG.', function(done) {
            getTest(getPath, 'toJSONG').
                flatMap(function() {
                    return setTest(setJSON, 'toJSONG')
                }).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            getTest(getPath, 'toJSON').
                flatMap(function() {
                    return setTest(setJSON, 'toJSON')
                }).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toPathValues.', function(done) {
            getTest(getPath, 'toPathValues').
                flatMap(function() {
                    return setTest(setJSON, 'toPathValues')
                }).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references selector.', function(done) {
            getTest(getPath, 'selector').
                flatMap(function() {
                    return setTest(setJSON, 'selector')
                }).
                subscribe(noOp, done, done);
        });
    });
});
describe('Expired', function() {
    var getPath = ['genreList', 0, null];
    var getJSON = {genreList: {0: {'__null': null}}};
    var setPath = {path: ['genreList', 0, 1, 'summary'], value: {should: 'not set'}};
    var setJSON = {genreList: {0: {1: {summary: 'no set'}}}};
    var setJSONG = {
        jsong: {
            genreList: {
                0: ['lists', 'abcd']
            },
            lists: {
                abcd: {
                    1: {
                        summary: {
                            should: 'not set'
                        }
                    }
                }
            }
        },
        paths: [['genreList', 0, 1, 'summary']]
    };
    describe('getPath', function() {
        it('should perform a hard-link with back references toJSONG.', function(done) {
            setExpireyAndGet(getPath, 'toJSONG', true).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            setExpireyAndGet(getPath, 'toJSON', true).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toPathValues.', function(done) {
            setExpireyAndGet(getPath, 'toPathValues', true).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references selector.', function(done) {
            setExpireyAndGet(getPath, 'selector', true).
                subscribe(noOp, done, done);
        });
    });
    describe('getJSON', function() {
        it('should perform a hard-link with back references toJSONG.', function(done) {
            setExpireyAndGet(getJSON, 'toJSONG', true).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            setExpireyAndGet(getJSON, 'toJSON', true).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toPathValues.', function(done) {
            setExpireyAndGet(getJSON, 'toPathValues', true).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references selector.', function(done) {
            setExpireyAndGet(getJSON, 'selector', true).
                subscribe(noOp, done, done);
        });
    });
    describe('setPath', function() {
        it('should perform a hard-link with back references toJSONG.', function(done) {
            setExpireyAndGet(setPath, 'toJSONG').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            setExpireyAndGet(setPath, 'toJSON').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toPathValues.', function(done) {
            setExpireyAndGet(setPath, 'toPathValues').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references selector.', function(done) {
            setExpireyAndGet(setPath, 'selector').
                subscribe(noOp, done, done);
        });
    });
    describe('setJSON', function() {
        it('should perform a hard-link with back references toJSONG.', function(done) {
            setExpireyAndGet(setJSON, 'toJSONG').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            setExpireyAndGet(setJSON, 'toJSON').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toPathValues.', function(done) {
            setExpireyAndGet(setJSON, 'toPathValues').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references selector.', function(done) {
            setExpireyAndGet(setJSON, 'selector').
                subscribe(noOp, done, done);
        });
    });
    describe('setJSONG', function() {
        it('should perform a hard-link with back references toJSONG.', function(done) {
            setExpireyAndGet(setJSONG, 'toJSONG').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            setExpireyAndGet(setJSONG, 'toJSON').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toPathValues.', function(done) {
            setExpireyAndGet(setJSONG, 'toPathValues').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references selector.', function(done) {
            setExpireyAndGet(setJSONG, 'selector').
                subscribe(noOp, done, done);
        });
    });
});

function setExpireyAndGet(query, output, get) {
    var model = new Model({cache: {
        genreList: {
            0: {
                $type: 'sentinel',
                $expires: Date.now() + 50,
                value: ['lists', 'abcd']
            }
        },
        lists: {
            abcd: {
                0: {
                    summary: {
                        $type: 'leaf',
                        hello: 'world'
                    }
                }
            }
        }
    }});
    return model.
        get(['genreList', 0, 0, 'summary']).
        delay(100).
        do(function() {
            debugger
            var lhs = model._cache.genreList[0];
            var rhs = model._cache.lists.abcd;
            expect(lhs[__ref_index]).to.equal(0);
            expect(rhs[__refs_length]).to.equal(1);
            expect(rhs[__ref + lhs[__ref_index]]).to.equal(lhs);
            expect(lhs[__context]).to.equal(rhs);
        }, noOp, noOp).
        flatMap(function() {
            if (get) {
                debugger;
                return testRunner.get(model, _.cloneDeep(query), output);
            }
            return testRunner.set(model, _.cloneDeep(query), output);
        }).
        do(noOp, noOp, function() {
            debugger
            var lhs = model._cache.genreList[0];
            var rhs = model._cache.lists.abcd;
            expect(lhs[__ref_index]).to.not.be.ok;
            expect(rhs[__refs_length]).to.not.be.ok;
            expect(lhs[__context]).to.not.equal(rhs);
        });
}

function getTest(query, output) {
    var model = new Model({cache: Cache()});
    var lhs = model._cache.genreList[0];
    var rhs = model._cache.lists.abcd;

    expect(lhs[__ref_index]).to.not.be.ok;
    expect(rhs[__refs_length]).to.not.be.ok;
    expect(lhs[__context]).to.not.be.ok;

    return testRunner.get(model, _.cloneDeep(query), output).
        do(noOp, noOp, function() {
            debugger;
            expect(lhs[__ref_index]).to.equal(0);
            expect(rhs[__refs_length]).to.equal(1);
            expect(rhs[__ref + lhs[__ref_index]]).to.equal(lhs);
            expect(lhs[__context]).to.equal(rhs);
        });
}

function setTest(query, output) {
    var model = new Model({cache: Cache()});
    var lhs = model._cache.genreList[0];
    var rhs = model._cache.lists.abcd;

    return testRunner.set(model, _.cloneDeep(query), output).
        do(noOp, noOp, function() {
            debugger;
            expect(lhs[__ref_index]).to.not.be.ok;
            expect(rhs[__refs_length]).to.not.be.ok;
            expect(lhs[__context]).to.not.equal(rhs);
        });
}
