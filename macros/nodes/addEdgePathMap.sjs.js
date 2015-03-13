macro addEdgePathMap {
    case infix { $retVal:ident = | _ (
        $offset, $jsons, $jsonRoot, $jsonParent, $json,
        $keysets, $materialized, $boxed, $errorsAsValues,
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
        // Insert the JSON value if:
        //  1. The caller supplied a JSON root seed.
        //  2. The path depth is past the bound path length.
        //  3. The current node is a leaf or reference.
        if(($jsonRoot != null           ) && (
            $depth >= $offset           ) && (
            $node.isEdge($type, $value)))    {
            
            var jsonKey = undefined, jsonDepth = $depth;
            
            do {
                if (jsonKey == null) { jsonKey = $keysets[jsonDepth]; }
                if (($jsonParent = $jsons[--jsonDepth]) != null && (jsonKey != null)) {
                    $json = $node.getJSONEdge($type, $value, $materialized, $boxed, $errorsAsValues)
                    $jsonParent[jsonKey] = $json;
                    break;
                }
            } while(jsonDepth >= $offset - 2);
        }
    }; }
    rule { } => { $[addEdgePathMap] }
}
export addEdgePathMap;
