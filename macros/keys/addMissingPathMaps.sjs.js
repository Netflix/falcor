macro addMissingPathMaps {
    rule infix { $retVal:ident = | (
        $requestedPaths, $requestedPath,
        $optimizedPaths, $optimizedPath,
        $mapStack, $bound, $index, $depth $rest ...
    ) } => {
        var i = -1, j = -1, l = -1, o,
            n = $bound.length,
            k = $requestedPath.length,
            req = [], opt = [], x,
            map, offset, keys, key, index;
        while(++i < n) { req[i] = $bound[i]; }
        while(++j < k) {
            if(exists(x = $requestedPath[j])) { req[i++]   = (
                keys = $mapStack[(offset = ++l * 4) + 1]) && (
                keys.length > 1                         ) && [x] || x;
            }
        }
        j = -1;
        n = $optimizedPath.length;
        while(++j < n) { opt[j] = $optimizedPath[j]; }
        
        o = n - $depth;
        i = (j = $depth) - 1;
        
        while(j > i) {
            if((obj_exists(
                map      = $mapStack[offset = j * 4])                                         ) &&  (
                map[$TYPE]     === undefined                                                  ) &&  (
                Array.isArray(map) === false                                                  ) &&  (
                keys     = $mapStack[offset + 1] || ($mapStack[offset + 1] = Object.keys(map))) && ((
                index    = $mapStack[offset + 2] || ($mapStack[offset + 2] = 0))       || true) &&  (
                keys.length > 0                                                               ))    {
                if(($mapStack[offset + 2] = ++index) - 1 < keys.length) {
                    key = keys[index - 1];
                    if(keys.length > 1) {
                        keys = req[j] || (req[j] = []);
                        if(key === __NULL) {
                            keys[keys.length] = null;
                        } else {
                            keys[keys.length] = key;
                            keys = opt[j + o] || (opt[j + o] = []);
                            keys[keys.length] = key;
                        }
                    } else if(key === __NULL) {
                        req[j] = null;
                    } else {
                        req[j] = opt[j + o] = key;
                    }
                    $mapStack[offset = ++j * 4] = map[key];
                    continue;
                }
            }
            delete $mapStack[offset = j-- * 4];
            delete $mapStack[offset + 1];
            delete $mapStack[offset + 2];
            delete $mapStack[offset + 3];
        }
        
        j = -1;
        i = -1;
        n = opt.length;
        while(++j < n) { opt[j] != null && (opt[++i] = opt[j]); }
        
        req.pathSetIndex = $index;
        $requestedPaths[$requestedPaths.length] = req;
        $optimizedPaths[$optimizedPaths.length] = opt;
    }
    rule { } => { $[addMissingPathMaps] }
}
export addMissingPathMaps;