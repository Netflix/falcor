macro setNodeMap {
    case infix { $ret:ident = | _ (
        $map,
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var roots   = #{ $roots   ... };
    var parents = #{ $parents ... };
    var nodes   = #{ $nodes   ... };
    var types   = #{ $types   ... };
    var values  = #{ $values  ... };
    var sizes   = #{ $sizes   ... };
    letstx $root   = roots  .slice(0, 1);
    letstx $parent = parents.slice(0, 1);
    letstx $node   = nodes  .slice(0, 1);
    letstx $type   = types  .slice(0, 1);
    letstx $value  = values .slice(0, 1);
    letstx $size   = sizes  .slice(0, 1);
    return #{
        if(typeof $map === "object") {
            for(var key in $map) {
                signedKey(key) && $((
                    $parents && (
                    $parents[key] = $map[key]) || true)) (&&) ... ;
            }
            $map = $map[$key];
        }
        var mapType = $map.type();
        var mapValue = $map.value(mapType);
        if(($node.isTerminus($type, $value)  ) && (
            $map.isBranch(mapType, mapValue) ))   {
            $type  = undefined;
            $value = $parent.createNode();
            $size  = $node.size();
            $node  = $parent.replace($node, $value, $key);
            $node  = $node.graph($key, $root, $parent, $type, $value);
            $node.evolve(__GENERATION_VERSION)
        }
    }; }
    rule { } => { $[setNodeMap] }
}
export setNodeMap;