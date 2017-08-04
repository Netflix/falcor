var falcor = require('./../../../lib');
var InvalidModelError = require('./../../../lib/errors/InvalidModelError');
var InvalidDerefInputError = require('./../../../lib/errors/InvalidDerefInputError');
var Model = falcor.Model;
var sinon = require('sinon');
var expect = require('chai').expect;
var cacheGenerator = require('./../../CacheGenerator');
var noOp = function() {};
var isAssertionError = require('./../../isAssertionError');
var clean = require("../../cleanData").clean;

describe('Error cases', function() {
    it('should error on a shorted deref path.', function(done) {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        });

        var onNext = sinon.spy();
        model.
            get(['lolomo', 0, 0, 'item', 'title']).
            subscribe(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;

                var json = onNext.getCall(0).args[0].json;
                var lolomoModel = model.deref(json.lolomo);
                model.
                    set({
                        json: {
                            lolomos: 'ohh no'
                        }
                    }).
                    subscribe();

                toObservable(lolomoModel.
                    get([0, 0, 'item', 'title'])).
                    doAction(onNext, function(err) {
                        expect(onNext.callCount).to.equal(1);
                        expect(err.message).to.equals(InvalidModelError.message);
                    }).
                    subscribe(
                        noOp,
                        function(err) {
                            if (isAssertionError(err)) {
                                return done(err);
                            }
                            done();
                        },
                        done.bind(null, new Error('onCompleted shouldnt be called')));
            });
    });

    it('should throw on invalid input.', function(done) {
        try {
            new Model().deref('testing');
        } catch (e) {
            expect(e.name).to.equals(InvalidDerefInputError.name);
            return done();
        }
        done(new Error('should of thrown an error.'));
    });
});
