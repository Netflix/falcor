macro followRef {
    case infix { $ret:ident = | $followRef(
        $follow, $list, $refPath,
        $refIndex, $refDepth, $refHeight, $refLength,
        $key, $isKeySet, $depth, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes   = #{ $nodes   ... };
    var types   = #{ $types   ... };
    var values  = #{ $values  ... };
    var expires = #{ $expires ... };
    letstx $node   = nodes  .slice(0, 1);
    letstx $type   = types  .slice(0, 1);
    letstx $value  = values .slice(0, 1);
    letstx $expire = expires.slice(0, 1);
    return #{
        do {
            $node.promote($expire);
            $refIndex = $depth + 1;
            $refDepth = 0;
            $node = $follow(
                $refDepth, $refHeight, $refLength, $value, $(
                $roots, $parents, $nodes) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
            $type = $node.type();
            $value = $node.value($type);
            $expire = $node.expires();
            if($node.isObject() && ($node.isExpired($expire) || $node.isInvalid())) {
                $node = $value = $node.expire();
            }
        } while($node.isLink($type, $value));
        if($node == null) {
            while($refDepth <= $refHeight) {
                $list[$refDepth] = $refPath[$refDepth++];
            }
        }
    }; }
    rule { } => { $[followRef] }
}
export followRef;