var Rx = require("rx");
var Observable = Rx.Observable;
var falcor = require("./../../lib/");
var UnoDataSource = module.exports = function(cache) {
    this.model = new falcor.Model({cache: cache});
};

UnoDataSource.prototype = {
    get: function(paths) {
        var self = this;
        return Rx.Observable.create(function(observer) {
            var results;
            var out = [{}];
            var error;
            try {
                results = self.model._getPathValuesAsJSONG(self.model, paths.slice(0, 1), out).values;
            } catch(e) {
                error = e;
                results = null;
            }
            if (results) {
                if (results[0]) {
                    // returns all the paths even though they are missing
                    observer.onNext({values: results[0].jsonGraph, paths: paths});
                } else {
                    observer.onNext(undefined);
                }
                observer.onCompleted();
            } else {
                if (error) {
                    observer.onError(error);
                }
            }
        });
    }
};

