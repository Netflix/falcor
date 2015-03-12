macro depthToKeySet {
    rule infix { $retVal:ident = | ($path, $depth) } => {
        var key;
        $retVal = tailrec unroll($depth) {
            if($depth < 0) {
                return ($path.depth = 0) - 1
            }
            if(!obj_exists(key = $path[$depth])) {
                return unroll($path.depth = $depth - 1);
            }
            if(Array.isArray(key)) {
                if(++key.index === key.length) {
                    if(!obj_exists(key = key[key.index = 0])) {
                        return unroll($path.depth = $depth - 1);
                    }
                } else {
                    return $path.depth = $depth;
                }
            }
            if(++key[__OFFSET] > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
                key[__OFFSET] = key.from;
                return unroll($path.depth = $depth - 1);
            }
            return $path.depth = $depth;
        }($depth - 1)
    }
    rule { } => { $[depthToKeySet] }
}
export depthToKeySet;