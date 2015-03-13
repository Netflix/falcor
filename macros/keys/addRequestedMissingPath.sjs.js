macro addRequestedMissingPath {
    rule infix { $retVal:ident = | (
        $paths, $path, $orig, $height,
        $bound, $index, $depth $rest ...
    ) } => {
        var i = -1, j = -1, l = 0,
            n = $bound.length,
            k = $path.length,
            m, x, y, req = [];
        while(++i < n) { req[i] = $bound[i]; }
        while(++j < k) {
            if(exists(x = $path[j])) {
                req[i++] = obj_exists(y = $orig[l++]) && [x] || x;
            }
        }
        m = n + l + $height - $depth;
        while(i < m) {
            req[i++] = $orig[l++];
        }
        req.length = i;
        req.pathSetIndex = $index;
        $paths[$paths.length] = req;
    }
    rule { } => { $[addRequestedMissingPath] }
}
export addRequestedMissingPath;