macro addHardLink {
    case infix { $retVal:ident = | _ (
        $linkPath,
        $depth, $key, $isKeySet,          $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes   = #{ $nodes   ... };
    letstx $node   = nodes  .slice(0, 1);
    return #{
        if($node.isObject()) {
            $node.link($linkPath)
        }
    }; }
    rule { } => { $[addHardLink] }
}
export addHardLink;