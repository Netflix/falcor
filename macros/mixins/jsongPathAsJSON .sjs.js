macro jsongPathAsJSON {
    rule infix { $ret:ident = | ($getPath, $jsonOffset, $paths, $index:expr) } => {
        $ret = $getPath($paths, $jsonOffset + $index)
    }
    rule { } => { $[jsongPathAsJSON] }
}
export jsongPathAsJSON;
