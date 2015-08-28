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

        expect(model.batch().setCache);
    });

    it('should ensure that cache remains consistent amoung its clones.', function() {
        var source = new Model({
            cache: {
                lolomo: {
                    summary: 'this is a lolomo'
                }
            }
        });
        var clone = source._clone({});
        var resSource = source._getPathValuesAsPathMap(source, [['lolomo', 'summary']], [{}]);
        var resClone = clone._getPathValuesAsPathMap(clone, [['lolomo', 'summary']], [{}]);
        expect(resClone).to.deep.equals(resSource);

        source.setCache({
            lolomo: {
                name: 'Terminator 2'
            }
        });
        resSource = source._getPathValuesAsPathMap(source, [['lolomo', 'name']], [{}]);
        resClone = clone._getPathValuesAsPathMap(clone, [['lolomo', 'name']], [{}]);
        expect(resClone).to.deep.equals(resSource);
    });
});
