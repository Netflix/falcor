macro addKeyAtLinkDepth {
    rule infix { $retVal:ident = | ($path, $linkIndex, $linkHeight, $depth, $key $rest ...) } => {
        $path[$path.length = $depth + ($linkHeight - $linkIndex)] = $key;
    }
    rule { } => { $[addKeyAtLinkDepth] }
}
export addKeyAtLinkDepth;
