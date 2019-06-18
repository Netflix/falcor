var falcor = require("./../../../lib/");
var Model = falcor.Model;
var noOp = function() {};
var toObs = require('./../../toObs');

describe('ModelDataSourceAdapter', function() {
    it('ensure atoms remain as strings if model created.', function(done) {
        var model = new Model({
            cache: {
                hello: 'world'
            }
        });

        var onNext = jest.fn();
        toObs(model.
            asDataSource().
            get([['hello']])).
            doAction(onNext, noOp, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(onNext.mock.calls[0][0]).toEqual({
                    jsonGraph: {
                        hello: 'world'
                    },
                    paths: [['hello']]
                });
            }).
            subscribe(noOp, done, done);
    });
});
