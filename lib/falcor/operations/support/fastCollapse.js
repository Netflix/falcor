module.exports = function fastCollapse(paths) {
    return paths.reduce(function(acc, p) {
        var curr = acc[0];
        if (!curr) {
            acc[0] = p;
        } else {
            p.forEach(function(v, i) {
                // i think
                if (typeof v === 'object') {
                    v.forEach(function(value) {
                        curr[i][curr[i].length] = value;
                    });
                }
            });
        }
        return acc;
    }, []);
}
