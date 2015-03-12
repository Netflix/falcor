macro setEdge {
    case infix { $ret:ident = | _ (
        $message,
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
        
        var newNode, sizeOffset, edgeSize = $node.size();
        
        $type   = $message.type();
        $value  = $message.value($type);
        
        newNode = $message.wrapper($type, $value, $size);
        
        $node   = $parent.replace($node, newNode, $key);
        $type   = $node.type();
        $node   = $node.graph($key, $root, $parent, $type, $value);
        
        sizeOffset = edgeSize - $size;
        
        $parent.update($node, sizeOffset, __GENERATION_VERSION)
    }; }
    rule { } => { $[setEdge] }
}
export setEdge;