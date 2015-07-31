module.exports = {
    setPathSetsAsJSON: require("./../set/set-json-values-as-json-dense"),
    setPathSetsAsJSONG: require("./../set/set-json-values-as-json-graph"),
    setPathSetsAsPathMap: require("./../set/set-json-values-as-json-sparse"),
    setPathSetsAsValues: require("./../set/set-json-values-as-json-values"),

    setPathMapsAsJSON: require("./../set/set-json-sparse-as-json-dense"),
    setPathMapsAsJSONG: require("./../set/set-json-sparse-as-json-graph"),
    setPathMapsAsPathMap: require("./../set/set-json-sparse-as-json-sparse"),
    setPathMapsAsValues: require("./../set/set-json-sparse-as-json-values"),

    setJSONGsAsJSON: require("./../set/set-json-graph-as-json-dense"),
    setJSONGsAsJSONG: require("./../set/set-json-graph-as-json-graph"),
    setJSONGsAsPathMap: require("./../set/set-json-graph-as-json-sparse"),
    setJSONGsAsValues: require("./../set/set-json-graph-as-json-values"),

    setCache: require("./../set/set-cache")
};
