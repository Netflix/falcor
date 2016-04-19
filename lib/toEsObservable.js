/**
 * FromEsObserverAdapter is an adpater from an ES Observer to an Rx 2 Observer
 * @constructor FromEsObserverAdapter
*/
function FromEsObserverAdapter(esObserver) {
    this.esObserver = esObserver;
}

FromEsObserverAdapter.prototype = {
    onNext: function onNext(value) {
        if (typeof this.esObserver.next === "function") {
            this.esObserver.next(value);
        }
    },
    onError: function onError(error) {
        if (typeof this.esObserver.error === "function") {
            this.esObserver.error(error);
        }
    },
    onCompleted: function onCompleted() {
        if (typeof this.esObserver.complete === "function") {
            this.esObserver.complete();
        }
    }
};

/**
 * ToEsSubscriptionAdapter is an adpater from the Rx 2 subscription to the ES subscription
 * @constructor ToEsSubscriptionAdapter
*/
function ToEsSubscriptionAdapter(subscription) {
    this.subscription = subscription;
}

ToEsSubscriptionAdapter.prototype.unsubscribe = function unsubscribe() {
    this.subscription.dispose();
};


function toEsObservable(_self) {
    return {
        subscribe: function subscribe(observer) {
            return new ToEsSubscriptionAdapter(_self.subscribe(new FromEsObserverAdapter(observer)));
        }
    };
}

module.exports = toEsObservable;
