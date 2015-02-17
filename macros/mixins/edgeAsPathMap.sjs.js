macro edgeAsPathMap {
    case infix { $ret:ident = | $edgeAsPathMap(
        $visit, $jsons, $jsonParent, $boundLength, $boxed,
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
        if($depth >= $boundLength) {
            if($node.exists() && $jsonParent.exists()) {
                if($boxed === true) {
                    $jsonParent[$key] = $node;
                } else {
                    var val = clone object $value without falcorKeys;
                    if(obj_exists(val) && !Array.isArray(val)) {
                        val[$TYPE] = LEAF;
                    }
                    $jsonParent[$key] = val;
                }
            }
        }
    }; }
    rule { } => { $[edgeAsPathMap] }
}
export edgeAsPathMap;