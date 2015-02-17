macro initPathMapStack {
    rule infix { $path:ident = | ($pathMapsStack, $paths, $index) } => {
        $pathMapsStack[0] = $path;
    }
    rule { } => { $[initPathMapStack] }
}
export initPathMapStack;
