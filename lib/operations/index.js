module.exports = {
    getPathSetsAsJSON: require("./get-pathsets-json-dense"),
    getPathSetsAsJSONG: require("./get-pathsets-json-graph"),
    getPathSetsAsPathMap: require("./get-pathsets-json-sparse"),
    getPathSetsAsValues: require("./get-pathsets-json-values"),
    
    setPathSetsAsJSON: require("./set-pathsets-json-dense"),
    setPathSetsAsJSONG: require("./set-pathsets-json-graph"),
    setPathSetsAsPathMap: require("./set-pathsets-json-sparse"),
    setPathSetsAsValues: require("./set-pathsets-json-values")
};