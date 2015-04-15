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
            this._ratings = routes[i].get;
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
                obs = self._ratings.call(self, p);
            } else if (hasTitles) {
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

