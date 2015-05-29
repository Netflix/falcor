var jsong = require("../../../index");
var Model = jsong.Model;
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
var InvalidModelError = require('./../../../lib/falcor/InvalidModelError');
var $atom = require('./../../../lib/types/atom');
var $error = require('./../../../lib/types/error');
describe("Bind-Short", function() {
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
                debugger
                dataModel.bindSync(["genreList", 0, 0]);
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
                dataModel.bindSync(["genreList", 0, 0]);
            } catch (e) {
                throwError = true;
                expect(e.name).to.equals(InvalidModelError.prototype.name);
            }
            expect(throwError).to.be.ok;
        });
    });
    describe('Async', function() {
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
                bind(["genreList", 0, 0], ['summary']).
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
                bind(["genreList", 0, 0], ['summary']).
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
    });
});

