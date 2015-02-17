var Rx = require("rx");
var Observable = Rx.Observable;
var jsong = require("../../bin/Falcor.js");
var _ = require("lodash");
var noOp = function() {};

var LocalSource = module.exports = function(cache, options) {
    this._options = _.extend({
        miss: 0,
        onGet: noOp,
        onResults: noOp,
        wait: false
    }, options);
    this._missCount = 0;
    this.model = new jsong.Model({cache: cache});
};

LocalSource.prototype = {
    setModel: function(modelOrCache) {
        if (modelOrCache instanceof jsong.Model) {
            this.model = modelOrCache;
        } else {
            this.model = new jsong.Model({cache: modelOrCache});
        }
    },
    get: function(paths) {
        var self = this;
        var options = this._options;
        var miss = options.miss;
        var onGet = options.onGet;
        var onResults = options.onResults;
        var wait = +options.wait;
        var errorSelector = options.errorSelector;
        return Rx.Observable.create(function(observer) {
            function exec() {
                var results;
                var values = [{}];
                if (self._missCount >= miss) {
                    onGet(self, paths);
                    self.model._getPathsAsJSONG(self.model, paths, values, errorSelector);
                } else {
                    self._missCount++;
                }

                // always output all the paths
                var output = {
                    paths: paths,
                    values: {}
                };
                if (values[0]) {
                    output.values = values[0].jsong;
                }

                onResults(output);
                observer.onNext(output);
                observer.onCompleted();
            }
            
            if (wait > 0) {
                setTimeout(exec, wait);
            } else {
                exec();
            }
        });
    }
};

