macro walkPathSets {
    case infix { $results:ident = | $walk (
        $stepPath, $walkPathSetCombo, $paths,
        $path, $depth, $length, $height, $(
        $stacks, $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var nodes = #{ $nodes ... };
    letstx $node = nodes.slice(0, 1);
    return #{
        var index = -1, count = $paths.length;
        while(++index < count) {
            $path   = $paths[index];
            $path   = $stepPath($paths, index)
            $depth  = 0;//$path.depth || ($path.depth = 0);
            $length = $path.length;
            $height = $length - 1;
            $node = $walkPathSetCombo(
                index, $path, $depth, $height, $length, $(
                $stacks, $roots, $parents, $nodes) (,) ... , $(
                $types, $values, $sizes, $timestamps, $expires) (,) ...
            )
        }
    }; }
    rule { } => { $[walkPathSets] }
}
export walkPathSets;