var express = require('express');
var app = express();

app.use(require('./urlencode'));

var Falcor = require('./../Falcor');
var Model = Falcor.Model;
var FalcorServer = require('falcor-server');

var $ref = Model.ref;
var model = new Model({cache: {
    titlesById: {
        956: {
            name: 'House of Cards',
            rating: 4,
            boxshot: '../assets/hoc.webp'
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

app.use('/member.json', FalcorServer.expressMiddleware(function(req, res) {
    return model;
}));

app.use(express.static('examples'));
app.listen(1337, function(err) {
    if (err) {
        throw err;
    }
});
