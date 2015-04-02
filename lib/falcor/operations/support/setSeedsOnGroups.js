module.exports = function setSeedsOnGroups(groups, seeds, hasSelector) {
    var valueIndex = 0;
    var seedsLength = seeds.length;
    var j, i, len = groups.length, gLen, group;
    if (hasSelector) {
        for (i = 0; i < len && valueIndex < seedsLength; i++) {
            group = groups[i];
            gLen = gLen = group.args.length;
            for (j = 0; j < gLen && valueIndex < seedsLength; j++, valueIndex++) {
                group.seeds.push(seeds[valueIndex]);
            }
        }
    } else {
        for (i = 0; i < len && valueIndex < seedsLength; i++) {
            groups[i].seeds = seeds;
        }
    }
}
