var falcor = require("./../../lib/");
var Model = falcor.Model;
var Rx = require("rx");
var noOp = function() {};

var __head = require("./../../lib/internal/head");
var __tail = require("./../../lib/internal/tail");
var __next = require("./../../lib/internal/next");
var __prev = require("./../../lib/internal/prev");

describe('Expired', function() {
    it('should ensure that get avoids expired items', function(done) {
        var model = new Model({cache: {
            "expireSoon": {
                "$size": 51,
                "summary": {
                    "$size": 51,
                    "$expires": Date.now() + 50,
                    "$type": "atom",
                    "value": 'sad panda'
                }
            }
        }});

        expect(model._root[__head].value).toBe('sad panda');

        var onNext = jest.fn();
        Rx.Observable.
            timer(100).
            flatMap(function() {
                return model.get(['expireSoon', 'summary']);
            }).
            doAction(onNext, noOp, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(model._root[__head]).toBeUndefined();
                expect(model._root[__tail]).toBeUndefined();
            }).
            subscribe(noOp, done, done);
    });
});
