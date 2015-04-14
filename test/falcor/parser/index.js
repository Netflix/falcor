var parser = require('./../../../lib/falcor/operations/parser/parser');
var testRunner = require('../../testRunner');
describe.only('Parser', function() {
    it('should parse a simple key string', function() {
        var out = parser('one.two.three');
        testRunner.compare(['one', 'two', 'three'], out);
    });
    it('should parse a string with indexers', function() {
        var out = parser('one[0]');
        testRunner.compare(['one', 0], out);
    });
    it('should parse a string with indexers followed by dot separators.', function() {
        var out = parser('one[0].oneMore');
        testRunner.compare(['one', 0, 'oneMore'], out);
    });
    it('should parse a string with a range', function() {
        var out = parser('one[0..5].oneMore');
        testRunner.compare(['one', {from: 0, to: 5}, 'oneMore'], out);
    });
    it.only('should parse a string with a set of tokens', function() {
        var out = parser('one["test", \'test2\'].oneMore');
        testRunner.compare(['one', ['test', 'test2'], 'oneMore'], out);
    });
});
