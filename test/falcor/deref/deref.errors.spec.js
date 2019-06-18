var falcor = require('./../../../lib');
var InvalidModelError = require('./../../../lib/errors/InvalidModelError');
var InvalidDerefInputError = require('./../../../lib/errors/InvalidDerefInputError');
var Model = falcor.Model;
var cacheGenerator = require('./../../CacheGenerator');
var noOp = function() {};
var isAssertionError = require('./../../isAssertionError');
var clean = require("../../cleanData").clean;
var toObservable = require('../../toObs');

describe('Error cases', function() {
    it('should error on a shorted deref path.', function(done) {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        });

        var onNext = jest.fn();
        model.
            get(['lolomo', 0, 0, 'item', 'title']).
            subscribe(onNext, noOp, function() {
                expect(onNext).toHaveBeenCalledTimes(1);

                var json = onNext.mock.calls[0][0].json;
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
                        expect(onNext).toHaveBeenCalledTimes(1);
                        expect(err.name).toBe(InvalidModelError.name);
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
            expect(e.name).toBe(InvalidDerefInputError.name);
            return done();
        }
        done(new Error('should have thrown an error.'));
    });
});
