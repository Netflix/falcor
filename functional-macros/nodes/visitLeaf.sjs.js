macro visitLeaf {
    case infix { $retVal:ident = | _ (
        $operation, $hasValue,
        $materialized, $errorsAsValues,
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
        if(($materialized === true  ) || ((
            $value !== undefined    ) && ((
            $errorsAsValues === true) ||  (
            $type  !== ERROR     ))))     {
            $hasValue = true;
            $node.promote($node.expires());
            $retVal = $operation($depth, $key, $isKeySet, $(
                $roots, $parents, $nodes      ) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
        }
    }; }
    rule { } => { $[visitLeaf] }
}
export visitLeaf;