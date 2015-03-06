var falcor = require('./bin/Falcor.js');
var recF = require('./bin2/Falcor2.js');
var Cache = require('./test/data/Cache');
var Expected = require('./test/data/expected');
var Values = Expected.Values;
var References = Expected.References;
var Complex = Expected.Complex;
E_model = new falcor.Model();
E_recModel = new recF();
model = new falcor.Model({cache: Cache()});
recModel = new recF(Cache());

model._root.allowSync = true;
recModel._root.allowSync = true;

recModel.getValueSync(['videos', 1234, 'summary']);
var config = require('./testConfig.js')(model, recF, E_model, E_recModel);

if (require.main === module) {
    require('./test-header')(config, 10, function(totalResults) {
        var fs = require('fs');
        fs.writeFileSync('out.csv', totalResults.join('\n'))
    });
}
