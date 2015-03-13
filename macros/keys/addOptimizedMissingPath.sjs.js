macro addOptimizedMissingPath {
    rule infix { $retVal:ident = | (
        $paths, $path, $orig, $height,
        $depth $rest ...
    ) } => {
        var i = -1, n = $path.length,
            opt = new Array(n + $height - $depth), j, x;
        while(++i < n) { opt[i] = $path[i]; }
        for(j = $depth, n = $height; j < n;) {
            if(exists(x = $orig[j++])) {
                opt[i++] = x;
            }
        }
        opt.length = i;
        $paths[$paths.length] = opt;
    }
    rule { } => { $[addOptimizedMissingPath] }
}
export addOptimizedMissingPath;
