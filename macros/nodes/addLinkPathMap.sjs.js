macro addLinkPathMap {
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
        //  1. The caller supplied a JSON root seed.
        //  2. The path depth is past the bound path length.
        //  3. The current node is a branch or reference.
        if($jsonRoot != null && $depth >= $offset) {
            
            /* Note: we have to read the type and value here since this node hasn't previously been visited. */
            $type = $node.type();
            $value = $node.value($type);
            
            if($node.isNode($type, $value)) {
            
                var jsonKey = undefined, jsonDepth = $depth;
                
                do {
                    if (jsonKey == null) { jsonKey = $keysets[jsonDepth]; }
                    if (($jsonParent = $jsons[--jsonDepth]) != null && (jsonKey != null)) {
                        if(($json = $jsonParent[jsonKey]) == null) {
                            $json = $jsonParent[jsonKey] = $jsonParent.createJSONNode();
                        } else if(typeof $json !== "object") {
                            throw new Error("Fatal Falcor Error: encountered value in branch position while building Path Map.");
                        }
                        $json[__KEY] = jsonKey;
                        $json[__GENERATION] = $node[__GENERATION] || 0;
                        $jsonParent = $json;
                        break;
                    }
                } while(jsonDepth >= $offset - 2);
                
                $jsons[$depth] = $jsonParent;
            }
        }
    }; }
    rule { } => { $[addLinkPathMap] }
}
export addLinkPathMap;
