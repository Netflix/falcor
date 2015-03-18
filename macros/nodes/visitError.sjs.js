macro visitError {
    case infix { $retVal:ident = | _ (
        $operation,
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes = #{ $nodes ... };
    var types = #{ $types ... };
    letstx $type = types.slice(0, 1);
    letstx $node = nodes.slice(0, 1);
    return #{
        else if($type === ERROR) {
            $node.promote($node.expires())
            $retVal = $operation(
                $depth, $key, $isKeySet,            $(
                $roots, $parents, $nodes) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
        }
    }; }
    rule { } => { $[visitError] }
}
export visitError;