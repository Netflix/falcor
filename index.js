var falcor = require('./src');
var sentinelGet = require('./operations/alt-sentinel');
var prototype = falcor.Model.prototype;

prototype._getBoundContext = null;
prototype._getBoundValue = null;
prototype._getValueSync = sentinelGet.getValueSync;
prototype._getPathSetsAsValues = sentinelGet.getAsValues;
prototype._getPathSetsAsJSON = sentinelGet.getAsJSON;
prototype._getPathSetsAsPathMap = sentinelGet.getAsPathMap;
prototype._getPathSetsAsJSONG = sentinelGet.getAsJSONG;
prototype._getPathMapsAsValues = sentinelGet.getAsValues;
prototype._getPathMapsAsJSON = sentinelGet.getAsJSON;
prototype._getPathMapsAsPathMap = sentinelGet.getAsPathMap;
prototype._getPathMapsAsJSONG = sentinelGet.getAsJSONG;

prototype._setPathSetsAsJSON = require("./lib/operations/set-pathsets-json-dense");
prototype._setPathSetsAsJSONG = require("./lib/operations/set-pathsets-json-graph");
prototype._setPathSetsAsPathMap = require("./lib/operations/set-pathsets-json-sparse");
prototype._setPathSetsAsValues = require("./lib/operations/set-pathsets-json-values");

// prototype._setPathMapsAsValues = require("./operations/alt/legacy_setPathMapsAsValues");
prototype._setCache = require("./operations/alt-sentinel/legacy_setCache");

module.exports = falcor;

if (require.main === module) {
    var isArray = Array.isArray;
    var inspect = require("util").inspect;

    module.exports = get_value_sync;

    execute();

    function get_pathset_sync(onNode, onLink, onEdge, rest, roots, parents, nodes, values, requested, optimized, key, keyset) {

        var outerkey, iskeyset, innerkey, type, value, ref, back, node = nodes[0], i, n;

        if (rest.length == 0 || node == null || typeof node != "object") {
            return onEdge(parents, nodes, values, key, keyset, requested, optimized);
        } else if ((type = node.$type) == "reference") {
            do {
                ref = node;
                value = node.value;
                node = node.__context;
                if (node != null) {
                    type = node.$type;
                    optimized = new Array(n = value.length);
                    for (i = -1; ++i < n;) {
                        optimized[i] = value[i];
                    }
                    nodes[0] = node;
                } else {
                    optimized.length = 0;
                    nodes = get_reference_sync(onLink, value, roots.slice(0), nodes.slice(0), optimized);
                    optimized = nodes.path;
                    nodes = nodes.nodes;
                    node = nodes[0];
                    if (node != null && typeof node == "object") {
                        type = node.$type;
                        back = node.__refs_length || 0;
                        node.__refs_length = back + 1;
                        node["__ref" + back] = ref;
                        ref.__context = node;
                        ref.__ref_index = back;
                    } else {
                        return onEdge(parents, nodes, values, key, keyset, requested, optimized);
                    }
                }
            } while (type == "reference");
        }

        if (!!type) {
            return onEdge(parents, nodes, values, key, keyset, requested, optimized);
        }

        outerkey = rest[0];
        iskeyset = outerkey != null && typeof outerkey == "object";

        do {
            var parents2 = new Array(n = parents.length);
            for (i = -1; ++i < n;) {
                parents2[i] = parents[i];
            }

            var nodes2 = new Array(n = nodes.length);
            for (i = -1; ++i < n;) {
                nodes2[i] = nodes[i];
            }

            var rest2 = new Array(n = rest.length - 1);
            for (i = -1; ++i < n;) {
                rest2[i] = rest[i + 1];
            }

            innerkey = !iskeyset ? outerkey : fromKeySet(outerkey, iskeyset);
            if (onNode(parents2, nodes2, innerkey, iskeyset) !== false) {
                get_pathset_sync(
                    onNode, onLink, onEdge, rest2,
                    roots, parents2, nodes2, values,
                    requested.concat(innerkey),
                    optimized.concat(innerkey),
                    innerkey, iskeyset
                );
            } else {
                onEdge(parents2, nodes2, values, innerkey, iskeyset, requested, optimized);
            }
        } while (iskeyset && !permuteKey(outerkey));
    }

    function get_value_sync(onLink, rest, roots, nodes, path) {

        var key, type, value, ref, back, node = nodes[0], pbv, i, n;

        if (rest.length == 0 || node == null || typeof node != "object") {
            pbv = Object.create(null);
            pbv.path = path;
            if (type = node && node.$type) {
                pbv.value = node.value;
                return { path: path, value: node.value };
            } else {
                pbv.value = node;
            }
            return pbv;
        } else if ((type = node.$type) == "reference") {
            do {
                ref = node;
                value = node.value;
                node = node.__context;
                path = value.slice(0);
                if (node != null) {
                    type = node.$type;
                    nodes[0] = node;
                } else {
                    path.length = 0;
                    nodes = get_reference_sync(onLink, value, roots.slice(0), nodes.slice(0), path);
                    path = nodes.path;
                    nodes = nodes.nodes;
                    node = nodes[0];
                    if (node != null && typeof node == "object") {
                        type = node.$type;
                        back = node.__refs_length || 0;
                        node.__refs_length = back + 1;
                        node["__ref" + back] = ref;
                        ref.__context = node;
                        ref.__ref_index = back;
                    } else {
                        pbv = Object.create(null);
                        pbv.path = path;
                        pbv.value = node;
                        return pbv;
                    }
                }
            } while (type == "reference");
        }

        if (!!type) {
            pbv = Object.create(null);
            pbv.path = path;
            pbv.value = node.value;
            return pbv;
        }

        key = rest[0];

        onLink(nodes, nodes, key);

        var nodes2 = new Array(n = nodes.length);
        for (i = -1; ++i < n;) {
            nodes2[i] = nodes[i];
        }

        var rest2 = new Array(n = rest.length - 1);
        for (i = -1; ++i < n;) {
            rest2[i] = rest[i + 1];
        }

        var path2 = new Array((n = path.length) + 1);
        for (i = -1; ++i < n;) {
            path2[i] = path[i];
        }
        path2[i] = key;

        return get_value_sync(onLink, rest2, roots, nodes2, path2);
    }

    function get_reference_sync(onLink, rest, parents, nodes, path) {

        var node = parents[0], pbv, i, n;

        if (rest.length == 0 || node == null || typeof node != "object" || !!node.$type) {
            pbv = Object.create(null);
            pbv.path = path;
            pbv.nodes = parents;
            return pbv;
        }

        var key = rest[0];

        onLink(parents, nodes, key);

        var parents2 = new Array(n = parents.length);
        for (i = -1; ++i < n;) {
            parents2[i] = parents[i];
        }

        var nodes2 = new Array(n = nodes.length);
        for (i = -1; ++i < n;) {
            nodes2[i] = nodes[i];
        }

        var rest2 = new Array(n = rest.length - 1);
        for (i = -1; ++i < n;) {
            rest2[i] = rest[i + 1];
        }

        var path2 = new Array((n = path.length) + 1);
        for (i = -1; ++i < n;) {
            path2[i] = path[i];
        }
        path2[i] = key;

        return get_reference_sync(onLink, rest2, parents2, nodes2, path2);
    }

    function fromKeySet(key, iskeyset) {
        if (iskeyset) {
            if (isArray(key)) {
                key = key[key.__offset || (key.__offset = 0)];
                return fromKeySet(key, key != null && typeof key === "object");
            } else {
                if (key.__offset === undefined) {
                    key.__offset = key.from || (key.from = 0);
                }
                return key.__offset;
            }
        }
        return key;
    }

    function permuteKey(key) {
        if (isArray(key)) {
            if (++key.__offset === key.length) {
                return permuteKey(key[key.__offset = 0]);
            } else {
                return false;
            }
        } else if (key != null && typeof key === "object") {
            if (++key.__offset > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
                key.__offset = key.from;
                return true;
            }
            return false;
        }
        return true;
    }

    function execute() {

        var i = -1;
        var n = 10;
        var root = getCache();
        // var pathset = ["lolomo", {to: 9}, {to: 9}, "item", "summary"];
        var pathset = ["lolomo", {to: 9}, {to: 3}, "item", "summary"];
        // var pathset = ["lolomo", 0, 0, "item", "summary"];

        var onNode = function (parents, nodes, key, iskeyset) {

            if (key != null) {
                var node = nodes[0];
                var mapp = nodes[1];

                parents[0] = node;
                parents[1] = mapp;

                nodes[0] = node = node[key];
                var type = node && node.$type || undefined;

                if (node != null && typeof node == "object" && (!type || type == "reference")) {
                    nodes[1] = mapp[key] || (mapp[key] = Object.create(null));
                }
            }

            return true;
        };

        var onLink = function (parents, nodes, key) {
            var node = parents[0];
            parents[0] = node[key];
            parents[1] = nodes[1];
            return true;
        };

        var onEdge = function (parents, nodes, values, key, iskeyset, requested, optimized) {

            if (key != null) {
                var node = nodes[0];
                var mapp = parents[1];
                var type = node && node.$type || undefined;
                mapp[key] = !!type ? node.value : node;
            }

            return true;
        };

        var exec = new Array(n);

        while (++i < n) {
            var t = Date.now();
            var j = 0;
            do {
                // while(++i < 2) {

                // console.log(inspect(get_value_sync(onLink, pathset, [root], [root], []), {depth: null}));
                // get_value_sync(onLink, pathset, [root], [root], []);

                var map = Object.create(null);

                get_pathset_sync(
                    onNode, onLink, onEdge, pathset,
                    [root, map], [root, map],
                    [root, map], null, [], []
                );

                // console.log(inspect(map, {depth: null}));
            } while (++j && Date.now() - t < 1000);
            exec[i] = j;
        }

        console.log(exec.reduce(function (x, i) {
            return x + i;
        }, 0) / n);
    }

    function getCache() {
        return {
            "lolomo": { "$type": "reference", "value": ["lolomos", "123"] },
            "lolomos": { "123": {
                "0": { "$type": "reference", "value": ["lists", "012"] },
                "1": { "$type": "reference", "value": ["lists", "123"] },
                "2": { "$type": "reference", "value": ["lists", "234"] },
                "3": { "$type": "reference", "value": ["lists", "345"] },
                "4": { "$type": "reference", "value": ["lists", "456"] },
                "5": { "$type": "reference", "value": ["lists", "567"] },
                "6": { "$type": "reference", "value": ["lists", "678"] },
                "7": { "$type": "reference", "value": ["lists", "789"] },
                "8": { "$type": "reference", "value": ["lists", "890"] },
                "9": { "$type": "reference", "value": ["lists", "901"] },
            } },
            "lists": {
                "012": {
                    "0": { "$type": "reference", "value": ["recommendations", "012"] },
                    "1": { "$type": "reference", "value": ["recommendations", "123"] },
                    "2": { "$type": "reference", "value": ["recommendations", "234"] },
                    "3": { "$type": "reference", "value": ["recommendations", "345"] },
                    "4": { "$type": "reference", "value": ["recommendations", "456"] },
                    "5": { "$type": "reference", "value": ["recommendations", "567"] },
                    "6": { "$type": "reference", "value": ["recommendations", "678"] },
                    "7": { "$type": "reference", "value": ["recommendations", "789"] },
                    "8": { "$type": "reference", "value": ["recommendations", "890"] },
                    "9": { "$type": "reference", "value": ["recommendations", "901"] },
                },
                "123": {
                    "0": { "$type": "reference", "value": ["recommendations", "012"] },
                    "1": { "$type": "reference", "value": ["recommendations", "123"] },
                    "2": { "$type": "reference", "value": ["recommendations", "234"] },
                    "3": { "$type": "reference", "value": ["recommendations", "345"] },
                    "4": { "$type": "reference", "value": ["recommendations", "456"] },
                    "5": { "$type": "reference", "value": ["recommendations", "567"] },
                    "6": { "$type": "reference", "value": ["recommendations", "678"] },
                    "7": { "$type": "reference", "value": ["recommendations", "789"] },
                    "8": { "$type": "reference", "value": ["recommendations", "890"] },
                    "9": { "$type": "reference", "value": ["recommendations", "901"] },
                },
                "234": {
                    "0": { "$type": "reference", "value": ["recommendations", "012"] },
                    "1": { "$type": "reference", "value": ["recommendations", "123"] },
                    "2": { "$type": "reference", "value": ["recommendations", "234"] },
                    "3": { "$type": "reference", "value": ["recommendations", "345"] },
                    "4": { "$type": "reference", "value": ["recommendations", "456"] },
                    "5": { "$type": "reference", "value": ["recommendations", "567"] },
                    "6": { "$type": "reference", "value": ["recommendations", "678"] },
                    "7": { "$type": "reference", "value": ["recommendations", "789"] },
                    "8": { "$type": "reference", "value": ["recommendations", "890"] },
                    "9": { "$type": "reference", "value": ["recommendations", "901"] },
                },
                "345": {
                    "0": { "$type": "reference", "value": ["recommendations", "012"] },
                    "1": { "$type": "reference", "value": ["recommendations", "123"] },
                    "2": { "$type": "reference", "value": ["recommendations", "234"] },
                    "3": { "$type": "reference", "value": ["recommendations", "345"] },
                    "4": { "$type": "reference", "value": ["recommendations", "456"] },
                    "5": { "$type": "reference", "value": ["recommendations", "567"] },
                    "6": { "$type": "reference", "value": ["recommendations", "678"] },
                    "7": { "$type": "reference", "value": ["recommendations", "789"] },
                    "8": { "$type": "reference", "value": ["recommendations", "890"] },
                    "9": { "$type": "reference", "value": ["recommendations", "901"] },
                },
                "456": {
                    "0": { "$type": "reference", "value": ["recommendations", "012"] },
                    "1": { "$type": "reference", "value": ["recommendations", "123"] },
                    "2": { "$type": "reference", "value": ["recommendations", "234"] },
                    "3": { "$type": "reference", "value": ["recommendations", "345"] },
                    "4": { "$type": "reference", "value": ["recommendations", "456"] },
                    "5": { "$type": "reference", "value": ["recommendations", "567"] },
                    "6": { "$type": "reference", "value": ["recommendations", "678"] },
                    "7": { "$type": "reference", "value": ["recommendations", "789"] },
                    "8": { "$type": "reference", "value": ["recommendations", "890"] },
                    "9": { "$type": "reference", "value": ["recommendations", "901"] },
                },
                "567": {
                    "0": { "$type": "reference", "value": ["recommendations", "012"] },
                    "1": { "$type": "reference", "value": ["recommendations", "123"] },
                    "2": { "$type": "reference", "value": ["recommendations", "234"] },
                    "3": { "$type": "reference", "value": ["recommendations", "345"] },
                    "4": { "$type": "reference", "value": ["recommendations", "456"] },
                    "5": { "$type": "reference", "value": ["recommendations", "567"] },
                    "6": { "$type": "reference", "value": ["recommendations", "678"] },
                    "7": { "$type": "reference", "value": ["recommendations", "789"] },
                    "8": { "$type": "reference", "value": ["recommendations", "890"] },
                    "9": { "$type": "reference", "value": ["recommendations", "901"] },
                },
                "678": {
                    "0": { "$type": "reference", "value": ["recommendations", "012"] },
                    "1": { "$type": "reference", "value": ["recommendations", "123"] },
                    "2": { "$type": "reference", "value": ["recommendations", "234"] },
                    "3": { "$type": "reference", "value": ["recommendations", "345"] },
                    "4": { "$type": "reference", "value": ["recommendations", "456"] },
                    "5": { "$type": "reference", "value": ["recommendations", "567"] },
                    "6": { "$type": "reference", "value": ["recommendations", "678"] },
                    "7": { "$type": "reference", "value": ["recommendations", "789"] },
                    "8": { "$type": "reference", "value": ["recommendations", "890"] },
                    "9": { "$type": "reference", "value": ["recommendations", "901"] },
                },
                "789": {
                    "0": { "$type": "reference", "value": ["recommendations", "012"] },
                    "1": { "$type": "reference", "value": ["recommendations", "123"] },
                    "2": { "$type": "reference", "value": ["recommendations", "234"] },
                    "3": { "$type": "reference", "value": ["recommendations", "345"] },
                    "4": { "$type": "reference", "value": ["recommendations", "456"] },
                    "5": { "$type": "reference", "value": ["recommendations", "567"] },
                    "6": { "$type": "reference", "value": ["recommendations", "678"] },
                    "7": { "$type": "reference", "value": ["recommendations", "789"] },
                    "8": { "$type": "reference", "value": ["recommendations", "890"] },
                    "9": { "$type": "reference", "value": ["recommendations", "901"] },
                },
                "890": {
                    "0": { "$type": "reference", "value": ["recommendations", "012"] },
                    "1": { "$type": "reference", "value": ["recommendations", "123"] },
                    "2": { "$type": "reference", "value": ["recommendations", "234"] },
                    "3": { "$type": "reference", "value": ["recommendations", "345"] },
                    "4": { "$type": "reference", "value": ["recommendations", "456"] },
                    "5": { "$type": "reference", "value": ["recommendations", "567"] },
                    "6": { "$type": "reference", "value": ["recommendations", "678"] },
                    "7": { "$type": "reference", "value": ["recommendations", "789"] },
                    "8": { "$type": "reference", "value": ["recommendations", "890"] },
                    "9": { "$type": "reference", "value": ["recommendations", "901"] },
                },
                "901": {
                    "0": { "$type": "reference", "value": ["recommendations", "012"] },
                    "1": { "$type": "reference", "value": ["recommendations", "123"] },
                    "2": { "$type": "reference", "value": ["recommendations", "234"] },
                    "3": { "$type": "reference", "value": ["recommendations", "345"] },
                    "4": { "$type": "reference", "value": ["recommendations", "456"] },
                    "5": { "$type": "reference", "value": ["recommendations", "567"] },
                    "6": { "$type": "reference", "value": ["recommendations", "678"] },
                    "7": { "$type": "reference", "value": ["recommendations", "789"] },
                    "8": { "$type": "reference", "value": ["recommendations", "890"] },
                    "9": { "$type": "reference", "value": ["recommendations", "901"] },
                },
            },
            "recommendations": {
                "012": { "item": { "$type": "reference", "value": ["videos", "012"] } },
                "123": { "item": { "$type": "reference", "value": ["videos", "123"] } },
                "234": { "item": { "$type": "reference", "value": ["videos", "234"] } },
                "345": { "item": { "$type": "reference", "value": ["videos", "345"] } },
                "456": { "item": { "$type": "reference", "value": ["videos", "456"] } },
                "567": { "item": { "$type": "reference", "value": ["videos", "567"] } },
                "678": { "item": { "$type": "reference", "value": ["videos", "678"] } },
                "789": { "item": { "$type": "reference", "value": ["videos", "789"] } },
                "890": { "item": { "$type": "reference", "value": ["videos", "890"] } },
                "901": { "item": { "$type": "reference", "value": ["videos", "901"] } },
            },
            "videos": {
                "012": { "summary": { "$type": "sentinel", "value": "012" } },
                "123": { "summary": { "$type": "sentinel", "value": "123" } },
                "234": { "summary": { "$type": "sentinel", "value": "234" } },
                "345": { "summary": { "$type": "sentinel", "value": "345" } },
                "456": { "summary": { "$type": "sentinel", "value": "456" } },
                "567": { "summary": { "$type": "sentinel", "value": "567" } },
                "678": { "summary": { "$type": "sentinel", "value": "678" } },
                "789": { "summary": { "$type": "sentinel", "value": "789" } },
                "890": { "summary": { "$type": "sentinel", "value": "890" } },
                "901": { "summary": { "$type": "sentinel", "value": "901" } },
            }
        };
    }
}