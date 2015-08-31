var Rx = require("rx");
var TriggerDataSource = function TriggerDataSource(response) {
    this._triggers = [];
    this._idx = -1;

    if (Array.isArray(response)) {
        this._response = response;
    } else {
        this._response = [response];
    }
    this._length = this._response.length;
};

TriggerDataSource.prototype = {
    get: function(paths) {
        var self = this;
        return Rx.Observable.create(function(observer) {
            self._triggers.push(function() {
                var out = self._response[++self._idx % self._length];
                if (typeof out === 'function') {
                    out = out();
                }
                observer.onNext(out);
                observer.onCompleted();
            });
        });
    },
    trigger: function() {
        this._triggers.forEach(function(t) {
            t();
        });
        this._triggers = [];
    }
};

module.exports = TriggerDataSource;
