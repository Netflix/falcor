macro addKeyAtDepth {
    rule infix { $retVal:ident = | ($path, $depth, $key $rest ...) } => {
        $path[$path.length = $depth] = $key;
    }
    rule { } => { $[addKeyAtDepth] }
}
export addKeyAtDepth;