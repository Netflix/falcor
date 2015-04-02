var isSeedRequired = require('./seedRequired');
var isJSONG = require('./isJSONG');
var isPathOrPathValue = require('./isPathOrPathValue');
module.exports = function buildOperations(args, format, name) {
    var seedRequired = isSeedRequired(format);
    var isValues = !seedRequired;
    var hasSelector = seedRequired && format === 'AsJSON';
    var seedsOffset = 0;
    return args.
        reduce(function(groups, argument) {
            var group = groups[groups.length - 1];
            var type  = isPathOrPathValue(argument) ? "PathSets" :
                isJSONG(argument) ? "JSONGs" : "PathMaps";
            var groupType = group && group.type;
            var methodName = '_' + name + type + format;

            if (!groupType || type !== groupType) {
                group = {
                    methodName: methodName,
                    format: format,
                    type: type,
                    isValues: isValues,
                    seeds: [],
                    onNext: null,
                    seedsOffset: seedsOffset,
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
