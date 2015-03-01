var model = new falcor.Model({cache: Cache()});
var recModel = new FModel(Cache());

// Hard links the model
model._root.allowSync = true;
model._getPathsAsValues(model, [
    ['genreList', [0, 1], [0, 1], 'summary']
]);

// When tests are ready to run, your script needs to invoke function onTestsLoaded (testObject){}
onTestsLoaded({
    // Name your test
    name: 'Falcor',
    async: false, // or true if they are asynchronous tests

    // Define tests as 'name' : function(){test code}
    tests: {
//        'falcor.Model simple path': function () {
//            model._getPathsAsValues(model, [
//                ['videos', 1234, 'summary']
//            ]);
//        },
//
//        'FTester2.Model simple path': function () {
//            recModel._getPathsAsValues(recModel, [
//                ['videos', 1234, 'summary']
//            ]);
//        },
//        'falcor.Model reference in path': function () {
//            model._getPathsAsValues(model, [
//                ['genreList', 0, 0, 'summary']
//            ]);
//        },
//
//        'FTester2.Model reference in path': function () {
//            recModel._getPathsAsValues(recModel, [
//                ['genreList', 0, 0, 'summary']
//            ]);
//        },
//        'falcor.Model complex in path': function () {
//            model._getPathsAsValues(model, [
//                ['genreList', [0, 1], 0, 'summary']
//            ]);
//        },
//
//        'FTester2.Model complex in path': function () {
//            recModel._getPathsAsValues(recModel, [
//                ['genreList', [0, 1], 0, 'summary']
//            ]);
//        },
//        'falcor.Model two complex in path': function () {
//            model._getPathsAsValues(model, [
//                ['genreList', [0, 1], {to: 3}, 'summary']
//            ]);
//        },
//
//        'FTester2.Model two complex in path': function () {
//            recModel._getPathsAsValues(recModel, [
//                ['genreList', [0, 1], {to: 3}, 'summary']
//            ]);
//        },
        'falcor.Model simple path AsJSON': function () {
            model._getPathsAsJSON(model, [
                ['videos', 1234, 'summary']
            ], [{}]);
        },

        'FTester2.Model simple path AsJSON': function () {
            recModel._getPathsAsJSON(recModel, [
                ['videos', 1234, 'summary']
            ], [{}]);
        },
        'falcor.Model reference in path AsJSON': function () {
            model._getPathsAsJSON(model, [
                ['genreList', 0, 0, 'summary']
            ], [{}]);
        },

        'FTester2.Model reference in path AsJSON': function () {
            recModel._getPathsAsJSON(recModel, [
                ['genreList', 0, 0, 'summary']
            ], [{}]);
        },
        'falcor.Model complex in path AsJSON': function () {
            model._getPathsAsJSON(model, [
                ['genreList', [0, 1], 0, 'summary']
            ], [{}]);
        },

        'FTester2.Model complex in path AsJSON': function () {
            recModel._getPathsAsJSON(recModel, [
                ['genreList', [0, 1], 0, 'summary']
            ], [{}]);
        },
        'falcor.Model two complex in path AsJSON': function () {
            model._getPathsAsJSON(model, [
                ['genreList', [0, 1], {to: 3}, 'summary']
            ]);
        },

        'FTester2.Model two complex in path AsJSON': function () {
            recModel._getPathsAsJSON(recModel, [
                ['genreList', [0, 1], {to: 3}, 'summary']
            ], [{}]);
        }
    }
});
