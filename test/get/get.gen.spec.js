var jsong = require("../../index");
var Model = jsong.Model;
var expect = require('chai').expect;

describe('getGenerationSync', function() {
    it('should get a generation', function() {
        var model = new Model({cache: {hello: 'world'}});
        model._root.unsafeMode = true;
        var gen = model.getGeneration('hello');
        expect(gen > 0).to.be.ok;
    });
    it('should get an undefined if no path exists.', function() {
        var model = new Model({cache: {hello: 'world'}});
        model._root.unsafeMode = true;
        var gen = model.getGeneration('world');
        expect(gen === undefined).to.be.ok;
    });
});
