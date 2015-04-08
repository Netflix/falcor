var isSeedRequired = require('./seedRequired');
var isJSONG = require('./isJSONG');
var isPathOrPathValue = require('./isPathOrPathValue');
var Formats = require('./Formats');
var toSelector = Formats.selector;
var toPathValues = Formats.toPathValues;
var toJSON = Formats.toJSON;
var toJSONG = Formats.toJSONG;
module.exports = function combineOperations(args, format, name, spread, isProgressive) {
    var seedRequired = isSeedRequired(format);
    var isValues = !seedRequired;
    var hasSelector = seedRequired && format === toSelector;
    var seedsOffset = 0;
    return args.
        reduce(function(groups, argument) {
            var group = groups[groups.length - 1];
            var type  = isPathOrPathValue(argument) ? "PathSets" :
                isJSONG(argument) ? "JSONGs" : "PathMaps";
            var groupType = group && group.type;
            var methodName = '_' + name + type + format;

            if (!groupType || type !== groupType || spread) {
                group = {
                    methodName: methodName,
                    format: format,
                    type: type,
                    isValues: isValues,
                    seeds: [],
                    onNext: null,
                    seedsOffset: seedsOffset,
                    isProgressive: isProgressive,
                    args: []
                };
                groups.push(group);
                if (hasSelector) {
                    seedsOffset++;
                }
            }
            group.args.push(argument);
            return groups;
        }, []);
};
