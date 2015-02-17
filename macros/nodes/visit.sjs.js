macro visit {
    case infix { $ret:ident = | $visit(
        $key, $isKeySet, $depth, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var parents = #{ $parents ... };
    var nodes = #{ $nodes ... };
    var types = #{ $types ... };
    var values = #{ $values ... };
    var timestamps  = #{ $timestamps ... };
    var expires  = #{ $expires ... };
    
    letstx $parent = parents.slice(0, 1);
    letstx $node = nodes.slice(0, 1);
    letstx $type = types.slice(0, 1);
    letstx $value = values.slice(0, 1);
    letstx $timestamp = timestamps.slice(0, 1);
    letstx $expire = expires.slice(0, 1);
    
    return #{
        $node  = $parent[$key];
        $type  = $node.type();
        $value = $node.value($type);
        $timestamp = $node.timestamp();
        $expire = $node.expires();
    }; }
    rule { } => { $[visit] }
}
export visit;