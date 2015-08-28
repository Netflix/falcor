var Model = require("./../../../lib").Model;
var cacheGenerator = require('./../../../test/CacheGenerator');
var cache = {
    0: {
        $type: 'atom',
        value: 5
    },
    1: {
        $type: 'atom',
        value: 1
    },
    2: {
        $type: 'atom',
        value: 2
    },
    3: {
        $type: 'atom',
        value: 3
    },
    4: {
        $type: 'atom',
        value: 4
    }
};
var model = new Model({
    cache: cache
});
var largeCache = {
    0: {
        0: {
            $type: 'atom',
            value: 5
        },
        1: {
            $type: 'atom',
            value: 1
        },
        2: {
            $type: 'atom',
            value: 2
        },
        3: {
            $type: 'atom',
            value: 3
        },
        4: {
            $type: 'atom',
            value: 4
        }
    },
    1: {
        0: {
            $type: 'atom',
            value: 5
        },
        1: {
            $type: 'atom',
            value: 1
        },
        2: {
            $type: 'atom',
            value: 2
        },
        3: {
            $type: 'atom',
            value: 3
        },
        4: {
            $type: 'atom',
            value: 4
        }
    },
    2: {
        0: {
            $type: 'atom',
            value: 5
        },
        1: {
            $type: 'atom',
            value: 1
        },
        2: {
            $type: 'atom',
            value: 2
        },
        3: {
            $type: 'atom',
            value: 3
        },
        4: {
            $type: 'atom',
            value: 4
        }
    },
    3: {
        0: {
            $type: 'atom',
            value: 5
        },
        1: {
            $type: 'atom',
            value: 1
        },
        2: {
            $type: 'atom',
            value: 2
        },
        3: {
            $type: 'atom',
            value: 3
        },
        4: {
            $type: 'atom',
            value: 4
        }
    },
    4: {
        0: {
            $type: 'atom',
            value: 5
        },
        1: {
            $type: 'atom',
            value: 1
        },
        2: {
            $type: 'atom',
            value: 2
        },
        3: {
            $type: 'atom',
            value: 3
        },
        4: {
            $type: 'atom',
            value: 4
        }
    }
};
var lModel= new Model({
    cache: largeCache
});

var smallCache = {
    hello: {
        $type: 'atom',
        value: 4
    }
};
var sModel = new Model({
    cache: smallCache
});

var walk = require('./../../../lib/get/walkPath');
var results = {
    optimizedPaths: []
};
var seed = {};
walk(model, cache, cache, [{to: 4}], 0, seed, results, [], [], false);
var small = ['hello'];
var regular = [{to: 4}];
var large = [{to: 4}, {to: 4}];

module.exports = {
    'walk small': function() {
        walk(sModel, smallCache, smallCache, small, 0, seed, results, [], [], false);
    },
    'walk small same': function() {
        walk(sModel, smallCache, smallCache, small, 0, seed, results, [], [], false);
    },
    'walk': function() {
        walk(model, cache, cache, regular, 0, seed, results, [], [], false);
    },
    'walk same': function() {
        walk(model, cache, cache, regular, 0, seed, results, [], [], false);
    },
    'walk large': function() {
        walk(lModel, largeCache, largeCache, large, 0, seed, results, [], [], false);
    },
    'walk large again': function() {
        walk(lModel, largeCache, largeCache, large, 0, seed, results, [], [], false);
    }
};
