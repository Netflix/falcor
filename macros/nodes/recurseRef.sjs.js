macro recurseRef {
    case infix { $ret:ident = | $recurseRef(
        $path, $refLength, $height,
        $key, $isKeySet, $depth, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes   = #{ $nodes   ... };
    var values  = #{ $values  ... };
    var expires = #{ $expires ... };
    letstx $node   = nodes  .slice(0, 1);
    letstx $value  = values .slice(0, 1);
    letstx $expire = expires.slice(0, 1);
    return #{
        $node.promote($expire);
        $path = $value;
        $depth = 0;
        $height = ($refLength = $path.length) - 1;
        $($parents = $roots;) ...
        continue;
    }; }
    rule { } => { $[recurseRef] }
}
export recurseRef;