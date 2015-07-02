var countAndOutputFormatIdx = 2;
var cyclesIdx = 3;

module.exports = function transformCSVResults(results) {
    var transformed = results.
        split('\n').
        map(function(x) {
            return x.
                split(',').
                map(function(innerX, i) {
                    if (i === countAndOutputFormatIdx) {
                        var els = innerX.
                            split(' ').
                            filter(function(x) { return x.length; }).
                            map(function(x) {
                                return x.replace(/ /g, '');
                            });

                        els[1] = els[1].substring(1, els[1].length - 1);

                        return {
                            test: els[0],
                            model: els[1].split(':')[0],
                            output: els[1].split(':')[1],
                            idx: +els[2]
                        };
                    }

                    return innerX;
                }).
                filter(function(item, i) {
                    return i === countAndOutputFormatIdx ||
                        i === cyclesIdx;
                });
        }).
        sort(function(a, b) {
            var info = a[0];
            var bInfo = b[0];
            if (info.model < bInfo.model) {
                return -1;
            }

            else if (info.model > bInfo.model) {
                return 1;
            }

            if (info.test < bInfo.test) {
                return -1;
            }

            else if (info.test > bInfo.test) {
                return 1;
            }

            if (info.output < bInfo.output) {
                return -1;
            }

            else if (info.output > bInfo.output) {
                return 1;
            }

            if (info.idx < bInfo.idx) {
                return -1;
            }

            if (info.idx < bInfo.idx) {
                return 1;
            }
            return 0;
        }).
        reduce(function(acc, x) {
            var group;
            var info = x[0];
            var model = info.model;
            var output = info.output;
            var test = info.test;

            if (acc.length === 0) {
                group = [];
                acc.push(group);
            } else {
                group = acc[acc.length - 1];
                var firstRes = group[0][0];

                if (firstRes.model !== model ||
                    firstRes.output !== output ||
                    firstRes.test !== test) {

                    group = [];
                    acc.push(group);
                }
            }

            group.push(x);
            return acc;
        }, []).
        reduce(function(acc, x) {
            x.forEach(function(infoAndCycles, i) {
                if (!acc[i + 1]) {
                    acc[i + 1] = [];
                }
                if (i === 0) {
                    acc[0].push(infoAndCycles[0].test);
                }

                acc[i + 1].push(infoAndCycles[1]);
            });
            return acc;
        }, [[]]).
        map(function(x) {
            return x.join(',');
        }).
        join('\n');

    return transformed;
};
