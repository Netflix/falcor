var falcor = require('./bin/Falcor.js');
var recF = require('./bin2/Falcor2.js');
var Cache = require('./test/data/Cache');

var model = new falcor.Model({cache: Cache()});
var recModel = new recF(Cache());

// Hard links the model
model._root.allowSync = true;
model._getPathsAsValues(model, [['genreList', [0, 1], [0, 1], 'summary']]);

module.exports = {
    name: 'Falcor',
    tests: {
        'falcor.Model simple path': function () {
            model._getPathsAsValues(model, [
                ['videos', 1234, 'summary']
            ]);
        },

        'FTester2.Model simple path': function () {
            recModel._getPathsAsValues(recModel, [
                ['videos', 1234, 'summary']
            ]);
        },
        'falcor.Model reference in path': function () {
            model._getPathsAsValues(model, [
                ['genreList', 0, 0, 'summary']
            ]);
        },

        'FTester2.Model reference in path': function () {
            recModel._getPathsAsValues(recModel, [
                ['genreList', 0, 0, 'summary']
            ]);
        },
        'falcor.Model complex in path': function () {
            model._getPathsAsValues(model, [
                ['genreList', [0, 1], 0, 'summary']
            ]);
        },

        'FTester2.Model complex in path': function () {
            recModel._getPathsAsValues(recModel, [
                ['genreList', [0, 1], 0, 'summary']
            ]);
        },
        'falcor.Model two complex in path': function () {
            model._getPathsAsValues(model, [
                ['genreList', [0, 1], {to: 3}, 'summary']
            ]);
        },

        'FTester2.Model two complex in path': function () {
            recModel._getPathsAsValues(recModel, [
                ['genreList', [0, 1], {to: 3}, 'summary']
            ]);
        },
        'falcor.Model simple path AsPathMap': function () {
            model._getPathsAsPathMap(model, [
                ['videos', 1234, 'summary']
            ], [{}]);
        },

        'FTester2.Model simple path AsPathMap': function () {
            recModel._getPathsAsPathMap(recModel, [
                ['videos', 1234, 'summary']
            ], [{}]);
        },
        'falcor.Model reference in path AsPathMap': function () {
            model._getPathsAsPathMap(model, [
                ['genreList', 0, 0, 'summary']
            ]);
        },

        'FTester2.Model reference in path AsPathMap': function () {
            recModel._getPathsAsPathMap(recModel, [
                ['genreList', 0, 0, 'summary']
            ]);
        },
        'falcor.Model complex in path AsPathMap': function () {
            model._getPathsAsPathMap(model, [
                ['genreList', [0, 1], 0, 'summary']
            ]);
        },

        'FTester2.Model complex in path AsPathMap': function () {
            recModel._getPathsAsPathMap(recModel, [
                ['genreList', [0, 1], 0, 'summary']
            ]);
        },
        'falcor.Model two complex in path AsPathMap': function () {
            model._getPathsAsPathMap(model, [
                ['genreList', [0, 1], {to: 3}, 'summary']
            ]);
        },

        'FTester2.Model two complex in path AsPathMap': function () {
            recModel._getPathsAsPathMap(recModel, [
                ['genreList', [0, 1], {to: 3}, 'summary']
            ]);
        }
    }
};

if (require.main === module) {
    
}
