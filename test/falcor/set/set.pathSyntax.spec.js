var falcor = require("./../../../lib/");
var Model = falcor.Model;
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var noOp = function() {};
var cacheGenerator = require('./../../CacheGenerator');
var toObservable = require('../../toObs');

describe('Path Syntax', function() {
    it('should accept strings for set in the path argument of a pathValue.', function(done) {
        var onNext = jest.fn();
        var model = new Model();

        toObservable(model.
            set({path: 'test[0]', value: 5})).
            doAction(onNext, noOp, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(strip(onNext.mock.calls[0][0])).toEqual({
                    json: {
                        test: {
                            0: 5
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
    it('should accept strings for setValue', function(done) {
        var onNext = jest.fn();
        var model = new Model();

        toObservable(model.
            setValue('test[0]', 6)).
            doAction(onNext, noOp, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(strip(onNext.mock.calls[0][0])).toBe(6);
            }).
            subscribe(noOp, done, done);
    });
});
