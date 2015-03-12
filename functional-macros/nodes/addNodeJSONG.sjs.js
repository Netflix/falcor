macro addNodeJSONG {
    case infix { $retVal:ident = | _ (
        $jsonRoot, $jsonParent, $json, $boxed,
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
        // Create a JSONG branch or insert a reference if:
        //  1. The caller provided a JSONG root seed.
        //  2. The current node is a branch or reference.
        if($jsonRoot != null) {
            /* Note: we have to read the type and value here since this node hasn't previously been visited. */
            $type = $node.type();
            $value = $node.value($type);
            if($node.isLink($type, $value)) {
                if($boxed === true) {
                    $json = $node;
                } else {
                    $json = $value;
                }
                $jsonParent[$key] = $json;
            } else if($type === undefined && $node.isObject()) {
                if(($json = $jsonParent[$key]) == null) {
                    $json = Object.create(null);
                } else if(typeof $json !== "object") {
                    throw new Error("Fatal Falcor Error: encountered value in branch position while building JSON Graph.");
                }
                $jsonParent[$key] = $json;
            }
        }
    }; }
    rule { } => { $[addNodeJSONG] }
}
export addNodeJSONG;
