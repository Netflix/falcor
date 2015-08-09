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

describe('Set', function() {
    describe('setPaths', function() {
        describe('PathMap', function () {
            it('should promote 1 item as head, no tail, no next/prev.', function (done) {
                singleItem('path', 'toJSON').
                    subscribe(noOp, done, done);
            });

            it('should promote 2 items.  1st item should be tail, 2nd should be head.', function (done) {
                doubleItem('path', 'toJSON').
                    subscribe(noOp, done, done);
            });

            it('should promote 3 items.  1st item should be tail, 3rd should be head.', function (done) {
                tripleItem('path', 'toJSON').
                    subscribe(noOp, done, done);
            });
        });
        describe('Values', function () {
            it('should promote 1 item as head, no tail, no next/prev.', function (done) {
                singleItem('path', 'toPathValues').
                    subscribe(noOp, done, done);
            });

            it('should promote 2 items.  1st item should be tail, 2nd should be head.', function (done) {
                doubleItem('path', 'toPathValues').
                    subscribe(noOp, done, done);
            });

            it('should promote 3 items.  1st item should be tail, 3rd should be head.', function (done) {
                tripleItem('path', 'toPathValues').
                    subscribe(noOp, done, done);
            });
        });
        describe('JSONG', function () {
            it('should promote 1 item as head, no tail, no next/prev.', function (done) {
                singleItem('path', '_toJSONG').
                    subscribe(noOp, done, done);
            });

            it('should promote 2 items.  1st item should be tail, 2nd should be head.', function (done) {
                doubleItem('path', '_toJSONG').
                    subscribe(noOp, done, done);
            });

            it('should promote 3 items.  1st item should be tail, 3rd should be head.', function (done) {
                tripleItem('path', '_toJSONG').
                    subscribe(noOp, done, done);
            });
        });
    });
    describe('setJSONG', function() {
        describe('PathMap', function () {
            it('should promote 1 item as head, no tail, no next/prev.', function (done) {
                singleItem('jsonGraph', 'toJSON').
                    subscribe(noOp, done, done);
            });

            it('should promote 2 items.  1st item should be tail, 2nd should be head.', function (done) {
                doubleItem('jsonGraph', 'toJSON').
                    subscribe(noOp, done, done);
            });

            it('should promote 3 items.  1st item should be tail, 3rd should be head.', function (done) {
                tripleItem('jsonGraph', 'toJSON').
                    subscribe(noOp, done, done);
            });
        });
        describe('Values', function () {
            it('should promote 1 item as head, no tail, no next/prev.', function (done) {
                singleItem('jsonGraph', 'toPathValues').
                    subscribe(noOp, done, done);
            });

            it('should promote 2 items.  1st item should be tail, 2nd should be head.', function (done) {
                doubleItem('jsonGraph', 'toPathValues').
                    subscribe(noOp, done, done);
            });

            it('should promote 3 items.  1st item should be tail, 3rd should be head.', function (done) {
                tripleItem('jsonGraph', 'toPathValues').
                    subscribe(noOp, done, done);
            });
        });
        describe('JSONG', function () {
            it('should promote 1 item as head, no tail, no next/prev.', function (done) {
                singleItem('jsonGraph', '_toJSONG').
                    subscribe(noOp, done, done);
            });

            it('should promote 2 items.  1st item should be tail, 2nd should be head.', function (done) {
                doubleItem('jsonGraph', '_toJSONG').
                    subscribe(noOp, done, done);
            });

            it('should promote 3 items.  1st item should be tail, 3rd should be head.', function (done) {
                tripleItem('jsonGraph', '_toJSONG').
                    subscribe(noOp, done, done);
            });
        });
    });
    describe('setJSON', function() {
        describe('PathMap', function () {
            it('should promote 1 item as head, no tail, no next/prev.', function (done) {
                singleItem('json', 'toJSON').
                    subscribe(noOp, done, done);
            });

            it('should promote 2 items.  1st item should be tail, 2nd should be head.', function (done) {
                doubleItem('json', 'toJSON').
                    subscribe(noOp, done, done);
            });

            it('should promote 3 items.  1st item should be tail, 3rd should be head.', function (done) {
                tripleItem('json', 'toJSON').
                    subscribe(noOp, done, done);
            });
        });
        describe('Values', function () {
            it('should promote 1 item as head, no tail, no next/prev.', function (done) {
                singleItem('json', 'toPathValues').
                    subscribe(noOp, done, done);
            });

            it('should promote 2 items.  1st item should be tail, 2nd should be head.', function (done) {
                doubleItem('json', 'toPathValues').
                    subscribe(noOp, done, done);
            });

            it('should promote 3 items.  1st item should be tail, 3rd should be head.', function (done) {
                tripleItem('json', 'toPathValues').
                    subscribe(noOp, done, done);
            });
        });
        describe('JSONG', function () {
            it('should promote 1 item as head, no tail, no next/prev.', function (done) {
                singleItem('json', '_toJSONG').
                    subscribe(noOp, done, done);
            });

            it('should promote 2 items.  1st item should be tail, 2nd should be head.', function (done) {
                doubleItem('json', '_toJSONG').
                    subscribe(noOp, done, done);
            });

            it('should promote 3 items.  1st item should be tail, 3rd should be head.', function (done) {
                tripleItem('json', '_toJSONG').
                    subscribe(noOp, done, done);
            });
        });
    });
});

var querys = {
    1: {
        path: {path: ['1'], value: 'i am 1'},
        json: {json: { 1: 'i am 1'} },
        jsonGraph: {
            jsonGraph: { 1: 'i am 1'},
            paths: [['1']]
        }
    },
    2: {
        path: {path: ['2'], value: 'i am 2'},
        json: {json: { 2: 'i am 2'} },
        jsonGraph: {
            jsonGraph: { 2: 'i am 2'},
            paths: [['2']]
        }
    },
    3: {
        path: {path: ['3'], value: 'i am 3'},
        json: {json: { 3: 'i am 3'} },
        jsonGraph: {
            jsonGraph: { 3: 'i am 3'},
            paths: [['3']]
        }
    }
};

function singleItem(query, output) {
    var model = new Model({cache: {}});
    debugger
    return testRunner.set(model, _.cloneDeep(querys[1][query]), output).
        do(function () {
            expect(model._root[__head].value).to.equal('i am 1');
            expect(model._root[__head][__next]).to.be.not.ok;
            expect(model._root[__head][__prev]).to.be.not.ok;
            // expect(model._root[__tail]).to.be.not.ok;
        });
}

function doubleItem(query, output) {
    var model = new Model({cache: {}});
    return testRunner.set(model, _.cloneDeep(querys[1][query]), output).
        flatMap(function() {
            return testRunner.set(model, _.cloneDeep(querys[2][query]), output);
        }).
        do(function () {
            expect(model._root[__head].value).to.equal('i am 2');
            expect(model._root[__tail].value).to.equal('i am 1');
            expect(model._root[__head][__next].value).to.equal('i am 1');
            expect(model._root[__tail][__prev].value).to.equal('i am 2');
            expect(model._root[__head][__prev]).to.be.not.ok;
            expect(model._root[__tail][__next]).to.be.not.ok;
        });
}

function tripleItem(query, output) {
    var model = new Model({cache: {}});
    return testRunner.set(model, _.cloneDeep(querys[1][query]), output).
        flatMap(function() {
            return testRunner.set(model, _.cloneDeep(querys[2][query]), output);
        }).
        flatMap(function() {
            return testRunner.set(model, _.cloneDeep(querys[3][query]), output);
        }).
        do(function () {
            expect(model._root[__head].value).to.equal('i am 3');
            expect(model._root[__tail].value).to.equal('i am 1');
            expect(model._root[__head][__next].value).to.equal('i am 2');
            expect(model._root[__tail][__prev].value).to.equal('i am 2');
            expect(model._root[__head][__next][__next].value).to.equal('i am 1');
            expect(model._root[__tail][__prev][__prev].value).to.equal('i am 3');
            expect(model._root[__head][__prev]).to.be.not.ok;
            expect(model._root[__tail][__next]).to.be.not.ok;
        });
}
