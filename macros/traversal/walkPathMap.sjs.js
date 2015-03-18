macro walkPathMap {
    case infix { $retVal:ident = | $walk (
        $processKey, $processNode, $processLink, $processEdge,
        $mapStack, $map, $depth, $height,  $(
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
        /* Walk Path Map */
        var isTerminus = false, offset = 0,
            keys = undefined, index  = undefined, 
            key = undefined, isKeySet = false;
        
        $retVal = tailrec follow_path_map($nodes (,) ... , $depth) {
            
            $height = $depth;
            $type  = $node.type();
            $value = $node.value($type);
            
            if((isTerminus = (!obj_exists(
                $map = $mapStack[offset = $depth * 4]                                      )) ||  (
                $map[$TYPE] !== undefined                                                   ) ||  (
                Array.isArray($map)                                                         ) ||!((
                keys  = $mapStack[offset + 1] || ($mapStack[offset + 1] = Object.keys($map))) && ((
                index = $mapStack[offset + 2] || ($mapStack[offset + 2] = 0))        || true) && ((
                isKeySet = keys.length > 1)   || keys.length > 0                          ))) ||  (
                $node.isEdge($type, $value)                                                ))     {
                
                if($node.isExpiredOrInvalid($expire)) {
                    $type = undefined;
                    $value = undefined;
                    $node = $node.expire();
                }
                
                if(!isTerminus && $node.isLink($type, $value)) {
                    /* Process Link */
                    $node = $processLink($depth, key, isKeySet, $(
                        $roots, $parents, $nodes    ) (,) ... , $(
                        $types, $values, $sizes, $timestamps, $expires) (,) ...
                    )
                    if($node.isEdge($type, $value)) {
                        key = null;
                        return follow_path_map($nodes (,) ... , $depth);
                    }
                } else {
                    /* Process Edge */
                    $node = $processEdge($depth, key, isKeySet, $(
                        $roots, $parents, $nodes    ) (,) ... , $(
                        $types, $values, $sizes, $timestamps, $expires) (,) ...
                    );
                    return $node;
                }
            }
            
            if((key = keys[index]) == null) {
                return $node;
            } else if((
                key === __NULL  && ((key = null) || true)) || (
                !falcorKey(key) && (($mapStack[($depth + 1) * 4] = $map[key]) || true))) { 
                $mapStack[(($depth + 1) * 4) + 3] = key;
            } else {
                $mapStack[offset + 2] = index + 1;
                return follow_path_map($nodes (,) ... , $depth);
            } $(
            
            $stacks[$depth - 1]   = $parents = $nodes;) ...
            /* Process Node */
            $node = $processNode($depth, key, isKeySet, $(
                $roots, $parents, $nodes    ) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
            
            return follow_path_map($nodes (,) ... , $depth + 1);
        }($($parents = $stacks[$depth - 1]) (,) ... , $depth);
    }; }
}
export walkPathMap;