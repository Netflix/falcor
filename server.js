var express = require('express');
var app = express();

// Exports
module.exports = {
    coverage: coverage
};

function listen(port, launchWindow, cb) {
    return app.listen(port, function () {
        if (cb) {
            cb();
        }
        if (launchWindow) {
            require('child_process').exec('open http://localhost:' + port);
        }
    });
}

function coverage(port, launchWindow) {
    app.use(express.static('coverage/lcov-report'));
    return listen(port, launchWindow);
}

// Run if main
if (require.main === module) {
    var port = process.argv[2] || 8080;
    var run = process.argv[3];
    switch (run) {
        case 'examples':
            app.use(express.static('.'));
            app.get('/500', function(req, res) {
                res.send(500);
            });
            listen(port, true);
            break;
        case 'coverage':
        default:
            coverage(port, true);
            break;
    }
}

