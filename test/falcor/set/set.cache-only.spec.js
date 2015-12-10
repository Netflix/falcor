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
var jsonGraph = require('falcor-json-graph');

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

    describe('Error Selector (during set)', function() {

        function generateErrorSelectorSpy(expectedPath) {
            return sinon.spy(function(path, atom) {
                expect(atom.$type).to.equal('error');
                expect(atom.value.message).to.equal('errormsg');

                var o = {
                    $type: atom.$type,
                    $custom: 'custom',
                    value: {
                        message: atom.value.message,
                        customtype: 'customtype'
                    }
                };

                return o;
            });
        }

        function assertExpectedErrorPayload(e, expectedPath) {
            var path = e.path;
            var value = e.value;

            // To avoid hardcoding/scrubbing $size, and other internals
            expect(path).to.deep.equals(expectedPath);

            expect(value.$type).to.equal('error');
            expect(value.$custom).to.equal('custom');
            expect(value.value).to.deep.equals({
                message: 'errormsg',
                customtype: 'customtype'
            });
        }

        it('should get invoked with the right arguments for simple paths', function(done) {

            var testPath = ['genreList', 0, 0, 'errorPath'];

            var modelCache = Cache();

            var onNextSpy = sinon.spy();
            var onErrorSpy = sinon.spy();
            var errorSelectorSpy = generateErrorSelectorSpy(testPath);

            var model = new Model({
                cache : modelCache,
                errorSelector : errorSelectorSpy
            });

            model.
                boxValues().
                setValue(testPath, jsonGraph.error({message:'errormsg'})).
                doAction(onNextSpy, onErrorSpy, noOp).
                subscribe(
                    noOp,
                    function(e) {
                        expect(errorSelectorSpy.callCount).to.equal(1);
                        expect(errorSelectorSpy.getCall(0).args[0]).to.deep.equals(testPath);

                        expect(onErrorSpy.callCount).to.equal(1);

                        expect(e.length).to.equal(1);
                        assertExpectedErrorPayload(e[0], testPath);

                        done();
                    },
                    function() {
                        expect(onNextSpy.callCount).to.equal(0);
                        expect(onErrorSpy.callCount).to.equal(1);
                        done();
                    });
        });

        it('should get invoked with the correct error paths for a keyset', function(done) {
            var testPath = ['genreList',[0,1],0,'errorPath'];

            var modelCache = Cache();

            var onNextSpy = sinon.spy();
            var onErrorSpy = sinon.spy();
            var errorSelectorSpy = generateErrorSelectorSpy(testPath);

            var model = new Model({
                cache: modelCache,
                errorSelector: errorSelectorSpy
            });

            model.
                boxValues().
                set({
                    path: testPath,
                    value: jsonGraph.error({message:'errormsg'})
                }).
                doAction(onNextSpy, onErrorSpy, noOp).
                subscribe(
                    noOp,
                    function(e) {
                        expect(errorSelectorSpy.callCount).to.equal(2);
                        expect(errorSelectorSpy.getCall(0).args[0]).to.deep.equals(['genreList',0,0,'errorPath']);
                        expect(errorSelectorSpy.getCall(1).args[0]).to.deep.equals(['genreList',1,0,'errorPath']);

                        expect(e.length).to.equal(2);
                        assertExpectedErrorPayload(e[0], ['genreList',0,0,'errorPath']);
                        assertExpectedErrorPayload(e[1], ['genreList',1,0,'errorPath']);

                        done();
                    },
                    function() {
                        expect(onNextSpy.callCount).to.equal(0);
                        expect(onErrorSpy.callCount).to.equal(1);
                        done();
                    });
        });

    });

});
