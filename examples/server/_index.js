var express = require('express');
var app = express();

var Falcor = require('./../Falcor');
var Model = Falcor.Model;
var FalcorServer = require('falcor-server');
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
app.use('/member.json', FalcorServer.expressMiddleware(function(req, res) {
    return new Model({
        cache: cache
    });
}));

app.use(express.static('examples'));
app.listen(1337, function(err) {
    if (err) {
        throw err;
    }
});
