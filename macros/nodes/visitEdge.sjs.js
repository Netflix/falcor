macro visitEdge {
    rule infix { $retVal:ident = | (
        $operation,
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
        if($key != null) {
            $retVal = $operation($depth, $key, $isKeySet, $(
                $roots, $parents, $nodes      ) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
        }
    }
    rule { } => { $[visitEdge] }
}
export visitEdge;