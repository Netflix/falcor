macro unwindJSONGPathAsJSON {
    rule infix { $ret:ident = | (
        $unwind, $hasValue,
        $results, $jsons, $jsonRoot,
        $jsonOffset, $path, $index, $depth
    ) } => {
        $jsonRoot.exists() && ($results[$jsonOffset + $index] = $hasValue && { json: $jsons[-1] } || undefined);
        $ret = $unwind($path, $index, $depth)
    }
    rule { } => { $[unwindJSONGPathAsJSON] }
}
export unwindJSONGPathAsJSON;