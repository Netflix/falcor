var Rx = require('rx');

function Router(routes) {
    for (var i = 0; i < 2; i++) {
        var hasTitles = routes[i].route.indexOf('titles') === 0;
        var hasRatings = routes[i].route.indexOf('rating') > 0;

        if (hasTitles && hasRatings) {
            this._ratings = routes[i].get;
        }
        else if (hasTitles) {
            this._nameAndBoxShots = routes[i].get;
        }
        else {
            this._genreLists = routes[i].get;
        }
    }
}

Router.prototype = {
    get: function(optimizedPaths) {

        // must use Rx for now, the Thenable interface will make havoc on
        // our codes.
        return Rx.Observable.from( ... );
    }
};


module.exports = Router;

