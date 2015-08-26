var get = require('./../lib/get');
var Model = require('./../lib');

module.exports = function(tests) {
    var only = false;
    tests.forEach(function(test) {
        if (test.only) {
            only = test;
        }
    });

    if (only) {
        return run(only);
    }

    tests.forEach(function(test) {
        run(test);
    });
};

function run(test) {
    it(test.it, function() {
        var isJSONG = test.isJSONG;
        var input = test.input;
        var expectedOutput = test.output;
        var isJSONInput = Array.isArray(input[0]);
        var fnKey = 'getWith' +
            isJSONInput ? 'JSON' : 'Paths' +
            'As' +
            isJSONG ? 'JSONG' : 'PathMap';
        var fn = get[fnKey];
        var model = new Model();

        var seed = [{}];
        var out = fn(model, input, seed);
        expect(seed).to.deep.equals(expectedOutput);
    });
}
