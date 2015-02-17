macro nodeAsJSON {
    case infix { $ret:ident = | $nodeAsJSON(
        $visit, $jsonKeys, $jsonParent, $json, $boundLength,
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
            $jsonKeys[$depth] = $isKeySet ? $key : undefined;
            if($node.exists() && $jsonParent.exists() && $isKeySet && (!($json = $jsonParent[$key]) || $json.isPrimitive())) {
                $json = $jsonParent[$key] = Object.create(null);
            }
        } else {
            $jsonKeys[$depth] = undefined;
        }
    }; }
    rule { } => { $[nodeAsJSON] }
}
export nodeAsJSON;