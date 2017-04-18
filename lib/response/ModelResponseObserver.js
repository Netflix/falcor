var noop = require("./../support/noop");

/**
 * A ModelResponseObserver conform to the Observable's Observer contract. It accepts either an Observer or three optional callbacks which correspond to the Observer methods onNext, onError, and onCompleted.
 * The ModelResponseObserver wraps an Observer to enforce a variety of different invariants including:
 * 1. onError callback is only called once.
 * 2. onCompleted callback is only called once.
 * @constructor ModelResponseObserver
*/
function ModelResponseObserver(
    onNextOrObserver,
    onErrorFn,
    onCompletedFn
) {
    // if callbacks are passed, construct an Observer from them. Create a NOOP function for any missing callbacks.
    if (!onNextOrObserver || typeof onNextOrObserver !== "object") {
        this._observer = {
            onNext: (
                typeof onNextOrObserver === "function"
                    ? onNextOrObserver
                    : noop
            ),
            onError: (
                typeof onErrorFn === "function"
                    ? onErrorFn
                    : noop
            ),
            onCompleted: (
                typeof onCompletedFn === "function"
                    ? onCompletedFn
                    : noop
            )
        };
    }
    // if an Observer is passed
    else {
        this._observer = {
            onNext: typeof onNextOrObserver.onNext === "function" ? function(value) { onNextOrObserver.onNext(value); } : noop,
            onError: typeof onNextOrObserver.onError === "function" ? function(error) { onNextOrObserver.onError(error); } : noop,
            onCompleted: (
                typeof onNextOrObserver.onCompleted === "function"
                    ? function() { onNextOrObserver.onCompleted(); }
                    : noop
            )
        };
    }
}

ModelResponseObserver.prototype = {
    onNext: function(v) {
        if (!this._closed) {
            this._observer.onNext(v);
        }
    },
    onError: function(e) {
        if (!this._closed) {
            this._closed = true;
            this._observer.onError(e);
        }
    },
    onCompleted: function() {
        if (!this._closed) {
            this._closed = true;
            this._observer.onCompleted();
        }
    }
};

module.exports = ModelResponseObserver;
