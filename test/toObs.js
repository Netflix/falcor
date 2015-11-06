var Rx = require('rx');
var Observable = Rx.Observable;
module.exports = function toObservable(response) {
    return Observable.create(function(observer) {
        return response.subscribe(observer);
    });
};
