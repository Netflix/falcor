var falcor = require("./../../../lib/");
var Model = falcor.Model;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
var InvalidModelError = require('./../../../lib/errors/InvalidModelError');
var $atom = require('./../../../lib/types/atom');
var $error = require('./../../../lib/types/error');
var sinon = require('sinon');

describe("Deref-On", function() {
    describe('Sync', function() {
        it("bound to a path that lands on an error.", function() {

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
                dataModel._derefSync(["genreList", 0]);
            } catch (e) {
                throwError = true;
                expect(e.message).to.equals('The humans are dead.');
            }
            expect(throwError).to.be.ok;
        });

        it("bound to a path that lands on a value.", function(done) {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $atom,
                        value: "The humans are dead."
                    }
                }
            }});

            var nextModel = dataModel._derefSync(["genreList", 0]);
            var onNext = sinon.spy();
            nextModel.
                get([0, 'summary']).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: 'The humans are dead.'
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('Async', function() {
        it("bound to a path that lands on an error.", function(done) {
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

            var expectPassed = false;
            dataModel.
                deref(["genreList", 0], ['summary']).
                doAction(noOp, function(e) {
                    expect(e).to.deep.equals({ message: 'The humans are dead.' });
                    expectPassed = true;
                }).
                subscribe(
                    done.bind(null, 'onNext should not happen.'),
                    function(e) {
                        if (expectPassed) {
                            return done();
                        }
                        done(e);
                    },
                    done.bind(null, 'onCompleted should not happen.'));
        });

        it("bound to a path that lands on a value.", function(done) {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $atom,
                        value: "The humans are dead."
                    }
                }
            }});

            var onNext = sinon.spy();
            dataModel.
                deref(["genreList", 0], ['summary']).
                flatMap(function(boundModel) {
                    return boundModel.get(['summarieses']);
                }).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: 'The humans are dead.'
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
});

