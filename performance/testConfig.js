var models = require('./models')();

var getTests = require('./tests/get');
var setTests = require('./tests/set');
var mergeTests = require('./tests/merge');

module.exports = function() {

    return {
        suite: {
            name: 'Falcor'
        },
        models: models,
        formats: ['Value', 'JSON', 'PathMap', 'JSONG'],
        get: getTests,
        set: setTests,
        merge: mergeTests
    };

};
