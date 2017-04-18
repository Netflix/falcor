var noop = require("./../support/noop");

function ModelResponseObserver(
    onNextOrObserver,
    onErrorFn,
    onCompletedFn,
    disposable
) {
    if (!onNextOrObserver || typeof onNextOrObserver !== "object") {
        this._observer = {
            onNext: (
                onNextOrObserver
                    ? function onNext(v) {
                          onNextOrObserver(v);
                      }
                    : noop
            ),
            onError: (
                onErrorFn
                    ? function onError(e) {
                          onErrorFn(e);
                      }
                    : noop
            ),
            onCompleted: (
                onCompletedFn
                    ? function onCompleted() {
                          onCompletedFn();
                      }
                    : noop
            )
        };
    } else {
        this._observer = {
            onNext: typeof onNextOrObserver.onNext === "function" ? onNextOrObserver.onNext.bind(onNextOrObserver) : noop,
            onError: typeof onNextOrObserver.onError === "function" ? onNextOrObserver.onError.bind(onNextOrObserver) : noop,
            onCompleted: (
                typeof onNextOrObserver.onCompleted === "function"
                    ? onNextOrObserver.onCompleted.bind(onNextOrObserver)
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
