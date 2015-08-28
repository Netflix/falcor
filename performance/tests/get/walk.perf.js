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

var walk = require('./../../../lib/get/getWalk');
var results = {
    optimizedPaths: [],
    requestedPaths: []
};
var seed = {};
walk(model, cache, cache, [{to: 4}], 0, seed, [], results, [], [], 'paths', 'PathMap', false);

module.exports = {
    'walk': function() {
        walk(model, cache, cache, [{to: 4}], 0, seed, [], results, [], [], 'paths', 'PathMap', false);
    },
    'walk same': function() {
        walk(model, cache, cache, [{to: 4}], 0, seed, [], results, [], [], 'paths', 'PathMap', false);
    },
    'walk large': function() {
        walk(lModel, largeCache, largeCache, [{to: 4}, {to: 4}], 0, seed, [], results, [], [], 'paths', 'PathMap', false);
    },
    'walk large again': function() {
        walk(lModel, largeCache, largeCache, [{to: 4}, {to: 4}], 0, seed, [], results, [], [], 'paths', 'PathMap', false);
    }
};
