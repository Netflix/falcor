macro onNext {
    rule infix { $ret:ident = | (
        $requestedPath, $optimizedPath,
        $requestedPaths, $optimizedPaths,
        $appendNullKey, $index, $path, $depth, $height, $(
        $stacks, $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
        
        var opt = clone array $optimizedPath,
            req = clone array $requestedPath;
        
        if($appendNullKey === true) { req[req.length] = null; }
        $requestedPaths[$requestedPaths.length] = req;
        $optimizedPaths[$optimizedPaths.length] = opt;
    }
    rule { } => { $[onNext] }
}
export onNext;