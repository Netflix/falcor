var Rx = require("rx/dist/rx");
var Disposable = Rx.Disposable;

function TimeoutScheduler(delay) {
    this.delay = delay;
}

TimeoutScheduler.prototype.schedule = function schedule(action) {
    var id = setTimeout(action, this.delay);
    return Disposable.create(function() {
        if (id !== void 0) {
            clearTimeout(id);
            id = void 0;
        }
    });
};

TimeoutScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    var self = this;
    var id = setTimeout(function() {
        action(self, state);
    }, this.delay);
    return Disposable.create(function() {
        if (id !== void 0) {
            clearTimeout(id);
            id = void 0;
        }
    });
};

module.exports = TimeoutScheduler;
