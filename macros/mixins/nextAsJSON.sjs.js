macro nextAsJSON {
    case infix { $ret:ident = | $nextAsJSON(
        $onNext, $hasValue, $jsonKeys, $jsons, $jsonParent, $boxed,
        $index, $path, $depth, $height, $(
        $stacks, $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes  = #{ $nodes  ... };
    var values = #{ $values ... };
    letstx $node  = nodes .slice(0, 1);
    letstx $value = values.slice(0, 1);
    return #{
        if($jsonParent.exists()) {
            $hasValue = true;
            var jsonKey, jsonDepth = $depth;
            do {
                jsonKey = $jsonKeys[jsonDepth];
                $jsonParent   = $jsons[--jsonDepth];
            } while(jsonKey == null);
            
            if($boxed === true) {
                $jsonParent[jsonKey] = $node;
            } else {
                $jsonParent[jsonKey] = clone object $value without falcorKeys;
            }
        }
        
        $ret = $onNext(
            $index, $path, $depth, $height, $(
            $stacks, $roots, $parents, $nodes) (,) ... , $(
            $types, $values, $sizes, $timestamps, $expires) (,) ...
        )
    }; }
    rule { } => { $[nextAsJSON] }
}
export nextAsJSON;
