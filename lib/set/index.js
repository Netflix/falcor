module.exports = {
    setPathSetsAsJSON: require('./set-json-values-as-json-dense'),
    setPathSetsAsJSONG: require('./set-json-values-as-json-graph'),
    setPathSetsAsPathMap: require('./set-json-values-as-json-sparse'),
    setPathSetsAsValues: require('./set-json-values-as-json-values'),
    
    setPathMapsAsJSON: require('./set-json-sparse-as-json-dense'),
    setPathMapsAsJSONG: require('./set-json-sparse-as-json-graph'),
    setPathMapsAsPathMap: require('./set-json-sparse-as-json-sparse'),
    setPathMapsAsValues: require('./set-json-sparse-as-json-values'),
    
    setJSONGsAsJSON: require('./set-json-graph-as-json-dense'),
    setJSONGsAsJSONG: require('./set-json-graph-as-json-graph'),
    setJSONGsAsPathMap: require('./set-json-graph-as-json-sparse'),
    setJSONGsAsValues: require('./set-json-graph-as-json-values'),
    
    setCache: require('./set-cache')
};
