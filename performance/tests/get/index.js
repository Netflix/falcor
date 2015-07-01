var noOp = function() {};

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

    startup: function(model, format) {
        var startupRequest = [
            ["startup"],
            ["appconfig"],
            ["languages"],
            ["geolocation"],
            ["user"],
            ["uiexperience"],
            ["lolomo", "summary"],
            ["lolomo", {"to": 60}, "summary"],
            ["lolomo", 0, "billboardData"],
            ["lolomo", 0, 0, "postcard"],
            ["profilesList", {"to": 4}, "avatar", "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
            ["profilesList", {"to": 4}, "summary"]            ["profilesList", "summary"],
            ["profilesList", "availableAvatarsList", {"to": 18}, "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
            ["profilesList", "availableAvatarsList", {"to": 18}, "summary"],
            ["profilesList", "availableAvatarsList", "summary"],
            ["profiles", "hasSeenPromoGate"],
            ["lolomo", "maxExperience"],
            ["lolomo", 0, 0, "evidence"],
            ["lolomo", 0, 0, "item", ["info", "summary", "outline", "rating", "heroImages"]]
        ];

        switch (format) {
            case 'JSON':
                return function(done) {
                    model.get.apply(model, startupRequest, function(a,b,c,d,e,f,g,h,i,h,j,k,l,m,n,o,p,q,r,s,t) {
                        done && done.resolve();
                    });
                };
            case 'JSONG':
                return function(done) {
                    model.get.apply(model, startupRequest).
                        toJSONG().
                        subscribe(function(next) {
                            done && done.resolve();
                        });
                };
            case 'PathMap':
                return function(done) {
                    model.get.apply(model, startupRequest).
                        subscribe(function(next) {
                            done && done.resolve();
                        });
                };
            case 'Value':
                return function(done) {
                    model.get.apply(model, startupRequest).
                        toPathValues().
                        subscribe(noOp, noOp, function(next) {
                            done && done.resolve();
                        });
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
                    model.
                        get.apply(model, scrollingRequest.concat(function(a,b,c,d) {
                            done && done.resolve();
                        })).
                        subscribe();
                };
            case 'JSONG':
                return function(done) {
                    model.get.apply(model, scrollingRequest).
                        toJSONG().
                        subscribe(function(next) {
                            done && done.resolve();
                        });
                };
            case 'PathMap':
                return function(done) {
                    model.get.apply(model, scrollingRequest).
                        subscribe(function(next) {
                            done && done.resolve();
                        });
                };
            case 'Value':
                return function(done) {
                    model.get.apply(model, scrollingRequest).
                        toPathValues().
                        subscribe(noOp, noOp, function(next) {
                            done && done.resolve();
                        });
                };
        }
    },

    simple: function(model, format) {
        var simpleRequest = [
            ['videos', 1234, 'summary']
        ];
        switch (format) {
            case 'JSON':
                return function(done) {
                    model.get.apply(model, simpleRequest, function(a) {
                        done && done.resolve();
                    });
                };
            case 'JSONG':
                return function(done) {
                    model.get.apply(model, simpleRequest).
                        toJSONG().
                        subscribe(function(next) {
                            done && done.resolve();
                        });
                };
            case 'PathMap':
                return function(done) {
                    model.get.apply(model, simpleRequest).
                        subscribe(function(next) {
                            done && done.resolve();
                        });
                };
            case 'Value':
                return function(done) {
                    model.get.apply(model, simpleRequest).
                        toPathValues().
                        subscribe(function(next) {
                            done && done.resolve();
                        });
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
                    model.get.apply(model, referenceRequest, function(a) {
                        done && done.resolve();
                    });
                };
            case 'JSONG':
                return function(done) {
                    model.get.apply(model, referenceRequest).
                        toJSONG().
                        subscribe(function(next) {
                            done && done.resolve();
                        });
                };
            case 'PathMap':
                return function(done) {
                    model.get.apply(model, referenceRequest).
                        subscribe(function(next) {
                            done && done.resolve();
                        });
                };
            case 'Value':
                return function(done) {
                    model.get.apply(model, referenceRequest).
                        toPathValues().
                        subscribe(function(next) {
                            done && done.resolve();
                        });
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
                    model.get.apply(model, complexRequest, function(a) {
                        done && done.resolve();
                    });
                };
            case 'JSONG':
                return function(done) {
                    model.get.apply(model, complexRequest).
                        toJSONG().
                        subscribe(function(next) {
                            done && done.resolve();
                        });
                };
            case 'PathMap':
                return function(done) {
                    model.get.apply(model, complexRequest).
                        subscribe(function(next) {
                            done && done.resolve();
                        });
                };
            case 'Value':
                return function(done) {
                    model.get.apply(model, complexRequest).
                        toPathValues().
                        subscribe(function(next) {
                            done && done.resolve();
                        });
                };
        }
    }
};
