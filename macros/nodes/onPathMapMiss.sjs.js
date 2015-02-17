macro onPathMapMiss {
    rule infix { $ret = | (
        $optimizedBoundPath, $boundLength,
        $requestedPath, $optimizedPath,
        $requestedPaths, $optimizedPaths,
        $pathMapStack,
        $index,  $pathMap, $depth, $height, $(
        $stacks, $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
        var req = clone array $optimizedBoundPath,
            opt = clone array $optimizedPath,
            reqLen = req.length - 1,
            optLen = opt.length - 1,
            i = -1, n = $requestedPath.length,
            map, offset, keys, index,
            reqKeys, optKeys, optKeysLen, x, y, z;
        
        while(++i < n) {
            req[++reqLen] = (
                reqKeys = $pathMapStack[offset = ((i + $boundLength) * 4) + 1]) && (
                reqKeys.length > 1                           ) && (
                [$requestedPath[i]]                          ) || (
                $requestedPath[i]                            );
        }
        
        var j = $depth, k = reqLen, l = optLen;
        i = j++;
        while(j > i) {
            if((obj_exists(
                map   = $pathMapStack[offset = (j + $boundLength) * 4])                              ) &&  (
                map[$TYPE] === undefined                                                             ) &&  (
                Array.isArray(map) === false                                                         ) &&  (
                keys  = $pathMapStack[offset + 1]   || ($pathMapStack[offset + 1] = Object.keys(map))) && ((
                index = $pathMapStack[offset + 2]   || ($pathMapStack[offset + 2] = 0))       || true) && ((
                keys.length > 0))) {
                if(($pathMapStack[offset + 2] = ++index) - 1 < keys.length) {
                    if(reqLen - k < (j - i)) {
                        reqKeys = clone array keys;
                        x = -1;
                        y = reqKeys.length;
                        while(++x < y) {
                            reqKeys[x] = ((z = reqKeys[x]) == __NULL) ? null : z;
                        }
                        req[++reqLen] = y === 1 ? reqKeys[0] : reqKeys;
                    }
                    if((optLen - l) < (j - i)) {
                        reqKeys = clone array keys;
                        optKeys = [];
                        optKeysLen = 0;
                        x = -1;
                        y = reqKeys.length;
                        while(++x < y) {
                            ((z = reqKeys[x]) !== __NULL) && (optKeys[optKeysLen++] = z);
                        }
                        if(optKeysLen > 0) {
                            opt[++optLen] = optKeysLen === 1 ? optKeys[0] : optKeys;
                        }
                    }
                    $pathMapStack[offset = 4 * (++j + $boundLength)] = map[keys[index - 1]];
                    continue;
                }
            }
            delete $pathMapStack[offset = 4 * (j-- + $boundLength)];
            delete $pathMapStack[offset + 1];
            delete $pathMapStack[offset + 2];
            delete $pathMapStack[offset + 3];
        }
        
        req.pathSetIndex = $index;
        $requestedPaths[$requestedPaths.length] = req;
        $optimizedPaths[$optimizedPaths.length] = opt;
    }
    rule { } => { $[onPathMapMiss] }
}
export onPathMapMiss;
