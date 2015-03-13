macro hydrateKeysAtDepth {
    rule infix { $retVal:ident = | ($index, $height, $refs, $requested, $optimized, $depth) } => {
        var ref = $index = $depth;
        $refs.length = $depth + 1;
        while($index >= -1) {
            if(!!(ref = $refs[$index])) {
                ~$index || ++$index;
                $height = ref.length;
                var i = 0, j = 0;
                while(i < $height) {
                    $optimized[j++] = ref[i++];
                }
                i = $index;
                while(i < $depth) {
                    $optimized[j++] = $requested[i++];
                }
                $requested.length = i;
                $optimized.length = j;
                break;
            }
            --$index;
        }
    }
    rule { } => { $[hydrateKeysAtDepth] }
}
export hydrateKeysAtDepth;