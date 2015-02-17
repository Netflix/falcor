macro walkReference {
    case infix { $ret:ident = | $walk (
        $stepKeySet, $stepNode, $stepEdge,
        $appendNullKey,
        $path, $depth, $height, $length,
        $pathExpr:expr, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    
    var roots   = #{ $roots   ... };
    var parents = #{ $parents ... };
    var nodes   = #{ $nodes   ... };
    var types   = #{ $types   ... };
    var values  = #{ $values  ... };
    
    letstx $root   = roots  .slice(0, 1);
    letstx $parent = parents.slice(0, 1);
    letstx $node   = nodes  .slice(0, 1);
    letstx $type   = types  .slice(0, 1);
    letstx $value  = values .slice(0, 1);
    
    return #{
        var key, isKeySet;
        $path = $pathExpr;
        $height = ($length = $path.length) - 1;
        
        $parent = $root;
        $type   = $parent.type();
        $value  = $parent.value($type);
        if($parent.isEdge($type, $value)) {
            $ret = $node = $parent;
        } else {
            $ret = tailrec follow_path($parents (,) ... , $depth) {
                key = $path[$depth];
                isKeySet = $stepKeySet($path, $depth, key)
                if(key != null) {
                    if($depth < $height) {
                        $node = $stepNode(key, isKeySet, $depth, $(
                            $roots, $parents, $nodes) (,) ... , $(
                            $types, $values, $sizes, $timestamps, $expires) (,) ...
                        )
                        if($appendNullKey = $node.isEdge($type, $value)) {
                            return $node;
                        }
                        return follow_path($nodes (,) ... , $depth + 1);
                    } else if($depth === $height) {
                        $node = $stepEdge(key, isKeySet, $depth, $(
                            $roots, $parents, $nodes) (,) ... , $(
                            $types, $values, $sizes, $timestamps, $expires) (,) ...
                        )
                        $appendNullKey = $node.isEdge($type, $value);
                        return $node;
                    }
                } else if($depth < $height) {
                    return follow_path($nodes (,) ... , $depth + 1);
                }
                return $node;
            }($roots (,) ... , $depth);
        }
    }; }
    rule { } => { $[walkReference] }
}
export walkReference;
