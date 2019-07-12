var falcor = require('./../../lib');
var Model = falcor.Model;
var strip = require("./../cleanData").stripDerefAndVersionKeys;
var toObservable = require('../toObs');

var noOp = function() {};

it('should invalidate with pathSyntax', function(done) {
    var model = new Model({
        cache: {
            foo: {
                bar: 5,
                bazz: 7
            }
        }
    });

    model.invalidate('foo.bar');

    var onNext = jest.fn();
    toObservable(model.
        get('foo.bar', 'foo.bazz')).
        doAction(onNext, noOp, function() {
            expect(onNext).toHaveBeenCalledTimes(1);
            expect(strip(onNext.mock.calls[0][0])).toEqual({
                json: {
                    foo: {
                        bazz: 7
                    }
                }
            });
        }).
        subscribe(noOp, done, done);
});

it('should throw for undefined paths', function() {
    var model = new Model({ cache: { value: 1 } });
    expect(() => model.invalidate(undefined)).toThrow();
    expect(model.getCache()).toEqual({ value: 1 });
});

it('should throw for empty paths', function() {
    var model = new Model({ cache: { value: 1 } });
    expect(() => model.invalidate([])).toThrow();
    expect(model.getCache()).toEqual({ value: 1 });
});

it('should do nothing for non-existing paths', function() {
    var model = new Model({ cache: { value: 1 } });
    model.invalidate('no.such.path');
    expect(model.getCache()).toEqual({ value: 1 });
});
