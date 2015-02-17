macro optimizeNode {
    case infix { $ret:ident = | $optimize (
        $visit, $optimize,
        $key, $isKeySet, $depth, $(
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
        $ret = $visit(
            $key, $isKeySet, $depth, $(
            $roots, $parents, $nodes) (,) ... , $(
            $types, $values, $sizes, $timestamps, $expires) (,) ...
        )
        if($node.isLink($type, $value)) {
            $node = $optimize(
                $key, $isKeySet, $depth, $(
                $roots, $parents, $nodes) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
        }
    }; }
    rule { } => { $[optimizeNode] }
}
export optimizeNode;