var chai = require("chai");
var expect = chai.expect;
var _ = require("lodash");
var Rx = require("rx");
var testRunner = require("./testRunner");

function toObservable(request, queue, onNext) {
    return Rx.Observable.create(function(observer) {
        return queue.get([request]).subscribe({
            onNext: function(x) {
                observer.onNext(x);
                onNext && onNext.call(this, x);
            },
            onError: observer.onError.bind(observer),
            onCompleted: observer.onCompleted.bind(observer)
        });
    });
}

module.exports = function(expected, queue, onNext) {
    return toObservable(expected.getPathValues.query[0], queue, onNext);
};

function contains(has, toHave, position) {
    var obj = Object.keys(has);
    obj.forEach(function(k) {
        expect(toHave, "Object." + position + " to have key " + k).to.include.keys(k);
        if (typeof toHave[k] === "object" && !Array.isArray(toHave)) {
            contains(has[k], toHave[k], position + k);
        }
    });
}
