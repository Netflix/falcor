macro invalidateEdge {
    rule infix { $retVal:ident = | (
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
        $(
            if($key == null) { $key = $nodes[__KEY]; }
            if($key != null) {
                $sizes = $nodes.size() * -1;
                $parents.invalidate($nodes, $key);
                $parents.update($nodes, $sizes, __GENERATION_VERSION)
            }
        ) ...
    }
    rule { } => { $[invalidateEdge] }
}
export invalidateEdge;