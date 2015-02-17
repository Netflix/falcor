macro setHardLink {
    case infix { $ret:ident = | $setHardLink(
        $visit, $reference,
        $key, $isKeySet, $depth, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var roots   = #{ $roots   ... };
    var parents = #{ $parents ... };
    var nodes   = #{ $nodes   ... };
    var types   = #{ $types   ... };
    var values  = #{ $values  ... };
    var expires = #{ $expires ... };
    letstx $root   = roots  .slice(0, 1);
    letstx $parent = parents.slice(0, 1);
    letstx $node   = nodes  .slice(0, 1);
    letstx $type   = types  .slice(0, 1);
    letstx $value  = values .slice(0, 1);
    letstx $expire = expires.slice(0, 1);
    return #{
        $ret = $visit(
            $key, $isKeySet, $depth, $(
            $roots, $parents, $nodes) (,) ... , $(
            $types, $values, $sizes, $timestamps, $expires) (,) ...
        )
        if($node.exists()) {
            $node.link($reference);
        }
    }; }
    rule { } => { $[setHardLink] }
}
export setHardLink;