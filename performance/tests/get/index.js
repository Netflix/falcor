var noOp = function() {};
var debug = false;

module.exports = {

    syncSimple: function(model, format) {
        return function() {
            model.getValueSync(['videos', 1234, 'summary']);
        };
    },

    syncReference: function(model) {
        return function() {
            model.getValueSync(['videos', 1234, 'summary']);
        };
    },

    simple: function(model, format) {
        var simpleRequest = [
            ['videos', 1234, 'summary']
        ];
        switch (format) {
            case 'JSON':
                return function(done) {
                    var obs = model.
                        get.apply(model, simpleRequest.concat(function(a) {
                            return a;
                        }));
                    run(obs, format, done);
                };
            case 'JSONG':
                return function(done) {
                    run(
                        model.get.apply(model, simpleRequest).toJSONG(),
                        format,
                        done);
                };
            case 'PathMap':
                return function(done) {
                    run(
                        model.get.apply(model, simpleRequest),
                        format,
                        done);
                };
            case 'Value':
                return function(done) {
                    run(
                        model.get.apply(model, simpleRequest).toPathValues(),
                        format,
                        done);
                };
        }
    },

    reference: function(model, format) {
        var referenceRequest = [
            ['genreList', 0, 0, 'summary']
        ];
        switch (format) {
            case 'JSON':
                return function(done) {
                    var obs = model.
                        get.apply(model, referenceRequest.concat(function(a) {
                            return a;
                        }));
                    run(obs, format, done);
                };
            case 'JSONG':
                return function(done) {
                    run(
                        model.get.apply(model, referenceRequest).toJSONG(),
                        format,
                        done);
                };
            case 'PathMap':
                return function(done) {
                    run(
                        model.get.apply(model, referenceRequest),
                        format,
                        done);
                };
            case 'Value':
                return function(done) {
                    run(
                        model.get.apply(model, referenceRequest).toPathValues(),
                        format,
                        done);
                };
        }
    },

    complex: function(model, format) {
        var complexRequest = [
            ['genreList', 0, {to:9}, 'summary']
        ];
        switch (format) {
            case 'JSON':
                return function(done) {
                    var obs = model.
                        get.apply(model, complexRequest.concat(function(a) {
                            return a;
                        }));
                    run(obs, format, done);
                };
            case 'JSONG':
                return function(done) {
                    run(
                        model.get.apply(model, complexRequest).toJSONG(),
                        format,
                        done);
                };
            case 'PathMap':
                return function(done) {
                    run(
                        model.get.apply(model, complexRequest),
                        format,
                        done);
                };
            case 'Value':
                return function(done) {
                    run(
                        model.get.apply(model, complexRequest).toPathValues(),
                        format,
                        done);
                };
        }
    },

    scrollGallery: function(model, format) {
        var scrollingRequest = [
            ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
            ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
            ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
            ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
        ];
        // for (var i = 0; i < 40;)
        switch (format) {
            case 'JSON':
                return function(done) {
                    var obs = model.
                        get.apply(model, scrollingRequest.concat(function(a, b, c, d) {
                            return [a, b, c, d];
                        }));
                    run(obs, format, done);
                };
            case 'JSONG':
                return function(done) {
                    run(
                        model.get.apply(model, scrollingRequest).toJSONG(),
                        format,
                        done);
                };
            case 'PathMap':
                return function(done) {
                    run(
                        model.get.apply(model, scrollingRequest),
                        format,
                        done);
                };
            case 'Value':
                return function(done) {
                    run(
                        model.get.apply(model, scrollingRequest).toPathValues(),
                        format,
                        done);
                };
        }
    },

};

function run(obs, format, done) {
    obs.
        subscribe(function(next) {
            debug && console.log(format, JSON.stringify(next));
        }, noOp, function() {
            done && done.resolve();
        });
}
