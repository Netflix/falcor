macro getPathValue {
    rule infix { $path:ident = | ($value, $paths, $index) } => {
        $value = $path.value;
        $path  = $path.path;
    }
    rule { } => { $[getPathValue] }
}
export getPathValue;