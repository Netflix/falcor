var express = require('express');
var app = express();
var FalcorServer = require('falcor-server');
var model = new Falcor.Model({cache: {
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
}});

var fullCacheServer = new FalcorServer(fullCacheModel);

// Simple middleware to handle get/post
app.use('/member.json', function(req, res, next) {
    fullCacheServer.fromHttpRequest(req, function(err, jsongString) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(jsongString);
        }
        next();
    });
});

app.listen(1337, function(err) {
    if (err) {
        throw err;
        return;
    }
});
