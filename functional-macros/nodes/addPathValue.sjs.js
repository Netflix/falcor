macro addPathValue {
    case infix { $retVal:ident = | _ (
        $array, $callback, $path,
        $materialized, $boxed, $errorsAsValues,
        $depth, $key, $isKeySet,          $(
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
        var pbv = Object.create(null),
            i = -1, n = $path.length,
            val, copy = new Array(n);
        while(++i < n) { copy[i] = $path[i]; }
        val = $node.getJSONEdge($type, $value, $materialized, $boxed, $errorsAsValues)
        pbv.path = copy;
        pbv.value = val;
        if($array) {
            $array[$array.length] = pbv;
        } else if($callback) {
            $callback(pbv);
        }
    }; }
    rule { } => { $[addPathValue] }
}
export addPathValue;