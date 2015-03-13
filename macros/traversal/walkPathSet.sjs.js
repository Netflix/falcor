macro walkPathSet {
    case infix { $retVal:ident = | _(
        $processKey, $processNode, $processLink, $processEdge,
        $path, $depth, $height,                    $(
        $stacks, $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    
    var nodes   = #{ $nodes   ... };
    var types   = #{ $types   ... };
    var values  = #{ $values  ... };
    var expires = #{ $expires ... };
    
    letstx $node   = nodes  .slice(0, 1);
    letstx $type   = types  .slice(0, 1);
    letstx $value  = values .slice(0, 1);
    letstx $expire = expires.slice(0, 1);
    
    return #{
        /* Walk Path Set */
        var key = undefined, isKeySet = false;
        $height = $path.length;
        $retVal = tailrec follow_path_set($nodes (,) ... , $depth) {
            
            $type  = $node.type();
            $value = $node.value($type);
            
            if($depth < $height && $node.isLink($type, $value)) {
                if($node.isExpiredOrInvalid($expire)) {
                    $type  = undefined;
                    $value = undefined;
                    $node  = $node.expire();
                }
                
                /* Process Link */
                $node = $processLink($depth, key, isKeySet, $(
                    $roots, $parents, $nodes    ) (,) ... , $(
                    $types, $values, $sizes, $timestamps, $expires) (,) ...
                )
                if($node.isEdge($type, $value)) {
                    key = null;
                    return follow_path_set($nodes (,) ... , $depth);
                }
            } else if($depth === $height || !!$type || $node.isPrimitive()) {
                if($node.isExpiredOrInvalid($expire)) {
                    $type  = undefined;
                    $value = undefined;
                    $node  = $node.expire();
                }
                
                /* Process Edge */
                $node = $processEdge($depth, key, isKeySet, $(
                    $roots, $parents, $nodes    ) (,) ... , $(
                    $types, $values, $sizes, $timestamps, $expires) (,) ...
                )
                return $node;
            }
            
            key = $path[$depth];
            isKeySet = $processKey($path, $depth, key) $(
            $stacks[$depth - 1] = $parents = $nodes;) ...
            /* Process Node */
            $node = $processNode($depth, key, isKeySet, $(
                $roots, $parents, $nodes    ) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
            
            return follow_path_set($nodes (,) ... , $depth + 1);
        }($($parents = $stacks[$depth - 1]) (,) ... , $depth)
    }; }
    rule { } => { $[walkPathSet] }
}
export walkPathSet;
