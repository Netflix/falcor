var Rx = require('rx');
global.Rx = Rx;
var falcor = require('./bin/Falcor.s.js');
var recF = require('./bin/Falcor.r.js');
var Cache = require('./../test/data/Cache');
var Expected = require('./../test/data/expected');
var Values = Expected.Values;
var References = Expected.References;
var Complex = Expected.Complex;
E_model = new falcor.Model();
E_recModel = new recF.Model();
model = new falcor.Model({cache: Cache()});
recModel = new recF.Model({cache: Cache()});

model._root.allowSync = true;
recModel._root.allowSync = true;

recModel.getValueSync(['videos', 1234, 'summary']);
var config = require('./testConfig.js')(model, recF, E_model, E_recModel);

if (require.main === module) {
    require('./test-header')(require('benchmark'), config, 1, function(totalResults) {
        var fs = require('fs');
        fs.writeFileSync('out.csv', totalResults.join('\n'))
    });
}
