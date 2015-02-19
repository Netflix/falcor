var jsong = require("../../bin/Falcor");
var R = require('falcor-router');
var Routes = require('../data/routes');
var Rx = require("rx");
var chai = require("chai");
var expect = chai.expect;

global.falcor = jsong;

// TODO: Router, as of now, assumes that falcor is GLOBAL

describe.only("Integration", function() {
    it('should match a simple route in the virtual path.', function(done) {
        var r = new R(Routes().Videos.Summary);
        var model = new jsong.Model({router: r});
        
        model.
            get(['videos', 'summary']).
            subscribe(function(x) {
                debugger;
            }, done, done);
    });
});
