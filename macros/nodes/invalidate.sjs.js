macro invalidate {
    rule infix { $ret:ident = | (
        $key, $isKeySet, $depth, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
        $(
            $nodes = $parents[$key];
            $sizes = $nodes.size() * -1;
            $nodes = $parents.invalidate($key, $nodes);
            $parents.update($nodes, $sizes)
        ) ...
    }
    rule { } => { $[invalidate] }
}
export invalidate;