var falcor = require('./../../lib');
var Model = falcor.Model;
var expect = require('chai').expect;
var sinon = require('sinon');
var noOp = function() {};

describe('Order of operations.', function() {
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
});
