macro addEdgeJSONG {
    case infix { $retVal:ident = | _ (
        $jsonRoot, $jsonParent, $json,
        $materialized, $boxed, $errorsAsValues,
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes  = #{ $nodes  ... };
    var types  = #{ $types  ... };
    var values = #{ $values ... };
    letstx $node  = nodes .slice(0, 1);
    letstx $type  = types .slice(0, 1);
    letstx $value = values.slice(0, 1);
    return #{
        // Create a JSONG value if:
        //  1. The caller provided a JSONG root seed.
        //  2. The key isn't null.
        //  3. The current node is a value or reference.
        if(($jsonRoot   != null         ) && (
            $key        != null         ) && (
            $node.isEdge($type, $value)))    {
            $json = $node.getJSONEdge($type, $value, $materialized, $boxed, $errorsAsValues)
            $jsonParent[$key] = $json;
        }
    }; }
    rule { } => { $[addEdgeJSONG] }
}
export addEdgeJSONG;
