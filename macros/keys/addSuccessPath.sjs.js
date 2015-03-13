macro addSuccessPath {
    rule infix { $retVal:ident = | ($paths, $path $rest ...) } => {
        var i = -1, n = $path.length, copy = new Array(n);
        while(++i < n) { copy[i] = $path[i]; }
        $paths[$paths.length] = copy;
    }
    rule { } => { $[addSuccessPath] }
}
export addSuccessPath;