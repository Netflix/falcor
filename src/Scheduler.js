falcor.ImmediateScheduler = ImmediateScheduler;

function ImmediateScheduler() {
}

ImmediateScheduler.prototype = {
    schedule: function(action) {
        action();
    }
};

falcor.TimeoutScheduler = TimeoutScheduler;

function TimeoutScheduler(delay) {
    this.delay = delay;
}

TimeoutScheduler.prototype = {
    schedule: function(action) {
        setTimeout(action, this.delay);
    }
};

module.exports = {
    TimeoutScheduler: TimeoutScheduler,
    ImmediateScheduler: ImmediateScheduler
};
