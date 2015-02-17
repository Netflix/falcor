macro setNode {
    case infix { $ret:ident = | $setNode($visit,
        $key, $isKeySet, $depth, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var roots   = #{ $roots   ... };
    var parents = #{ $parents ... };
    var nodes   = #{ $nodes   ... };
    var types   = #{ $types   ... };
    var values  = #{ $values  ... };
    var expires = #{ $expires ... };
    letstx $root   = roots  .slice(0, 1);
    letstx $parent = parents.slice(0, 1);
    letstx $node   = nodes  .slice(0, 1);
    letstx $type   = types  .slice(0, 1);
    letstx $value  = values .slice(0, 1);
    letstx $expire = expires.slice(0, 1);
    return #{
        $ret = $visit(
            $key, $isKeySet, $depth, $(
            $roots, $parents, $nodes) (,) ... , $(
            $types, $values, $sizes, $timestamps, $expires) (,) ...
        )
        if($node.isTerminus($type, $value)) {
            $type  = undefined;
            $value = Object.create(null);
            $size  = $node.size();
            $node  = $parent.replace($key, $node, $value);
            $node  = $node.graph($key, $root, $parent, $type, $value);
            $parent.update($node, $size, __GENERATION_VERSION, false)
        }
    }; }
    rule { } => { $[setNode] }
}
export setNode;