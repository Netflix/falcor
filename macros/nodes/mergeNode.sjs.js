macro mergeNode {
    case infix { $ret:ident = | $mergeNode(
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
        
        $node = tailrec merge_node($node, $message) {
            
            if($node === $message) {
                return $node;
            }
            
            if($node.exists()) {
                if($message.exists()) {
                    if($node.isLink($nodeType, $nodeValue)) {
                        if($message.isLink($messageType, $messageValue)) {
                            if($message.isNewer($node, $messageTimestamp, $nodeTimestamp, $messageExpire)) {
                                $message = tailrec replace_cache_reference($message, $node, $nodeValue, $messageValue) {
                                    // compare the cache and message references.
                                    // if they're the same, break early so we don't insert.
                                    // if they're different, replace the cache reference.
                                    var i = $nodeValue.length;
                                    // If the reference lengths are equal, we have to check their keys
                                    // for equality.
                                    // If their lengths aren't the equal, the references aren't equal.
                                    // Insert the reference from the message.
                                    if(i === $messageValue.length) {
                                        while(--i > -1) {
                                            // If any of their keys are different, replace the reference
                                            // in the cache with the reference in the message.
                                            if($nodeValue[i] !== $messageValue[i]) { return $message; }
                                        }
                                        if(i === -1) { return $node; }
                                    }
                                    return $message;
                                }($message, $node, $nodeValue, $messageValue);
                            }
                        }
                    }
                    
                    if(($node === $message) || (
                        $node.isBranch($nodeType, $nodeValue) &&
                        $message.isBranch($messageType, $messageValue))) {
                        return $node;
                    }
                } else if($node.isNode($nodeType, $nodeValue)) {
                    return $message = $node;
                }
            }
            
            if($message.isEdge($messageType, $messageValue)) {
                $message = $message.wrapper($messageType, $messageValue, $messageSize);
            }
            
            var size_offset = $message.size() - $node.size();
            
            $node = $nodeParent.replace($key, $node, $message);
            $nodeType  = $node.type();
            $nodeValue = $node.value($nodeType);
            $nodeTimestamp = $node.timestamp();
            $nodeExpire = $node.expires();
            
            $nodeParent.update($node, size_offset, __GENERATION_VERSION)
            
            return $node;
        }($node, $message);
        
        $node.exists() && ($node = $node.graph($key, $nodeRoot, $nodeParent, $nodeType, $nodeValue));
    }; }
    rule { } => { $[mergeNode] }
}
export mergeNode;