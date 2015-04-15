var Rx = require('rx');
var Falcor = require('./../Falcor');
var Model = Falcor.Model;
var Promise = require('promise');

function Router(routes) {
    for (var i = 0; i < routes.length; i++) {
        var hasTitles = routes[i].route.indexOf('title') === 0;
        var hasRatings = routes[i].route.indexOf('rating') > 0;
        var hasName = routes[i].route.indexOf('name') > 0;

        if (hasTitles && hasRatings) {
            this._ratings = routes[i];
        } else if (hasTitles) {
            this._nameAndBoxShots = routes[i].get;
        } else if (hasName) {
            this._genreListNames = routes[i].get;
        } else {
            this._genreListTitles = routes[i].get;
        }
    }
}

Router.prototype = {
    get: function(optimizedPaths) {
        return this._execute(optimizedPaths, 'get');
    },
    set: function(jsong) {
        var model = new Model({cache: jsong.jsong});
        var path = jsong.paths[0];
        model._root.unsafeMode = true;
        var rating = model.getValueSync(path);

        return this._execute([path], 'set', rating);
    },
    _execute: function(optimizedPaths, method, args) {

        // must use Rx for now, the Thenable interface will make havoc on
        // our codes.
        var model = new Model();
        var self = this;
        var obs = optimizedPaths.map(function(p) {
            var obs;
            var last = p[p.length - 1];
            var hasTitles = p[0].indexOf('title') === 0;
            var hasRatings = last.indexOf('rating') === 0;
            var hasName = last.indexOf('name') === 0;
            if (hasTitles && hasRatings) {
                p[1] = Array.isArray(p[1]) && p[1] || [p[1]];
                obs = self._ratings[method].call(self, p, args);
            } else if (hasTitles) {
                p[1] = Array.isArray(p[1]) && p[1] || [p[1]];
                p[2] = Array.isArray(p[2]) && p[2] || [p[2]];
                obs = self._nameAndBoxShots.call(self, p);
            } else if (hasName && p.length === 3) {
                obs = self._genreListNames.call(self, p);
            } else {
                obs = self._genreListTitles.call(self, p);
                p = p.slice(0, p.length - 1);
            }

            return Rx.Observable.
                fromPromise(obs).
                map(function(x) {
                    x.paths = [p];
                    return x;
                });
        });

        // this is for get
        return Rx.Observable.
            from(obs).
            mergeAll().
            flatMap(function(jsong) {
                return model.set(jsong).toJSONG();
            }).
            // i thought there was finalValue
            reduce(function(paths, jsongEnv) {
                paths = paths.concat(jsongEnv.paths);
                return paths;
            }, []).
            flatMap(function(paths) {
                return model.get.apply(model, paths).toJSONG();
            });
    }
};


module.exports = Router;

