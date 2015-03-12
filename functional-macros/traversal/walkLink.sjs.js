macro walkLink {
    case infix { $retVal:ident = | $walk (
        $processNode, $processEdge,
        $path, $depth, $height,           $(
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
        /* Walk Link */
        var key, isKeySet = false;
        $height = $path.length;
        $retVal = tailrec follow_link($nodes (,) ... , $depth) {
            
            $type = $node.type();
            $value = $node.value($type);
            
            if($depth === $height || $node.isEdge($type, $value)) {
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
            
            return follow_link($nodes (,) ... , $depth + 1);
        }($($parents = $roots) (,) ... , $depth)
        
    }; }
}
export walkLink;