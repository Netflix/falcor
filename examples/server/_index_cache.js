var express = require('express');
var app = express();

app.use(require('./urlencode'));

var falcor = require('./../falcor');
var Model = Falcor.Model;
var middleware = require('falcor-server').expressMiddleware;

var model = new falcor.Model({cache: {
    titlesById: {
        956: {
            id: 956,
            name: 'House of Cards',
            rating: 4,
            boxShot: 'http://cdn5.nflximg.net/webp/8265/13038265.webp'
        }
    },
    genreLists: [
        {
            name: 'Recently Watched',
            titles: [
                $ref('titlesById[956]')
                //, ... more titles
            ]
        },
        {
            name: 'New Releases',
            titles: [
                $ref('titlesById[956]')
                //, ... more titles
            ]
        }
        //, ... more genres
    ]
}});

app.use('/member.json', middleware(function(req, res) {
    return model;
}));

app.use(express.static('examples'));
app.listen(1337, function(err) {
    if (err) {
        throw err;
    }
});
