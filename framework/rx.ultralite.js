/**
    Rx Ultralite!
    Rx on the Roku Tyler throws this (possibly related to browserify-ing Rx):
    Error: 'TypeError: 'undefined' is not a function (evaluating 'root.document.createElement('script')')'
 */

var Rx;

if (typeof window !== "undefined" && typeof window["Rx"] !== "undefined") {
    // Browser environment
    Rx = window["Rx"];
} else if(typeof global !== "undefined" && typeof global["Rx"] !== "undefined") {
    // Node.js environment
    Rx = global["Rx"];
} else {
    if(typeof global !== "undefined" && typeof global.require === "function") {
        try {
            // Node.js environment with rx module
            Rx = global["require"]("rx");
        } catch(e) {
            Rx = undefined;
        }
    }
}

if(Rx === undefined) {
    Rx = {
        I: function() { return arguments[0]; },
        Disposable: (function() {
            
            function Disposable(a) {
                this.action = a;
            }
            
            Disposable.create = function(a) {
                return new Disposable(a);
            };
            
            Disposable.empty = new Disposable(function(){});
            
            Disposable.prototype.dispose = function() {
                if(typeof this.action === 'function') {
                    this.action();
                }
            };
            
            return Disposable;
        })(),
        Observable: (function() {
            
            function Observable(s) {
                this.s = s;
            }
            
            Observable.create = Observable.createWithDisposable = function(s) {
                return new Observable(s);
            };
            
            Observable.fastCreateWithDisposable = Observable.create;
            
            Observable.fastReturnValue = function(value) {
                return Observable.create(function(observer) {
                    observer.onNext(value);
                    observer.onCompleted();
                });
            };
            
            // NOTE: Required for Router
            Observable.prototype.from;
            Observable.prototype.materialize;
            Observable.prototype.reduce;

            Observable.prototype.subscribe = function(n, e, c) {
                return this.s(
                    (n != null && typeof n === 'object') ?
                    n :
                    Rx.Observer.create(n, e, c)
                );
            };
            Observable.prototype.forEach = Observable.prototype.subscribe;
            
            Observable.prototype.catchException = function(next) {
                var self = this;
                return Observable.create(function(o) {
                    return self.subscribe(
                        function(x) { o.onNext(x); },
                        function(e) {
                            return (
                                (typeof next === 'function') ?
                                next(e) : next
                            ).subscribe(o);
                        },
                        function() { o.onCompleted(); });
                });
            };
            
            return Observable;
        })(),
        Observer: (function() {
            
            function Observer(n, e, c) {
                this.onNext =       n || Rx.I;
                this.onError =      e || Rx.I;
                this.onCompleted =  c || Rx.I;
            }
            
            Observer.create = function(n, e, c) {
                return new Observer(n, e, c);
            };
            
            return Observer;
        })(),
        Subject: (function(){
            function Subject() {
                this.observers = [];
            }
            Subject.prototype.subscribe = function(subscriber) {
                var a = this.observers,
                    n = a.length;
                a[n] = subscriber;
                return {
                    dispose: function() {
                        a.splice(n, 1);
                    }
                }
            };
            Subject.prototype.onNext = function(x) {
                var listeners = this.observers.concat(),
                    i = -1, n = listeners.length;
                while(++i < n) {
                    listeners[i].onNext(x);
                }
            };
            Subject.prototype.onError = function(e) {
                var listeners = this.observers.concat(),
                    i  = -1, n = listeners.length;
                this.observers.length = 0;
                while(++i < n) {
                    listeners[i].onError(e);
                }
            };
            Subject.prototype.onCompleted = function() {
                var listeners = this.observers.concat(),
                    i  = -1, n = listeners.length;
                this.observers.length = 0;
                while(++i < n) {
                    listeners[i].onCompleted();
                }
            };
        })()
    };
}

module.exports = Rx;

