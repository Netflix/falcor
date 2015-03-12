macro addNullLeafKey {
    case infix { $retVal:ident = | _ ($path,
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
        if($node.isTerminus($type, $value)) {
            $path[$path.length] = null;
        }
    }; }
    rule { } => { $[addNullLeafKey] }
}
export addNullLeafKey;