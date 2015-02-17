macro getKeySet {
    rule infix { $isKeySet:ident = | ($path, $depth, $key) } => {
        if($isKeySet = obj_exists($key)) {
            if(Array.isArray($key)) {
                if(obj_exists($key = $key[$key.index || ($key.index = 0)])) {
                    $key = ($key[__OFFSET] === undefined) && ($key[__OFFSET] = $key.from || ($key.from = 0)) || $key[__OFFSET];
                }
            } else {
                $key = ($key[__OFFSET] === undefined) && ($key[__OFFSET] = $key.from || ($key.from = 0)) || $key[__OFFSET];
            }
        }
        if($key === __NULL) { $key = null; }
    }
    rule { } => { $[getKeySet] }
}
export getKeySet;