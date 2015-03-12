macro setNode {
    case infix { $ret:ident = | _ (
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var roots   = #{ $roots   ... };
    var parents = #{ $parents ... };
    var nodes   = #{ $nodes   ... };
    var types   = #{ $types   ... };
    var values  = #{ $values  ... };
    var sizes   = #{ $sizes   ... };
    letstx $root   = roots  .slice(0, 1);
    letstx $parent = parents.slice(0, 1);
    letstx $node   = nodes  .slice(0, 1);
    letstx $type   = types  .slice(0, 1);
    letstx $value  = values .slice(0, 1);
    letstx $size   = sizes  .slice(0, 1);
    return #{
        if($node.isTerminus($type, $value)) {
            $type  = undefined;
            $value = $parent.createNode();
            $size  = $node.size();
            $node  = $parent.replace($node, $value, $key);
            $node  = $node.graph($key, $root, $parent, $type, $value);
            $node.evolve(__GENERATION_VERSION)
        }
    }; }
    rule { } => { $[setNode] }
}
export setNode;