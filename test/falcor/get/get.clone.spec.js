var falcor = require('./../../../lib');
var Model = falcor.Model;
var expect = require('chai').expect;
var sinon = require('sinon');
var noOp = function() {};

describe('Caching Issues', function() {
    it('should be able to use a model as a source.', function() {
        var source = new Model({
            cache: {
                lolomo: {
                    summary: {}
                }
            }
        }).asDataSource();

        var model = new Model({source: source});

        try {
            model.
                batch().
                setCache(undefined).
                subscribe();
        } catch (e) {
            var setCache = e.message.indexOf('setCache') >= 0;
            var modelObject = e.message.indexOf('#<Model>') >= 0;
            expect(setCache && modelObject).to.be.ok;
            return ;
        }
        expect(false, 'should never get here').to.be.ok;
    });

    it('should ensure that cache remains consistent amoung its clones.', function() {
        var source = new Model({
            cache: {
                lolomo: {
                    summary: 'this is a lolomo'
                }
            }
        });
        var clone = source.clone({});
        source._root.unsafeMode = clone._root.unsafeMode = true;
        var resSource = source._getPathValuesAsJSON(source, [['lolomo', 'summary']], [{}]);
        var resClone = clone._getPathValuesAsJSON(clone, [['lolomo', 'summary']], [{}]);
        expect(resClone).to.deep.equals(resSource);

        source.setCache({
            lolomo: {
                name: 'Terminator 2'
            }
        });
        resSource = source._getPathValuesAsJSON(source, [['lolomo', 'name']], [{}]);
        resClone = clone._getPathValuesAsJSON(clone, [['lolomo', 'name']], [{}]);
        expect(resClone).to.deep.equals(resSource);
    });
});
