module.exports = {
    setPathSetsAsJSON: require('falcor/set/set-json-values-as-json-dense'),
    setPathSetsAsJSONG: require('falcor/set/set-json-values-as-json-graph'),
    setPathSetsAsPathMap: require('falcor/set/set-json-values-as-json-sparse'),
    setPathSetsAsValues: require('falcor/set/set-json-values-as-json-values'),
    
    setPathMapsAsJSON: require('falcor/set/set-json-sparse-as-json-dense'),
    setPathMapsAsJSONG: require('falcor/set/set-json-sparse-as-json-graph'),
    setPathMapsAsPathMap: require('falcor/set/set-json-sparse-as-json-sparse'),
    setPathMapsAsValues: require('falcor/set/set-json-sparse-as-json-values'),
    
    setJSONGsAsJSON: require('falcor/set/set-json-graph-as-json-dense'),
    setJSONGsAsJSONG: require('falcor/set/set-json-graph-as-json-graph'),
    setJSONGsAsPathMap: require('falcor/set/set-json-graph-as-json-sparse'),
    setJSONGsAsValues: require('falcor/set/set-json-graph-as-json-values'),
    
    setCache: require('falcor/set/set-cache')
};
