var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Cache = require('../../data/Cache');
var Expected = require('../../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var expect = require('chai').expect;
var sinon = require('sinon');
var toValue = function(x) { return {value: x}; };

describe('Cache Only', function() {
    describe('toJSON', function() {
        it('should set a value from falcor.', function(done) {
            var model = new Model({cache: Cache()});
            var value = {hello: 'world'};
            var expected = {
                json: {
                    videos: {
                        1234: {
                            summary: {
                                hello: 'world'
                            }
                        }
                    }
                }
            };
            var next = false;
            model.
                set({path: ['videos', 1234, 'summary'], value: value}).
                doAction(function(x) {
                    testRunner.compare(expected, x);
                    next = true;
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
        it('should set a pathMap across references and return a corresponding pathMap', function(done) {
            var model = new Model({cache: Cache()});
            var pathMap = { json: { genreList: { 0: { 0: {
                summary: Model.atom({
                    "title": "Terminator 2",
                    "url": "/movies/333"
                }) }}}}};
            var expected = { json: { genreList: { 0: { 0: {
                summary: {
                    "title": "Terminator 2",
                    "url": "/movies/333"
                }}}}}};
            var next = false;
            model.
                set(pathMap).
                doAction(function(x) {
                    testRunner.compare(expected, x);
                    next = true;
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('_toJSONG', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({cache: Cache()});
            var value = {hello: 'world'};
            var expected = {
                jsonGraph: {
                    videos: {
                        1234: {
                            summary: {
                                $type: 'atom',
                                $modelCreated: true,
                                $size: 51,
                                value: {
                                    hello: 'world'
                                }
                            }
                        }
                    }
                },
                paths: [['videos', 1234, 'summary']]
            };
            var next = false;
            model.
                set({path: ['videos', 1234, 'summary'], value: value}).
                _toJSONG().
                doAction(function(x) {
                    testRunner.compare(expected, x);
                    next = true;
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
});
