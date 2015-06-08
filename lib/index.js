var falcor = {};
var Rx = require('falcor-observable');

if(typeof Promise !== "undefined" && Promise) {
    Rx.promise = falcor.Promise = Promise;
} else {
    Rx.promise = falcor.Promise = require("promise");
}

falcor.Model = require("falcor/Model");
falcor.Observer = Rx.Observer;
falcor.Observable = Rx.Observable;
falcor.Disposable = Rx.Disposable;
falcor.SerialDisposable = Rx.SerialDisposable;
falcor.CompositeDisposable = Rx.CompositeDisposable;

module.exports = falcor;