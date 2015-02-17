jsong.ImmediateScheduler = ImmediateScheduler;

function ImmediateScheduler() {
}

ImmediateScheduler.prototype = {
    schedule: function(action) {
        action();
    }
};

jsong.TimeoutScheduler = TimeoutScheduler;

function TimeoutScheduler(delay) {
    this.delay = delay;
}

TimeoutScheduler.prototype = {
    schedule: function(action) {
        setTimeout(action, this.delay);
    }
};

