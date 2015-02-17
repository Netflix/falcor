macro nodeAsJSONG {
    case infix { $ret:ident = | $nodeAsJSONG(
        $visit, $jsonParent, $json, $boxed,
        $key, $isKeySet, $depth, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes  = #{ $nodes  ... };
    var types  = #{ $types  ... };
    var values = #{ $values ... };
    letstx $node  = nodes .slice(0, 1);
    letstx $type  = types .slice(0, 1);
    letstx $value = values.slice(0, 1);
    return #{
        $ret = $visit($key, $isKeySet, $depth, $(
            $roots, $parents, $nodes) (,) ... , $(
            $types, $values, $sizes, $timestamps, $expires) (,) ...
        )
        if($node.exists() && $jsonParent.exists()) {
            if($node.isBranch($type, $value)) {
                if(!($json = $jsonParent[$key]) || $json.isPrimitive()) {
                    $json = $jsonParent[$key] = Object.create(null);
                }
            } else {
                if($boxed === true) {
                    $jsonParent[$key] = $node;
                } else {
                    var val = clone object $value without internalKeys;
                    if(!$type && obj_exists(val) && !Array.isArray(val)) {
                        val[$TYPE] = LEAF;
                    }
                    $jsonParent[$key] = val;
                }
            }
        }
    }; }
    rule { } => { $[nodeAsJSONG] }
}
export nodeAsJSONG;
