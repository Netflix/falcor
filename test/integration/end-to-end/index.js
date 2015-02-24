var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
global.XMLHttpRequest = XMLHttpRequest;
var XMLHttpSource = require('falcor-browser');
var source = new XMLHttpSource('http://localhost:1337/falcor');
var falcor = require('../../../bin/Falcor');
var noOp = function() {};

describe("End-to-End", function() {
    var server = require('./express-falcor')(1337).publishValue();
    var dispose = server.connect();

    it('should perform a simple get.', function(done) {
        var model = new falcor.Model({
            source: source
        });
        
        model.
            get(['videos', 1234, 'summary'], function() {
                var video = this.getValueSync(['videos', 1234, 'summary']);
                debugger;
            }).
            take(1).
            subscribe(noOp, done, done);
    });
    
    after(function() {
        dispose.dispose();
    });
});

