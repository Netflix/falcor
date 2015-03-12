macro addLinkJSONG {
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
        // Create a JSONG branch, or insert the value if:
        //  1. The caller provided a JSONG root seed.
        //  2. The node is a branch or value, or materialized mode is on.
        if($jsonRoot != null) {
            if($node != null) {
                /* Note: we have to read the type and value here since this node hasn't previously been visited. */
                $type  = $node.type();
                $value = $node.value();
                if($node.isLink($type, $value)) {
                    if($boxed === true) {
                        $json = $node;
                    } else {
                        $json = $value;
                    }
                } else if($type === undefined && $node.isObject()) {
                    if(($json = $jsonParent[$key]) == null) {
                        $json = Object.create(null);
                    } else if(typeof $json !== "object") {
                        throw new Error("Fatal Falcor Error: encountered value in branch position while building JSON Graph.");
                    }
                } else if($materialized === true) {
                    if($node == null) {
                        $json = Object.create(null);
                        $json[$TYPE] = SENTINEL;
                    } else if($value === undefined) {
                        $json = $node;
                    } else {
                        $json = $value;
                    }
                } else if($boxed === true) {
                    $json = $node;
                } else if($errorsAsValues === true || $type !== ERROR) {
                    if($node != null) {
                        $json = $value;
                    } else {
                        $json = undefined;
                    }
                } else {
                    $json = undefined;
                }
            } else if($materialized === true) {
                $json = Object.create(null);
                $json[$TYPE] = SENTINEL;
            } else {
                $json = undefined;
            }
            
            $jsonParent[$key] = $json;
        }
    }; }
    rule { } => { $[addLinkJSONG] }
}
export addLinkJSONG;
