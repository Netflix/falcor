macro onErrorAsJSONG {
    rule infix { $ret:ident = | ($errors, $boxed, $requestedPath, $appendNullKey, $index, $node, $value) } => {
        var nodeType = $node.type();
        $value = $node.valueOrError(nodeType);
        var pbv = Object.create(null);
        var req = clone array $requestedPath;
        if($appendNullKey === true) { req[req.length] = null; }
        pbv.path = req;
        if($boxed === true) {
            pbv.value = $node;
        } else {
            pbv.value = clone object $value without internalKeys;
        }
        $errors[$errors.length] = pbv;
    }
    rule { } => { $[onErrorAsJSONG] }
}
export onErrorAsJSONG;
