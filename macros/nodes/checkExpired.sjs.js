macro checkExpired {
    case infix { $ret:ident = | $checkExpired($visit,
        $key, $isKeySet, $depth, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes   = #{ $nodes   ... };
    var values  = #{ $values  ... };
    var expires = #{ $expires ... };
    letstx $node   = nodes.slice(0, 1);
    letstx $value  = values.slice(0, 1);
    letstx $expire = expires.slice(0, 1);
    return #{
        $ret = $visit(
            $key, $isKeySet, $depth, $(
            $roots, $parents, $nodes) (,) ... , $(
            $types, $values, $sizes, $timestamps, $expires) (,) ...
        )
        if($node.isObject() && ($node.isExpired($expire) || $node.isInvalid())) {
            $node = $value = $node.expire();
        }
    }; }
    rule { } => { $[checkExpired] }
}
export checkExpired;