macro addRequestedKey {
    rule infix { $ret:ident = | ($visit, $list, $key, $isKeySet, $depth $rest ...) } => {
        $list[$list.length = $depth] = $key;
        $ret = $visit($key, $isKeySet, $depth $rest ...)
    }
    rule { } => { $[addRequestedKey] }
}
export addRequestedKey;