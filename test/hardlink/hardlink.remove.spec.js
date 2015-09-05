var falcor = require("./../../lib/");
var Model = falcor.Model;
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

var __ref = require("./../../lib/internal/ref");
var __context = require("./../../lib/internal/context");
var __ref_index = require("./../../lib/internal/ref-index");
var __refs_length = require("./../../lib/internal/refs-length");

describe('Removing', function() {
    var getPath = ['genreList', 0, 0, 'summary'];
    var setPath = {path: ['genreList', 0], value: 4};
    var setJSON = {json: {genreList: {0: 4}}};
    describe('setPaths', function() {
        it('should perform a hard-link with back references _toJSONG.', function(done) {
            getTest(getPath, '_toJSONG').
                flatMap(function() {
                    return setTest(setPath, '_toJSONG');
                }).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            getTest(getPath, 'toJSON').
                flatMap(function() {
                    return setTest(setPath, 'toJSON');
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('setJSON', function() {
        it('should perform a hard-link with back references _toJSONG.', function(done) {
            getTest(getPath, '_toJSONG').
                flatMap(function() {
                    return setTest(setJSON, '_toJSONG');
                }).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            getTest(getPath, 'toJSON').
                flatMap(function() {
                    return setTest(setJSON, 'toJSON');
                }).
                subscribe(noOp, done, done);
        });
    });
});
describe('Expired', function() {
    var getPath = ['genreList', 0, 1, 'summary'];
    var setPath = {path: ['genreList', 0, 1, 'summary'], value: {should: 'set'}};
    var setJSON = {json: {genreList: {0: {1: {summary: 'set'}}}}};
    var setJSONG = {
        jsonGraph: {
            genreList: {
                0: {
                    $type: "ref",
                    value: ['lists', 'abcd']
                }
            },
            lists: {
                abcd: {
                    1: {
                        summary: {
                            $type: "atom",
                            value: { should: 'set' }
                        }
                    }
                }
            }
        },
        paths: [['genreList', 0, 1, 'summary']]
    };
    describe('getPath', function() {
        it('should perform a hard-link with back references _toJSONG.', function(done) {
            setExpireyAndGet(getPath, '_toJSONG', true).
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            setExpireyAndGet(getPath, 'toJSON', true).
                subscribe(noOp, done, done);
        });
    });
    describe('setPath', function() {
        it('should perform a hard-link with back references _toJSONG.', function(done) {
            setExpireyAndGet(setPath, '_toJSONG').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            setExpireyAndGet(setPath, 'toJSON').
                subscribe(noOp, done, done);
        });
    });
    describe('setJSON', function() {
        it('should perform a hard-link with back references _toJSONG.', function(done) {
            setExpireyAndGet(setJSON, '_toJSONG').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            setExpireyAndGet(setJSON, 'toJSON').
                subscribe(noOp, done, done);
        });
    });
    describe('setJSONG', function() {
        it('should perform a hard-link with back references _toJSONG.', function(done) {
            setExpireyAndGet(setJSONG, '_toJSONG').
                subscribe(noOp, done, done);
        });
        it('should perform a hard-link with back references toJSON.', function(done) {
            setExpireyAndGet(setJSONG, 'toJSON').
                subscribe(noOp, done, done);
        });
    });
});

function setExpireyAndGet(query, output, get) {
    var model = new Model({ cache: {
        genreList: {
            0: {
                $type: 'ref',
                $expires: Date.now() + 50,
                value: ['lists', 'abcd']
            }
        },
        lists: {
            abcd: {
                0: {
                    summary: {
                        $type: 'atom',
                        value: { hello: 'world' }
                    }
                }
            }
        }
    }});
    var genreList = model._root.cache.genreList;
    var lhs = genreList[0];
    var rhs = model._root.cache.lists.abcd;
    return model.
        get(['genreList', 0, 0, 'summary']).
        do(function() {
            // var lhs = model._root.cache.genreList[0];
            // var rhs = model._root.cache.lists.abcd;
            expect(lhs[__ref_index]).to.equal(0);
            expect(rhs[__refs_length]).to.equal(1);
            expect(rhs[__ref + lhs[__ref_index]]).to.equal(lhs);
            expect(lhs[__context]).to.equal(rhs);
        }, noOp, noOp).
        delay(100).
        flatMap(function(data) {
            if (get) {
                return testRunner.get(model, _.cloneDeep(query), output);
            }
            return testRunner.set(model, _.cloneDeep(query), output);
        }).
        do(noOp, noOp, function() {
            // var lhs = model._root.cache.genreList[0];
            // var rhs = model._root.cache.lists.abcd;
            expect(lhs[__ref_index]).to.not.be.ok;
            expect(rhs[__ref + 0]).to.not.equal(lhs);
            expect(lhs[__context]).to.not.equal(rhs);
        });
}

function getTest(query, output) {
    var model = new Model({cache: Cache()});
    var lhs = model._root.cache.genreList[0];
    var rhs = model._root.cache.lists.abcd;

    expect(lhs[__ref_index]).to.not.be.ok;
    expect(rhs[__refs_length]).to.not.be.ok;
    expect(lhs[__context]).to.not.be.ok;

    return testRunner.get(model, _.cloneDeep(query), output).
        do(noOp, noOp, function() {
            expect(lhs[__ref_index]).to.equal(0);
            expect(rhs[__refs_length]).to.equal(1);
            expect(rhs[__ref + lhs[__ref_index]]).to.equal(lhs);
            expect(lhs[__context]).to.equal(rhs);
        });
}

function setTest(query, output) {
    var model = new Model({cache: Cache()});
    var lhs = model._root.cache.genreList[0];
    var rhs = model._root.cache.lists.abcd;

    return testRunner.set(model, _.cloneDeep(query), output).
        do(noOp, noOp, function() {
            expect(lhs[__ref_index]).to.not.be.ok;
            expect(rhs[__refs_length]).to.not.be.ok;
            expect(lhs[__context]).to.not.equal(rhs);
        });
}
