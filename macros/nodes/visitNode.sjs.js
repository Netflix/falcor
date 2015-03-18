macro visitNode {
    rule infix { $retVal:ident = | (
        $operation,
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
        if($key != null) { $(
            $nodes  = $parents && $parents[$key];) ...
            $retVal = $operation($depth, $key, $isKeySet, $(
                $roots, $parents, $nodes      ) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
        }
    }
    rule { } => { $[visitNode] }
}
export visitNode;