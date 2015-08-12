
/**
 * @constructor Observable
 */

 /**
 * The forEach method is a synonym for {@link Observable.prototype.subscribe} and triggers the execution of the Observable, causing the values within to be pushed to a callback. An Observable is like a pipe of water that is closed. When forEach is called, we open the valve and the values within are pushed at us.  These values can be received using either callbacks or an {@link Observer} object.
 * @name forEach
 * @memberof Observable.prototype
 * @function
 * @arg {?Observable~onNextCallback} onNext a callback that accepts the next value in the stream of values
 * @arg {?Observable~onErrorCallback} onError a callback that accepts an error that occurred while evaluating the operation underlying the {@link Observable} stream
 * @arg {?Observable~onCompletedCallback} onCompleted a callback that is invoked when the {@link Observable} stream has ended, and the {@link Observable~onNextCallback} will not receive any more values
 * @return {Subscription}
 */

 /**
 * The subscribe method is a synonym for {@link Observable.prototype.forEach} and triggers the execution of the Observable, causing the values within to be pushed to a callback. An Observable is like a pipe of water that is closed. When forEach is called, we open the valve and the values within are pushed at us.  These values can be received using either callbacks or an {@link Observer} object.
 * @name forEach
 * @memberof Observable.prototype
 * @function
 * @arg {?Observable~onNextCallback} onNext a callback that accepts the next value in the stream of values
 * @arg {?Observable~onErrorCallback} onError a callback that accepts an error that occurred while evaluating the operation underlying the {@link Observable} stream
 * @arg {?Observable~onCompletedCallback} onCompleted a callback that is invoked when the {@link Observable} stream has ended, and the {@link Observable~onNextCallback} will not receive any more values
 * @return {Subscription}
 */

/**
 * This callback accepts a value that was emitted while evaluating the operation underlying the {@link Observable} stream.
 * @callback Observable~onNextCallback
 * @param {Object} value the value that was emitted while evaluating the operation underlying the {@link Observable}
 */

/**
 * This callback accepts an error that occurred while evaluating the operation underlying the {@link Observable} stream. When this callback is invoked, the {@link Observable} stream ends and no more values will be received by the {@link Observable~onNextCallback}.
 * @callback Observable~onErrorCallback
 * @param {Error} error the error that occurred while evaluating the operation underlying the {@link Observable}
 */

 /**
 * This callback is invoked when the {@link Observable} stream ends. When this callback is invoked the {@link Observable} stream has ended, and therefore the {@link Observable~onNextCallback} will not receive any more values.
 * @callback Observable~onCompletedCallback
 */

/**
 * @constructor Subscription
 * @see {@link https://github.com/Reactive-Extensions/RxJS/tree/master/doc}
 */

/**
 * When this method is called on the Subscription, the Observable that created the Subscription will stop sending values to the callbacks passed when the Subscription was created.
 * @name dispose
 * @method
 * @memberof Subscription.prototype
 */
