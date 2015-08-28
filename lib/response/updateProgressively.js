var isFunction = require("falcor/support/isFunction");

module.exports = function updateProgressively() {
    var source = this;
    return new source.constructor(function subscribeProgressively(observer) {

        var destOnNext = observer.onNext;
        var destOnError = observer.onError;
        var destOnCompleted = observer.onCompleted;

        observer.onNext = observer.asPathValues ? onPathValueNext : onAggregateNext;
        observer.onError = onError;
        observer.onCompleted = onCompleted;

        return source.subscribe(observer);

        function onError(e) {
            destOnError.call(observer, e);
        }

        function onCompleted() {
            destOnCompleted.call(observer);
        }

        function onPathValueNext(pathValue) {
            destOnNext.call(observer, pathValue);
        }

        function onAggregateNext(observer2) {

            var hasValue = observer2.hasValue;
            var hasError = observer2.hasError;
            var isCompleted = observer2.isCompleted;
            var isProgressive = observer2.isProgressive;

            if (hasValue && (isCompleted || isProgressive)) {
                var model = observer2.model;
                var values = observer2.values;
                var selector = observer2.selector;
                if (isFunction(selector)) {
                    destOnNext.call(observer2, selector.apply(model, values.map(pluckJSON)));
                } else {
                    destOnNext.call(observer2, values[0]);
                }
            }

            if (isCompleted) {
                if (hasError) {
                    onError(observer2.errors);
                } else {
                    onCompleted();
                }
            } else {
                onError(observer2);
            }
        }
    });
};

function pluckJSON(env) {
    return env.json;
}
