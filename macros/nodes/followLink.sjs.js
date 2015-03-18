macro followLink {
    case infix { $retVal:ident = | $follow (
        $walk, $refs, $path, $linkPath,
        $linkIndex, $linkDepth, $linkHeight,
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes   = #{ $nodes   ... };
    var values  = #{ $values  ... };
    letstx $node   = nodes  .slice(0, 1);
    letstx $value  = values .slice(0, 1);
    return #{
        
        $linkPath = $value
        $linkIndex = $depth;
        $refs[$linkIndex] = $linkPath;
        $path.length = 0;
        $linkDepth = 0;
        $linkHeight = 0;
        
        $retVal = $walk($linkPath, $linkDepth, $linkHeight, $(
            $roots, $parents, $nodes) (,) ... ,           $(
            $types, $values, $sizes, $timestamps, $expires) (,) ...
        );
    }; }
    rule { } => { $[followLink] }
}
export followLink;