macro followHardRef {
    rule infix { $ret:ident = | (
        $follow, $list,
        $refDepth, $refHeight, $refLength, $reference, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
        var location = ($reference[__CONTAINER] || $reference)[__CONTEXT];
        if(location !== undefined) {
            $ret = location;
            $refHeight = ($refLength = $reference.length) - 1;
            while($refDepth < $refLength) {
                $list[$refDepth] = $reference[$refDepth++];
            }
            $list.length = $refLength;
        } else {
            $ret = $follow(
                $refDepth, $refHeight, $refLength, $reference, $(
                $roots, $parents, $nodes) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
        }
    }
    rule { } => { $[followHardRef] }
}
export followHardRef;