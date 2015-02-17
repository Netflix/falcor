macro getRequestedKeySet {
    rule infix { $isKeySet:ident = | ($getKeySet, $list, $boundLength, $path, $depth, $key) } => {
        $isKeySet = $getKeySet($path, $depth, $key)
        $depth >= $boundLength && ($list[$list.length = $depth - $boundLength] = $key);
    }
    rule { } => { $[getRequestedKeySet] }
}
export getRequestedKeySet;