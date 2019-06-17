var falcor = require("./../../../lib/");
var Model = falcor.Model;

describe('getVersionSync', function() {
    it('should get a version', function() {
        var model = new Model({cache: {hello: 'world'}});
        model._root.unsafeMode = true;
        var version = model.getVersion('hello');
        expect(version >= 0).toBe(true);
    });
    it('should get a version on the root model', function() {
        var model = new Model({cache: {hello: 'world'}, unsafeMode: true});
        var version = model.getVersion();
        expect(version >= 0).toBe(true);
    });
    it('should get -1 if no path exists.', function() {
        var model = new Model({cache: {hello: 'world'}});
        model._root.unsafeMode = true;
        var version = model.getVersion('world');
        expect(version === -1).toBe(true);
    });
});
