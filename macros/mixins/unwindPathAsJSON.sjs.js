macro unwindPathAsJSON {
    rule infix { $ret:ident = | (
        $unwind, $hasValue,
        $results, $jsons, $jsonRoot,
        $path, $index, $depth
    ) } => {
        $jsonRoot.exists() && ($results[$index] = $hasValue && { json: $jsons[-1] } || undefined);
        $ret = $unwind($path, $index, $depth)
    }
    rule { } => { $[unwindPathAsJSON] }
}
export unwindPathAsJSON;