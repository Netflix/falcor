macro unwindPathMap {
    rule infix { $ret:ident = | ($pathMapStack, $path, $index, $depth) } => {
        var offset, keys, index;
        while(($depth > -1) && (
            keys  = $pathMapStack[(offset = 4 * $depth--) + 1]) && ((
            index = $pathMapStack[offset + 2]) || true        ) && ((
            $pathMapStack[offset + 2] = ++index) >= keys.length))   {
            delete $pathMapStack[offset + 0];
            delete $pathMapStack[offset + 1];
            delete $pathMapStack[offset + 2];
            delete $pathMapStack[offset + 3];
        }
    }
    rule { } => { $[unwindPathMap] }
}
export unwindPathMap;