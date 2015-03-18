macro addErrorValue {
    case infix { $retVal:ident = | _ (
        $array, $path,
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes  = #{ $nodes  ... };
    letstx $node  = nodes .slice(0, 1);
    return #{
        var pbv = Object.create(null),
            i = -1, n = $path.length,
            val, copy = new Array(n);
        while(++i < n) { copy[i] = $path[i]; }
        val = $node.clone($node, internalKey);
        pbv.path = copy;
        pbv.value = val;
        $array[$array.length] = pbv;
    }; }
    rule { } => { $[addErrorValue] }
}
export addErrorValue;
