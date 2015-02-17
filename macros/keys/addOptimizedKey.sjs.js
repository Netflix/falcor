macro addOptimizedKey {
    rule infix { $ret:ident = | (
        $visit, $list, $refIndex, $refLength,
        $key, $isKeySet, $depth $rest ...
    ) } => {
        $list[$list.length = $depth + ($refLength - $refIndex)] = $key;
        $ret = $visit($key, $isKeySet, $depth $rest ...)
    }
    rule { } => { $[addOptimizedKey] }
}
export addOptimizedKey;