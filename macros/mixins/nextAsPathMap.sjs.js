macro nextAsPathMap {
    case infix { $ret:ident = | $nextAsPathMap(
        $onNext, $hasValue,
        $jsons, $jsonParent, $boxed,
        $index, $path, $depth, $height, $(
        $stacks, $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes  = #{ $nodes  ... };
    var values = #{ $values ... };
    letstx $node  = nodes .slice(0, 1);
    letstx $value = values.slice(0, 1);
    return #{
        $hasValue || ($hasValue = $jsonParent.exists());
        $ret = $onNext($index, $path, $depth, $height, $(
            $stacks, $roots, $parents, $nodes) (,) ... , $(
            $types, $values, $sizes, $timestamps, $expires) (,) ...)
    }; }
    rule { } => { $[nextAsPathMap] }
}
export nextAsPathMap;
