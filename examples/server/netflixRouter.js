var Router = require('./router');
var titleService = require('./titleService');
var ratingService = require('./ratingService');
var genreListService = require('./genreListsService');
var Model = require('./../Falcor').Model;
var Promise = require('promise');

function NetflixRouter(req, res) {
    this.req = req;
    this.res = res;
}

module.exports = NetflixRouter;

NetflixRouter.prototype = new Router([
    {
        route: 'genreLists[{range}].name',
        get: function(pathSet) {

            // here is what a pathSet might look
            // matches: ['genreLists', {from: 0, to: 1}, 'name']
            // jsong: {
            //      genreLists: {
            //          0: { name: 'Recently Watched' },
            //          1: { name: 'New Releases' }
            //      }
            // }
            var rows = pathSet[1];
            return genreListService.
                get(rows, 'name').
                then(function(genreListArray) {
                    var genreLists = {};
                    genreListArray.forEach(function(gL) {

                    });
                });
        }
    }
]);
