var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Rx = require("rx");
var LocalDataSource = require("../../data/LocalDataSource");
var Cache = require("../../data/Cache");
var Expected = require("../../data/expected");
var getTestRunner = require("../../getTestRunner");
var testRunner = require("../../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
var InvalidModelError = require('./../../../lib/errors/InvalidModelError');
var $atom = require("./../../../lib/types/atom");
var $error = require("./../../../lib/types/error");
var $ref = require("./../../../lib/types/ref");
var sinon = require('sinon');
var ModelResponse = require('./../../../lib/response/ModelResponse');
var atom = Model.atom;

describe("Deref-Short", function() {
    describe('Sync', function() {
        it("bound to a path that short-circuits in a branch key position on error.", function() {

            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $error,
                        value: {
                            message: "The humans are dead."
                        }
                    }
                }
            }});

            var throwError = false;
            try {
                dataModel._derefSync(["genreList", 0, 0]);
            } catch (e) {
                throwError = true;
                expect(e.name).to.equals(InvalidModelError.prototype.name);
            }
            expect(throwError).to.be.ok;
        });

        it("bound to a path that short-circuits in a branch key position on value.", function() {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $atom,
                        message: "The humans are dead."
                    }
                }
            }});

            var throwError = false;
            try {
                dataModel._derefSync(["genreList", 0, 0]);
            } catch (e) {
                throwError = true;
                expect(e.name).to.equals(InvalidModelError.prototype.name);
            }
            expect(throwError).to.be.ok;
        });
    });
    describe('Async', function() {
        it('should properly forward on invalid sources.', function(done) {
            var source = {
                get: function() {
                    return new ModelResponse(function(observer) {
                        setTimeout(function() {
                            observer.onNext({
                                jsonGraph: {
                                    a: atom('short that')
                                },
                                paths: [['a', 'b', 'd']]
                            });
                            observer.onCompleted();
                        });
                    });
                }
            };
            var model = new Model({
                source: source,
                cache: {
                    a: {
                        b: {
                            c: '1 2 3'
                        }
                    }
                }
            });

            var onNext = sinon.spy();
            var noThrow = false;
            model._path = ['a', 'b'];
            model.
                get(['a', 'b', 'd']).
                doAction(onNext, function(err) {
                    expect(err.name).to.equal(InvalidModelError.name);
                    expect(err.message).to.equal(InvalidModelError.message);
                    noThrow = true;
                }).
                subscribe(
                    done.bind(null, 'onNext should not happen.'),
                    function(e) {
                        if (noThrow) {
                            return done();
                        }
                        done(e);
                    },
                    done.bind(null, 'onCompleted should not happen.'));
        });
        it("bound to a path that short-circuits in a branch key position on error.", function(done) {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $error,
                        value: {
                            message: "The humans are dead."
                        }
                    }
                }
            }});

            var throwError = false;
            dataModel.
                deref(["genreList", 0, 0], ['summary']).
                doAction(
                    function() { throw 'onNext should not happen.'; },
                    function(e) {
                        expect(e.name).to.equals(InvalidModelError.prototype.name);
                        throwError = true;
                    },
                    function() { throw 'onCompleted should not happen.'; }).
                subscribe(noOp, function(e) {
                    if (throwError) {
                        return done();
                    }
                    done(e);
                }, done);
        });

        it("bound to a path that short-circuits in a branch key position on value.", function(done) {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $atom,
                        value: {
                            message: "The humans are dead."
                        }
                    }
                }
            }});

            var throwError = false;
            dataModel.
                deref(["genreList", 0, 0], ['summary']).
                doAction(
                    function() { throw 'onNext should not happen.'; },
                    function(e) {
                        expect(e.name).to.equals(InvalidModelError.prototype.name);
                        throwError = true;
                    },
                    function() { throw 'onCompleted should not happen.'; }).
                subscribe(noOp, function(e) {
                    if (throwError) {
                        return done();
                    }
                    done(e);
                }, done);
        });

        it('should ensure that deref correctly makes a request to the dataStore.', function(done) {
            var onGet = sinon.spy();
            var onNext = sinon.spy();

            var dataModel = new Model({
                cache: {
                    genreList: {
                        '0':  { '$type': $ref, 'value': ['lists', 'abcd'] },

                    },
                    'lists': {
                        'abcd': {
                            '0':  { '$type': $ref, 'value': ['videos', 1234] }
                        }
                    }
                },
                source: new LocalDataSource(Cache(), {
                    onGet: onGet
                })
            });

            var throwError = false;
            dataModel.
                deref(['genreList', 0, 0], ['summary']).
                subscribe(onNext, done, function() {
                    var error = false;
                    try {
                        expect(onGet.called).to.be.ok;
                        expect(onGet.getCall(0).args[1]).to.deep.equals([
                            ['videos', 1234, 'summary']
                        ]);
                        expect(onNext.called).to.be.ok;
                        expect(onNext.getCall(0).args[0]._path).to.deep.equals([
                            'videos', 1234
                        ]);
                    } catch (e) {
                        error = e;
                    }

                    if (error) {
                        return done(error);
                    }
                    return done();
                });
        });
    });
});

