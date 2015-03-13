macro mergeEdge {
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
        
        $nodeType  = $node.type();
        $nodeValue = $node.value($nodeType);
        $nodeExpire = $node.expires();
        $nodeTimestamp = $node.timestamp();
        
        $messageExpire = $message.expires();
        $messageTimestamp = $message.timestamp();
        
        if($messageExpire === EXPIRES_NOW) {
            $node = $message;
            $nodeType = $message.type();
            $nodeValue = $message.valueOrError($messageType);
            $nodeExpire = $messageExpire;
            $nodeTimestamp = $messageTimestamp;
        } else if(($messageTimestamp < $nodeTimestamp) === false) {
            if(($node !== $message) || $node.isPrimitive()) {
                $messageType  = $message.type();
                $messageValue = $message.valueOrError($messageType);
                $message = $message.wrapper($messageType, $messageValue, $messageSize);
                
                var sizeOffset = $node.size() - $messageSize;
                
                $node = $nodeParent.replace($node, $message, $key);
                
                $nodeType  = $node.type();
                $nodeValue = $messageValue;
                $node = $node.graph($key, $nodeRoot, $nodeParent, $nodeType, $nodeValue);
                
                $nodeParent.update($node, sizeOffset, __GENERATION_VERSION)
            }
        }
    }; }
    rule { } => { $[mergeEdge] }
}
export mergeEdge;