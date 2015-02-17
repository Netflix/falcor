macro nextAsValue {
    rule infix { $ret:ident = | (
        $onNext, $cbOrList, $boxed,
        $node, $value, $requestedPath,
        $appendNullKey, $rest ...
    ) } => {
        $ret = $onNext($rest ...)
        var pbv = Object.create(null);
        var req = clone array $requestedPath;
        if($appendNullKey === true) { req[req.length] = null; }
        pbv.path = req;
        if($boxed === true) {
            pbv.value = $node;
        } else {
            pbv.value = clone object $value without falcorKeys;
        }
        
        (typeof $cbOrList === "function") && (
            $cbOrList(pbv) || true ) || (
            Array.isArray($cbOrList) && (
            $cbOrList[$cbOrList.length] = pbv));
    }
    rule { } => { $[nextAsValue] }
}
export nextAsValue;