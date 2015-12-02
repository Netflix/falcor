var ModelRoot = require('./../../lib/ModelRoot');
var comparator = new ModelRoot({}).comparator;
var jsonGraphUtil = require('falcor-json-graph');
var atom = jsonGraphUtil.atom;
var error = jsonGraphUtil.error;
var expect = require('chai').expect;
describe('ModelRoot#comparator', function() {
    it('should validate that two equal values are true', function() {
        expect(comparator(5, 5)).to.be.ok;
    });
    it('should validate that two equivalent objects are true', function() {
        var obj = {};
        expect(comparator(obj, obj)).to.be.ok;
    });
    it('should validate that two equal type values are the same.', function() {
        var type1 = atom(5);
        var type2 = atom(5);
        expect(comparator(type1, type2)).to.be.ok;
    });
    it('should validate that two unequal type values are false.', function() {
        var type1 = atom(5);
        var type2 = atom(6);
        expect(comparator(type1, type2)).to.not.be.ok;
    });
    it('should be false because the types dont match', function() {
        var type1 = atom(5);
        var type2 = error(5);
        expect(comparator(type1, type2)).to.not.be.ok;
    });
    it('should be false because the expiry times differ', function() {
        var type1 = atom(5);
        var type2 = atom(5);
        type1.$expires = Date.now();
        expect(comparator(type1, type2)).to.not.be.ok;
    });
});
