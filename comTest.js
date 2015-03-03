var model = new falcor.Model({cache: Cache()});
var recModel = new FModel(Cache());

// Hard links the model
model._root.allowSync = true;
model.getValueSync(['videos', 1234, 'summary']);
model._getPathsAsValues(model, [
    ['genreList', [0, 1], [0, 1], 'summary']
]);

function fulfill() {
    this.getValueSync(['videos', 1234, 'summary']);
}
function fulfill2(video) {
}

// When tests are ready to run, your script needs to invoke function onTestsLoaded (testObject){}
onTestsLoaded({
    // Name your test
    name: 'Falcor',
    async: false, // or true if they are asynchronous tests

    // Define tests as 'name' : function(){test code}
    tests: {
        'falcor.Model test selector empty': function () {
            model._getPathsAsJSON(model, [['videos', 1234, 'summary']]);
            model._getValueSync(model, ['videos', 1234, 'summary'])
        },

        'FTester2.Model simple path': function () {
            recModel._getAsJSON(recModel, [['videos', 1234, 'summary']]);
            recModel._getAsValues(recModel, [['videos', 1234, 'summary']]);
        }
    }
});
var v = Object.keys(Values());
var v1 = Values();
var v2 = Values();
var v3 = Values();
var v4 = Values();
