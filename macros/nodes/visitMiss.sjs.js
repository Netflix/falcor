macro visitMiss {
    case infix { $retVal:ident = | _ (
        $operation, $refreshing,
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes = #{ $nodes ... };
    letstx $node = nodes.slice(0, 1);
    return #{
        else if($refreshing === true || $node == null) {
            $retVal = $operation($depth, $key, $isKeySet, $(
                $roots, $parents, $nodes      ) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
        }
    }; }
    rule { } => { $[visitMiss] }
}
export visitMiss;