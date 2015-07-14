var falcor = require("./../../lib/");
var Model = falcor.Model;
var expect = require('chai').expect;

describe('getVersionSync', function() {
    it('should get a version', function() {
        var model = new Model({cache: {hello: 'world'}});
        model._root.unsafeMode = true;
        var gen = model.getVersion('hello');
        expect(gen > 0).to.be.ok;
    });
    it('should get an undefined if no path exists.', function() {
        var model = new Model({cache: {hello: 'world'}});
        model._root.unsafeMode = true;
        var gen = model.getVersion('world');
        expect(gen === undefined).to.be.ok;
    });
});
