var express = require('express');
var app = express();

// middleware for posts
app.use(require('./urlencode'));

var falcor = require('./../falcor');
var Model = falcor.Model;
var middleware = require('falcor-server').expressMiddleware;
var NetflixRouter = require('./netflixRouter');

app.use('/member.json', middleware(function(req, res) {
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
