var jsong = require("../../bin/Falcor");
var Model = jsong.Model;
var TestRunner = require('../testRunner');
var Cache = require('../data/Cache');

describe("Special Cases", function() {
    it("should have the same output.", function() {
        var model = new Model({cache: Cache()});
        var output1 = model._getPathSetsAsValues(model, [['genreList', 2, 'null']], [{}]);
        var output2 = model._getPathSetsAsValues(model, [['genreList', 2, 'null']], [{}]);
        
        TestRunner.compare(output1, output2);
    });
});

