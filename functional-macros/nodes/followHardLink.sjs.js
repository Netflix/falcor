macro followHardLink {
    case infix { $retVal:ident = | $follow (
        $walk, $refs, $path, $linkPath,
        $linkIndex, $linkDepth, $linkHeight,
        $depth, $key, $isKeySet,          $(
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
        
        $linkPath = $value
        $linkIndex = $depth;
        $refs[$linkIndex] = $linkPath;
        $path.length = 0;
        $linkDepth = 0;
        $linkHeight = 0;
        
        var location, container = $linkPath[__CONTAINER] || $linkPath;
        
        if((location = container[__CONTEXT]) !== undefined) {
            $node = location;
            $linkHeight = $linkPath.length;
            while($linkDepth < $linkHeight) {
                $path[$linkDepth] = $linkPath[$linkDepth++];
            }
            $path.length = $linkDepth;
        } else {
            $node = $walk($linkPath, $linkDepth, $linkHeight, $(
                $roots, $parents, $nodes) (,) ... ,           $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
        }
    }; }
    rule { } => { $[followHardLink] }
}
export followHardLink;