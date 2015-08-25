var Rx = require('rx');
var TriggerDataSource = function TriggerDataSource(response) {
    this.response = response;
    this._triggers = [];
};

TriggerDataSource.prototype = {
    get: function(paths) {
        var self = this;
        return Rx.Observable.create(function(observer) {
            self._triggers.push(function() {
                observer.onNext(self.response);
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
