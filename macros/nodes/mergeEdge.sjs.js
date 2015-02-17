macro mergeEdge {
    case infix { $ret:ident = | $mergeEdge (
        $visit, $key, $isKeySet, $depth, $(
        $roots, $parents, $nodes) (,) ... $(
        $types, $values, $sizes, $timestamps, $expires) (,) ...
    ) } => {
    var roots   = #{ $roots   ... };
    var parents = #{ $parents ... };
    var nodes   = #{ $nodes   ... };
    var types   = #{ $types   ... };
    var values  = #{ $values  ... };
    var sizes   = #{ $sizes   ... };
    var timestamps = #{ $timestamps ... };
    var expires = #{ $expires ... };
    
    letstx $nodeRoot         = roots     .slice(0, 1);
    letstx $nodeParent       = parents   .slice(0, 1);
    letstx $node             = nodes     .slice(0, 1);
    letstx $nodeType         = types     .slice(0, 1);
    letstx $nodeValue        = values    .slice(0, 1);
    letstx $nodeSize         = sizes     .slice(0, 1);
    letstx $nodeTimestamp    = timestamps.slice(0, 1);
    letstx $nodeExpire       = expires   .slice(0, 1);
    letstx $messageRoot      = roots     .slice(1, 2);
    letstx $messageParent    = parents   .slice(1, 2);
    letstx $message          = nodes     .slice(1, 2);
    letstx $messageType      = types     .slice(1, 2);
    letstx $messageValue     = values    .slice(1, 2);
    letstx $messageSize      = sizes     .slice(1, 2);
    letstx $messageTimestamp = timestamps.slice(1, 2);
    letstx $messageExpire    = expires   .slice(1, 2);
    
    return #{
        
        $ret = $visit($key, $isKeySet, $depth, $nodeRoot, $nodeParent, $node, $nodeType, $nodeValue, $nodeSize, $nodeTimestamp, $nodeExpire)
        $ret = $visit($key, $isKeySet, $depth, $messageRoot, $messageParent, $message, $messageType, $messageValue, $messageSize, $messageTimestamp, $messageExpire)
        
        if($message.isNewer($node, $messageTimestamp, $nodeTimestamp, $messageExpire)) {
            
            $messageValue = $message.valueOrError($messageType);
            $message = $message.wrapper($messageType, $messageValue, $messageSize);
            var size_offset = $messageSize - $node.size();
            $node = $nodeParent.replace($key, $node, $message);
            $nodeType  = $node.type();
            $nodeValue = $node.value($nodeType);
            $node = $node.graph($key, $nodeRoot, $nodeParent, $nodeType, $nodeValue);
            $nodeParent.update($node, size_offset, __GENERATION_VERSION)
        }
    }; }
    rule { } => { $[mergeEdge] }
}
export mergeEdge;