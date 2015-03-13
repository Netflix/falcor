macro walkPath {
    case infix { $retVal:ident = | $walk (
        $processNode, $processLink, $processEdge,
        $path, $depth, $height, $(
        $roots, $parents, $nodes) (,) ... $(
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
        /* Walk Path */
        var key, isKeySet = false;
        $height = $path.length;
        $retVal = tailrec follow_path($nodes (,) ... , $depth) {
            
            $type = $node.type();
            $value = $node.value($type);
            
            if($depth < $height && $node.isLink($type, $value)) {
                if($node.isExpiredOrInvalid($expire)) {
                    $type = undefined;
                    $value = undefined;
                    $node = $node.expire();
                }
                
                /* Process Link */
                $node = $processLink($depth, key, isKeySet, $(
                    $roots, $parents, $nodes    ) (,) ... , $(
                    $types, $values, $sizes, $timestamps, $expires) (,) ...
                )
                if($node.isEdge($type, $value)) {
                    key = null;
                    return follow_path($nodes (,) ... , $depth);
                }
            } else if($depth === $height || !!$type || $node.isPrimitive()) {
                if($node.isExpiredOrInvalid($expire)) {
                    $type = undefined;
                    $value = undefined;
                    $node = $node.expire();
                }
                /* Process Edge */
                $node = $processEdge($depth, key, isKeySet, $(
                    $roots, $parents, $nodes    ) (,) ... , $(
                    $types, $values, $sizes, $timestamps, $expires) (,) ...
                )
                return $node;
            }
            
            key = $path[$depth]; $(
            $parents = $nodes;) ...
            /* Process Node */
            $node = $processNode($depth, key, isKeySet, $(
                $roots, $parents, $nodes    ) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
            
            return follow_path($nodes (,) ... , $depth + 1);
        }($($parents = $roots) (,) ... , $depth);
    }; }
}
export walkPath;