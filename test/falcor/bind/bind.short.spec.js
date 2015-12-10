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
var doneOnError = require('./../../doneOnError');
var errorOnCompleted = require('./../../errorOnCompleted');
var errorOnNext = require('./../../errorOnNext');

describe("Deref-Short", function() {
    describe('get', function() {
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

            model._path = ['a', 'b'];
            model.
                get(['a', 'b', 'd']).
                doAction(done, function(err) {
                    expect(err instanceof InvalidModelError).to.be.ok;
                }).
                subscribe(
                    errorOnNext(done),
                    doneOnError(done),
                    errorOnCompleted(done));
        });
        it('should error on initial get if shorted.', function(done) {
            var model = new Model({
                cache: {
                    a: atom('value')
                }
            });

            model._path = ['a', 'b'];
            model.
                get(['d']).
                doAction(done, function(err) {
                    expect(err instanceof InvalidModelError).to.be.ok;
                }).
                subscribe(
                    errorOnNext(done),
                    doneOnError(done),
                    errorOnCompleted(done));
        });
    });
    describe('Sync', function() {
        it('should deref to a materialized value and return null.', function() {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $atom,
                    }
                }
            }});

            var out = dataModel._derefSync(["genreList", 0]);
            expect(out).to.equals(undefined);
        });
        it('should deref to a materialized value and return null.', function() {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $atom,
                    }
                }
            }});

            var out = dataModel._derefSync(["genreList", 0, 0]);
            expect(out).to.equals(undefined);
        });
        it("bound to a path that short-circuits in a branch key position on error.", function() {

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
            try {
                dataModel._derefSync(["genreList", 0, 0]);
            } catch (e) {
                throwError = true;
                expect(e instanceof InvalidModelError).to.be.ok;
            }
            expect(throwError).to.be.ok;
        });

        it("bound path should short-circuit on an expired reference.", function() {

            var dataModel = new Model({cache: {
                genreList: Model.ref(['genreLists', 'ABC'], {$expires: Date.now() - 1000})
            }});

            var out = dataModel._derefSync(["genreList", 0, 0]);
            expect(out).to.be.not.ok;
        });

        it("bound to a path that short-circuits leaf position on error.", function() {

            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        0: {
                            $type: $atom,
                            value: {
                                message: "The humans are dead."
                            }
                        }
                    }
                }
            }});

            var throwError = false;
            try {
                dataModel._derefSync(["genreList", 0, 0]);
            } catch (e) {
                throwError = true;
                expect(e instanceof InvalidModelError).to.be.ok;
            }
            expect(throwError).to.be.ok;
        });
    });
    describe('Async', function() {
        it("bound to a path that short-circuits in a branch key position on error.", function(done) {
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

            dataModel.
                deref(["genreList", 0, 0], ['summary']).
                doAction(noOp, function(err) {
                    expect(err instanceof InvalidModelError).to.be.ok;
                }).
                subscribe(
                    errorOnNext(done),
                    doneOnError(done),
                    errorOnCompleted(done));
        });

        it('should deref to a materialized value and return null.', function(done) {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $atom,
                    }
                }
            }});

            var onNext = sinon.spy();
            dataModel.
                deref(["genreList", 0], ['summary']).
                doAction(onNext, noOp, function() {
                    expect(onNext.callCount).to.equals(0);
                }).
                subscribe(errorOnNext(done), done, done);
        });

        it('should deref to a materialized value beyond where the deref happens.', function(done) {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $atom,
                    }
                }
            }});

            var onNext = sinon.spy();
            dataModel.
                deref(["genreList", 0, 0], ['summary']).
                doAction(onNext, noOp, function() {
                    expect(onNext.callCount).to.equals(0);
                }).
                subscribe(errorOnNext(done), done, done);
        });
    });
});

