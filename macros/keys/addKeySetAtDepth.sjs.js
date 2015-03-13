macro addKeySetAtDepth {
    rule infix { $retVal:ident = | ($path, $depth, $key, $isKeySet $rest ...) } => {
        $path[$path.length = $depth] = $isKeySet ? $key : undefined;
    }
    rule { } => { $[addKeySetAtDepth] }
}
export addKeySetAtDepth;
