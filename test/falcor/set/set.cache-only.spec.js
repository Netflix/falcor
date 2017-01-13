var falcor = require("./../../../lib/");
var Model = falcor.Model;
var noOp = function() {};
var expect = require('chai').expect;
var sinon = require('sinon');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var cacheGenerator = require('./../../CacheGenerator');
var Cache = require('./../../data/Cache');
var toValue = function(x) { return {value: x}; };
var jsonGraph = require('falcor-json-graph');

describe('Cache Only', function() {
    describe('toJSON', function() {
        it('should set a value from falcor.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 1)
            });
            var onNext = sinon.spy();
            toObservable(model.
                set({path: ['videos', 0, 'title'], value: 'V0'})).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'V0'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });

        it('should correctly output with many different input types.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 3)
            });
            var onNext = sinon.spy();
            toObservable(model.
                set({
                    path: ['videos', 0, 'title'],
                    value: 'V0'
                }, {
                    jsonGraph: {
                        videos: {
                            1: {
                                title: 'V1'
                            }
                        }
                    },
                    paths: [['videos', 1, 'title']]
                }, {
                    json: {
                        videos: {
                            2: {
                                title: 'V2'
                            }
                        }
                    }
                })).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'V0'
                                },
                                1: {
                                    title: 'V1'
                                },
                                2: {
                                    title: 'V2'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('_toJSONG', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 1)
            });
            var onNext = sinon.spy();
            toObservable(model.
                set({path: ['videos', 0, 'title'], value: 'V0'}).
                _toJSONG()).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        jsonGraph: {
                            videos: {
                                0: {
                                    title: 'V0'
                                }
                            }
                        },
                        paths: [['videos', 0, 'title']]
                    });
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

            toObservable(model.
                boxValues().
                setValue(testPath, jsonGraph.error({message:'errormsg'}))).
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

            toObservable(model.
                boxValues().
                set({
                    path: testPath,
                    value: jsonGraph.error({message:'errormsg'})
                })).
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

        it('should be allowed to change $type', function(done) {

            var testPath = ['genreList', 0, 0, 'errorPath'];

            var modelCache = Cache();

            var onNextSpy = sinon.spy();
            var onErrorSpy = sinon.spy();

            var model = new Model({
                cache : modelCache,
                errorSelector : function(path, atom) {
                    var o = {
                        $type: 'atom',
                        $custom: 'custom',
                        value: {
                            message: atom.value.message,
                            customtype: 'customtype'
                        }
                    };

                    return o;
                }
            });

            toObservable(model.
                boxValues().
                setValue(testPath, jsonGraph.error({message:'errormsg'}))).
                doAction(onNextSpy, onErrorSpy, noOp).
                subscribe(
                    noOp,
                    function(e) {
                        expect(onErrorSpy.callCount).to.equal(0);
                        done();
                    },
                    function() {

                        expect(onErrorSpy.callCount).to.equal(0);
                        expect(onNextSpy.callCount).to.equal(1);

                        expect(onNextSpy.getCall(0).args[0]).to.deep.equals({
                            $type: 'atom',
                            $custom: 'custom',
                            value: {
                                message: 'errormsg',
                                customtype: 'customtype'
                            },
                            $size:51
                        });

                        done();
                    });
        });

    });

});
