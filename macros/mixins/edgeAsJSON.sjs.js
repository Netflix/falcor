macro edgeAsJSON {
    case infix { $ret:ident = | $edgeAsJSON(
        $visit, $jsonKeys, $jsons, $jsonParent, $boundLength,
        $key, $isKeySet, $depth, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes  = #{ $nodes  ... };
    var values = #{ $values ... };
    letstx $node  = nodes .slice(0, 1);
    letstx $value = values.slice(0, 1);
    return #{
        $ret = $visit($key, $isKeySet, $depth, $(
            $roots, $parents, $nodes) (,) ... , $(
            $types, $values, $sizes, $timestamps, $expires) (,) ...
        )
        if($depth >= $boundLength) {
            $jsonKeys[$depth] = $isKeySet ? $key : undefined;
        } else {
            $jsonKeys[$depth] = undefined;
        }
    }; }
    rule { } => { $[edgeAsJSON] }
}
export edgeAsJSON;