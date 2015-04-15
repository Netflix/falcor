var express = require('express');
var Router = require('./router');
var app = express();

// middleware for posts
app.use(require('body-parser').json());

app.use(express.static('examples'));
app.listen(1337, function(err) {
    if (err) {
        throw err;
    }
});
