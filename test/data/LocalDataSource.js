const Rx = require("rx");
const falcor = require("./../../lib/");
const _ = require("lodash");
const noOp = function(a, b, c) { return c; };

const LocalSource = module.exports = function(cache, options) {
    this._options = _.extend({
        miss: 0,
        onGet: noOp,
        onSet: noOp,
        onResults: noOp,
        // wait: undefined,
        materialize: false
    }, options);
    this._missCount = 0;
    this.model = new falcor.Model({cache});

    if (this._options.materialize) {
        this.model = this.model._materialize();
    }
};

LocalSource.prototype = {
    setModel(modelOrCache) {
        if (modelOrCache instanceof falcor.Model) {
            this.model = modelOrCache;
        } else {
            this.model = new falcor.Model({cache: modelOrCache});
        }
    },
    get(paths, dsRequestOpts) {
        const self = this;
        const options = this._options;
        const miss = options.miss;
        const onGet = options.onGet;
        const onResults = options.onResults;
        const wait = options.wait;
        const errorSelector = options.errorSelector;
        return Rx.Observable.create(observer => {
            function exec() {
                const values = [{}];
                if (self._missCount >= miss) {
                    onGet(self, paths, dsRequestOpts);
                    self.model._getPathValuesAsJSONG(self.model, paths, values, errorSelector);
                } else {
                    self._missCount++;
                }

                // always output all the paths
                const output = {
                    // paths: paths,
                    jsonGraph: {}
                };
                if (values[0]) {
                    output.jsonGraph = values[0].jsonGraph;
                }

                onResults(output);
                observer.onNext(output);
                observer.onCompleted();
            }
            if (wait === undefined) {
                exec();
            } else {
                setTimeout(exec, wait);
            }
        });
    },
    set(jsongEnv, dsRequestOpts) {
        const self = this;
        const options = this._options;
        const onSet = options.onSet;
        const onResults = options.onResults;
        const wait = options.wait;
        const errorSelector = options.errorSelector;
        return Rx.Observable.create(observer => {
            function exec() {
                const seed = [{}];
                const tempModel = new falcor.Model({
                    cache: jsongEnv.jsonGraph,
                    errorSelector});
                jsongEnv = onSet(self, tempModel, jsongEnv, dsRequestOpts);

                tempModel.set(jsongEnv).subscribe();
                tempModel._getPathValuesAsJSONG(
                    tempModel,
                    jsongEnv.paths,
                    seed);

                // always output all the paths
                onResults(seed[0]);
                observer.onNext(seed[0]);
                observer.onCompleted();
            }

            if (wait === undefined) {
                exec();
            } else {
                setTimeout(exec, wait);
            }
        });
    },
    call(path, args, suffixes, paths) {
        return Rx.Observable.empty();
    }
};

