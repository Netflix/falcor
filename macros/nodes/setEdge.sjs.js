macro setEdge {
    case infix { $ret:ident = | $setEdge(
        $visit, $message,
        $key, $isKeySet, $depth, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var roots   = #{ $roots   ... };
    var parents = #{ $parents ... };
    var nodes   = #{ $nodes   ... };
    var types   = #{ $types   ... };
    var values  = #{ $values  ... };
    var sizes   = #{ $sizes   ... };
    var timestamps = #{ $timestamps ... };
    var expires = #{ $expires ... };
    letstx $root   = roots  .slice(0, 1);
    letstx $parent = parents.slice(0, 1);
    letstx $node   = nodes  .slice(0, 1);
    letstx $type   = types  .slice(0, 1);
    letstx $value  = values .slice(0, 1);
    letstx $size   = sizes  .slice(0, 1);
    letstx $timestamp = timestamps.slice(0, 1);
    letstx $expire = expires.slice(0, 1);
    return #{
        
        $ret = $visit(
            $key, $isKeySet, $depth, $(
            $roots, $parents, $nodes) (,) ... , $(
            $types, $values, $sizes, $timestamps, $expires) (,) ...
        )
        
        $type      = $message.type();
        $value     = $message.value($type);
        $timestamp = $message.timestamp();
        $expire    = $message.expires();
        
        var newNode, size_offset, leafSize = $node.size();
        
        newNode    = $message.wrapper($type, $value, $size);
        $node      = $parent.replace($key, $node, newNode);
        $node      = $node.graph($key, $root, $parent, $type, $value);
        
        size_offset = leafSize - $size;
        
        $parent.update($node, size_offset, __GENERATION_VERSION)
    }; }
    rule { } => { $[setEdge] }
}
export setEdge;