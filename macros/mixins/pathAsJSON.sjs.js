macro pathAsJSON {
    rule infix { $ret:ident = | (
        $getPath, $hasValue, $results, $jsons, $json, $jsonKeys,
        $paths, $index:expr
    ) } => {
        $ret = $getPath($paths, $index)
        $hasValue = false;
        $jsons.length = 0;
        $jsons[-1] = $json = $results && $results[$index] || undefined;
        $jsonKeys.length = 0;
        $jsonKeys[-1] = -1;
    }
    rule { } => { $[pathAsJSON] }
}
export pathAsJSON;
