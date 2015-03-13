macro addLinkJSON {
    case infix { $retVal:ident = | _ (
        $offset, $jsons, $jsonRoot, $jsonParent, $json, $keysets,
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes  = #{ $nodes ... };
    var types  = #{ $types ... };
    var values = #{ $values ... };
    letstx $node  = nodes .slice(0, 1);
    letstx $type  = types.slice(0, 1);
    letstx $value = values.slice(0, 1);
    return #{
        // Only create a branch if:
        //  1. The current key is a keyset.
        //  2. The caller supplied a JSON root seed.
        //  3. The path depth is past the bound path length.
        //  4. The current node is a branch or reference.
        if($isKeySet === true && $jsonRoot != null && $depth >= $offset) {
            
            /* Note: we have to read the type and value here since this node hasn't previously been visited. */
            $type = $node.type();
            $value = $node.value($type);
            
            if($node.isNode($type, $value)) {
                var jsonKey = undefined, jsonDepth = $depth;
                do {
                    if (jsonKey == null) { jsonKey = $keysets[jsonDepth]; }
                    if (($jsonParent = $jsons[--jsonDepth]) != null && (jsonKey != null)) {
                        if(($json = $jsonParent[jsonKey]) == null)   {
                            $json = $jsonParent[jsonKey] = Object.create(null);
                        }
                        $jsonParent = $json;
                        break;
                    }
                } while(jsonDepth >= $offset - 2);
                
                $jsons[$depth] = $jsonParent;
            }
        }
    }; }
    rule { } => { $[addLinkJSON] }
}
export addLinkJSON;
