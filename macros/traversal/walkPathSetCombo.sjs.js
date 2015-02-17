macro walkPathSetCombo {
    case infix { $ret:ident = | $walk(
        $walkPathSet, $unwindPath,
        $onNext, $onError, $onMiss,
        $boxed, $refreshing, $appendNullKey,
        $refs, $refIndex, $refLength,
        $requestedPath, $optimizedPath,
        $index, $path, $depth, $height, $length, $(
        $stacks, $roots, $parents, $nodes) (,) ... $(
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
        var ref;
        $refs.length = 0;
        while($depth > -1) {
            
            $refIndex = $depth;
            while(--$refIndex >= -1) {
                if(!!(ref = $refs[$refIndex])) {
                    $refLength = ref.length;
                    var i = -1, j = 0;
                    while(++i < $refLength) {
                        $optimizedPath[j++] = ref[i];
                    }
                    i = ++$refIndex;
                    while(i < $depth) {
                        $optimizedPath[j++] = $requestedPath[i++];
                    }
                    $optimizedPath.length = j;
                    break;
                }
            }
            
            $node = $walkPathSet(
                $depth, $height, $length, $path, $(
                $stacks, $roots, $parents, $nodes) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
            
            if($node.exists() || $boxed === true) {
                if($node.isError($type)) {
                    $node.promote($expire);
                    $node = $onError($index, $node, $value)
                }
                $node = $onNext($index, $path, $depth, $height, $(
                    $stacks, $roots, $parents, $nodes) (,) ... , $(
                    $types, $values, $sizes, $timestamps, $expires) (,) ...
                )
            }
            
            if($boxed === false && $node == null || $refreshing === true) {
                $node = $onMiss($index, $path, $depth, $height, $(
                    $stacks, $roots, $parents, $nodes) (,) ... , $(
                    $types, $values, $sizes, $timestamps, $expires) (,) ...
                )
            }
            
            $appendNullKey = false;
            
            $depth = $unwindPath($path, $index, $depth)
        }
    }; }
    rule { } => { $[walkPathSetCombo] }
}
export walkPathSetCombo;