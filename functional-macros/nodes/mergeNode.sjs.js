macro mergeNode {
    case infix { $ret:ident = | _ (
        $depth, $key, $isKeySet,          $(
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
        $node = tailrec merge_node($node, $message) {
            
            $nodeType  = $node.type();
            $nodeValue = $node.value($nodeType);
            
            if($node == null && $message == null) {
                return $node;
            } else if($node === $message && $node.isBranch($nodeType, $nodeValue)) {
                $node = $node.graph($key, $nodeRoot, $nodeParent, $nodeType, $nodeValue);
                return $node;
            }
            
            $messageType  = $message.type();
            $messageValue = $message.value($messageType);
            
            if($node.isLink($nodeType, $nodeValue)) {
                if($message == null) {
                    return $node;
                } else if($message.isLink($messageType, $messageValue)) {
                    if($node === $message) {
                        if($node === $nodeValue[__CONTAINER]) {
                            return $node;
                        }
                        $messageType = $nodeType;
                        $messageValue = $nodeValue;
                    } else if($message.expires() === EXPIRES_NOW) {
                        return $node = $message;
                    } else {
                        if(($message.timestamp() < $node.timestamp()) === false) {
                            $message = tailrec replace_cache_reference($message, $messageValue, $node, $nodeValue) {
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
                            }($message, $messageValue, $node, $nodeValue);
                        }
                        if($node === $message) {
                            return $node;
                        }
                    }
                }
            } else if($node === $message) {
                return $node;
            } else if(!$nodeType && $node.isObject()) {
                if($message == null || $message.isBranch($messageType, $messageValue)) {
                    return $node;
                }
            }
            
            $nodeSize = $node.size();
            $messageSize  = $message.size();
            
            if($message.isEdge($messageType, $messageValue)) {
                $message = $message.wrapper($messageType, $messageValue, $messageSize)
            }
            
            if($node == null) {
                $nodeParent[$key] = $node = $message;
            } else if($node !== $message) {
                $node = $nodeParent.replace($node, $message, $key)
            }
            
            var sizeOffset = $nodeSize - $messageSize;
            if(sizeOffset !== 0) {
                $nodeParent.update($node, sizeOffset, __GENERATION_VERSION);
            }
            
            return $node = $node.graph($key, $nodeRoot, $nodeParent, $nodeType, $nodeValue);
        }($node, $message);
    }; }
    rule { } => { $[mergeNode] }
}
export mergeNode;