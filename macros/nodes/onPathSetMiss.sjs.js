macro onPathSetMiss {
    rule infix { $ret = | (
        $optimizedBoundPath, $boundLength,
        $requestedPath, $optimizedPath,
        $requestedPaths, $optimizedPaths,
        $index, $path, $depth, $height, $(
        $stacks, $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
        var req = clone array $optimizedBoundPath,
            opt = clone array $optimizedPath,
            reqLen = req.length - 1,
            optLen = opt.length - 1,
            i = -1, n = $requestedPath.length,
            j = $depth, k = $height, x;
        
        while(++i < n) {
            req[++reqLen] = obj_exists($path[i + $boundLength]) && [$requestedPath[i]] || $requestedPath[i];
        }
        
        i = -1;
        n = $height - $depth;
        while(++i < n) {
            x = req[++reqLen] = $path[++j + $boundLength];
            x != null && (opt[++optLen] = x);
        }
        
        req.pathSetIndex = $index;
        $requestedPaths[$requestedPaths.length] = req;
        $optimizedPaths[$optimizedPaths.length] = opt;
    }
    rule { } => { $[onPathSetMiss] }
}
export onPathSetMiss;