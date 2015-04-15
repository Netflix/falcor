var express = require('express');
var app = express();

var Falcor = require('./../Falcor');
var FalcorServer = require('falcor-server');
var NetflixRouter = require('./netflixRouter');
var cache = {
    genreLists: [
        {
            name: 'Recently Watched',
            titles: [
                {
                    id: 1007,
                    name: 'Bloodline',
                    rating: 4,
                    boxshot: '../assets/bl.webp'
                }
                //, ... more titles
            ]
        },
        {
            name: 'New Releases',
            titles: [
                {
                    id: 956,
                    name: 'House of Cards',
                    rating: 4,
                    boxshot: '../assets/hoc.webp'
                }
                //, ... more titles
            ]
        }
        //, ... more genres
    ]
};
app.use('/member.json', FalcorServer.ExpressMiddleware(function(req, res) {
    return new Model({
        //cache: cache, No more cache!
        source: new NetflixRouter(req, res)
    });
}));

app.use(express.static('examples'));
app.listen(1337, function(err) {
    if (err) {
        throw err;
    }
});
