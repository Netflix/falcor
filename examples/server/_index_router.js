var express = require('express');
var app = express();

var Falcor = require('./../Falcor');
var Model = Falcor.Model;
var FalcorServer = require('falcor-server');
var NetflixRouter = require('./netflixRouter');

app.use('/member.json', FalcorServer.expressMiddleware(function(req, res) {
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
