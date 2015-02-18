macro walkPathMap {
    case infix { $ret:ident = | $walk (
        $stepKeySet, $stepNode, $stepEdge,
        $appendNullKey,
        $pathMapStack, $pathMap, $depth, $height, $length,
        $pathMapExpr:expr, $(
        $stacks, $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    
    var stacks  = #{ $stacks  ... };
    var roots   = #{ $roots   ... };
    var parents = #{ $parents ... };
    var nodes   = #{ $nodes   ... };
    var types   = #{ $types   ... };
    var values  = #{ $values  ... };
    
    letstx $stack  = stacks .slice(0, 1);
    letstx $root   = roots  .slice(0, 1);
    letstx $parent = parents.slice(0, 1);
    letstx $node   = nodes  .slice(0, 1);
    letstx $type   = types  .slice(0, 1);
    letstx $value  = values .slice(0, 1);
    
    return #{
        var offset, keys, index, key, isKeySet;
        $pathMap = $pathMapExpr;
        $height = ($length = $depth) - 1;
        
        $parent = $stack[$depth - 1];
        $type   = $parent.type();
        $value  = $parent.value($type);
        if($parent.isEdge($type, $value)) {
            $node = $parent;
            $parent = $stack;
            key = $depth - 1;
            isKeySet = false;
            $node = $stepEdge(key, isKeySet, $depth, $(
                $roots, $parents, $nodes) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
            $ret = $node;
        } else {
            $ret = tailrec follow_path_map($parents (,) ... , $depth) {
                if((obj_exists(
                    $pathMap = $pathMapStack[offset = $depth * 4])                                             ) &&  (
                    keys     = $pathMapStack[offset + 1] || ($pathMapStack[offset + 1] = Object.keys($pathMap))) && ((
                    index    = $pathMapStack[offset + 2] || ($pathMapStack[offset + 2] = 0))            || true) && ((
                    key      = $pathMapStack[offset + 3])                                               || true) && ((
                    isKeySet = keys.length > 1) || keys.length > 0                                             ))    {
                    key = keys[index];
                    if(key == __NULL) {
                        $pathMapStack[offset = 3 * ($depth + 1)] = $pathMap[__NULL];
                        $pathMapStack[offset + 1] = keys;
                        $pathMapStack[offset + 2] = 0;
                        return follow_path_map($($stacks[$depth] = $nodes) (,) ... , $depth + 1);
                    } else if(key === $SIZE || internalKeys(key)) {
                        return $node;
                    } else if(falcorKeys(key)) {
                        $parent[key] || ($parent[key] = $pathMap[key]);
                        return $node;
                    } else {
                        isKeySet = $stepKeySet($pathMap, $depth, key)
                        $pathMapStack[offset = 4 * ($depth + 1)] = $pathMap = $pathMap[key];
                        if((obj_exists($pathMap)) && (
                            $pathMap[$TYPE] === undefined       ) && (
                            Array.isArray($pathMap) === false   ) && (
                            keys = Object.keys($pathMap)        ) && (
                            keys.length > 0)                    )    {
                            $node = $stepNode(key, isKeySet, $depth,$(
                                $roots, $parents, $nodes) (,) ... , $(
                                $types, $values, $sizes, $timestamps, $expires) (,) ...
                            )
                            if($node.isEdge($type, $value)) {
                                return $node;
                            }
                            $pathMapStack[offset + 1] = keys;
                            $pathMapStack[offset + 3] = key;
                            return follow_path_map($($stacks[$depth] = $nodes) (,) ... , $depth + 1);
                        }
                    }
                }
                
                if(key != null) {
                    $node = $stepEdge(key, isKeySet, $depth, $(
                        $roots, $parents, $nodes) (,) ... , $(
                        $types, $values, $sizes, $timestamps, $expires) (,) ...
                    )
                    
                    $appendNullKey = false;
                }
                
                return $node;
            }($($nodes = $stacks[$depth - 1]) (,) ... , $depth);
        }
    }; }
    rule { } => { $[walkPathMap] }
}
export walkPathMap;
