var falcor = require('./../../../lib');
var InvalidModelError = require('./../../../lib/errors/InvalidModelError');
var Model = falcor.Model;
var sinon = require('sinon');
var expect = require('chai').expect;
var cacheGenerator = require('./../../CacheGenerator');
var noOp = function() {};
var isAssertionError = require('./../../isAssertionError');

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

                lolomoModel.
                    get([0, 0, 'item', 'title']).
                    doAction(onNext, function(err) {
                        expect(err.message).to.equals(InvalidModelError.message);
                    }).
                    subscribe(
                        done.bind(null, new Error('onNext shouldnt be called')),
                        function(err) {
                            if (isAssertionError(err)) {
                                return done(err);
                            }
                            done();
                        },
                        done.bind(null, new Error('onCompleted shouldnt be called')));
            });
    });
});
