macro addNullErrorKey {
    case infix { $retVal:ident = | _ ($path,
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var types = #{ $types ... };
    letstx $type = types.slice(0, 1);
    return #{
        if($type === ERROR) {
            $path[$path.length] = null;
        }
    }; }
    rule { } => { $[addNullErrorKey] }
}
export addNullErrorKey;