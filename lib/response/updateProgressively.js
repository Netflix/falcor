var is_function = require("falcor/support/is-function");

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

        function onAggregateNext(observer) {

            var hasValue = observer.hasValue;
            var hasError = observer.hasError;
            var isCompleted = observer.isCompleted;
            var isProgressive = observer.isProgressive;

            if (hasValue && (isCompleted || isProgressive)) {
                var model = observer.model;
                var values = observer.values;
                var selector = observer.selector;
                if (is_function(selector)) {
                    destOnNext.call(observer, selector.apply(model, values.map(pluckJSON)));
                } else {
                    destOnNext.call(observer, values[0]);
                }
            }

            if (isCompleted) {
                if (hasError) {
                    onError(observer.errors);
                } else {
                    onCompleted();
                }
            } else {
                onError(observer);
            }
        }
    });
};

function pluckJSON(env) {
    return env.json;
};
