var falcor = require('../../lib');
var Model = falcor.Model;
var toObservable = require('../toObs');

var noOp = function() {};

describe('Operations', function() {
    it('should filter the meta data from a falcor response.', function(done) {
        var model = new Model({
            cache: {
                a: {
                    b: {
                        c: 42
                    }
                }
            }
        });

        var onNext = jest.fn();
        toObservable(model.
            get(['a', 'b', 'c'])).
            doAction(onNext, noOp, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(falcor.keys(onNext.mock.calls[0][0].json.a)).toEqual([
                    'b'
                ]);
            }).
            subscribe(noOp, done, done);
    });

    it('should return undefined when undefined is passed into falcor.keys', function() {
        expect(falcor.keys()).toBe(undefined);
    });
});
