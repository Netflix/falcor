macro depthToPathMap {
    rule infix { $ret:ident = | ($mapStack, $depth) } => {
        var offset = $depth * 4, keys, index;
        do {
            delete $mapStack[offset + 0];
            delete $mapStack[offset + 1];
            delete $mapStack[offset + 2];
            delete $mapStack[offset + 3];
        } while((
            keys  = $mapStack[(offset = 4 * --$depth) + 1]  ) && ((
            index = $mapStack[offset + 2]) || true          ) && ((
            $mapStack[offset + 2] = ++index) >= keys.length));
    }
    rule { } => { $[depthToPathMap] }
}
export depthToPathMap;