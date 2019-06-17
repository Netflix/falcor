var falcor = require('./../../../lib');
var Model = falcor.Model;
var cacheGenerator = require('./../../CacheGenerator');
var toObservable = require('../../toObs');
var noOp = function() {};

describe('Spec', function() {
    it('should deref on a __path cache response.', function(done) {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        });

        var onNext = jest.fn();
        toObservable(model.
            get(['lolomo', 0, 0, 'item', 'title'])).
            doAction(onNext, noOp, function() {
                expect(onNext).toHaveBeenCalledTimes(1);

                var json = onNext.mock.calls[0][0].json;
                var lolomoModel = model.deref(json.lolomo);

                expect(lolomoModel._path).toEqual(['lolomos', '1234']);
            }).
            subscribe(noOp, done, done);
    });
});
