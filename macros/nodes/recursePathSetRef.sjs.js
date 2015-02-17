macro recursePathSetRef {
    case infix { $ret:ident = | $recursePathSetRef(
        $path, $refs, $refIndex, $refLength, $height,
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
        $refs[$refIndex - 1] = $path = $value;
        $depth = 0;
        $height = ($refLength = $path.length) - 1;
        $($parents = $roots;) ...
        continue;
    }; }
    rule { } => { $[recursePathSetRef] }
}
export recursePathSetRef;
