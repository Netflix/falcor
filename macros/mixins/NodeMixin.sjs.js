macro NodeMixin {
    case { _ ($rootModel, $expired, $errorSelector, $node) } => {
        var node = #{$node}, name = unwrapSyntax(node);
        return withSyntax($this = [makeIdent(name + "MacroSelf", node)]) #{
            let $node = macro {
                rule { .type() } => { ($node && $node[$TYPE] || undefined) }
                rule { .size() } => { ($node && $node[$SIZE] || 0) }
                rule { .valueOrError($type) } => {
                    ($type === SENTINEL) ? $node[VALUE] :
                    ($type === ERROR) ? ($node = $errorSelector($node)) :
                    $node
                }
                rule { .value($type) } => { ($type === SENTINEL) ? $node[VALUE] : $node }
                rule { .value() } => { ($node[$TYPE] === SENTINEL) ? $node[VALUE] : $node }
                rule { .timestamp() } => { ($node && $node[$TIMESTAMP]) }
                rule { .expires() } => { ($node && $node[$EXPIRES]) }
                rule { .exists() } => { exists($node) }
                rule { .isObject() } => { obj_exists($node) }
                rule { .isPrimitive() } => { !(obj_exists($node)) }
                rule { .isArray($value) } => { Array.isArray($value) }
                rule { .isNode($type, $value) } => { (!$type && $this.isObject() || $type === SENTINEL && Array.isArray($value)) }
                rule { .isEdge($type, $value) } => { ($node == null || $type !== undefined || typeof $node !== "object" || $this.isArray($value)) }
                rule { .isBranch($type, $value) } => { (!$type && $this.isObject() && !$this.isArray($value)) }
                rule { .isTerminus($type, $value) } => { (typeof $node !== "object") || (!!$type && $type !== SENTINEL && !Array.isArray($value)) }
                rule { .isError($type) } => { ($type === ERROR) }
                rule { .isSentinel($type) } => { ($type === SENTINEL) }
                rule { .isLink($type, $value) } => { ((!$type || $type === SENTINEL) && Array.isArray($value)) }
                rule { .isExpired($expires) } => { (
                    $expires != null &&
                    $expires !== EXPIRES_NEVER && (
                    $expires === EXPIRES_NOW || $expires < now())
                ) }
                rule { .isInvalid() } => { ($node[__INVALIDATED] === true) }
                rule { .isNewer($nodeB, $timestampA, $timestampB, $expiresA) } => {
                    // Return `true` if the message is newer than the
                    // context and the message isn't set to expire now.
                    // Return `false` if the message is older, or if it
                    // expires now.
                    // 
                    // If the message is newer than the cache but it's set
                    // to expire now, set the context variable to the message
                    // so we'll onNext the message, but leave the cache alone.
                    ((
                        (($timestampA < $timestampB)) || (
                            (($expiresA === EXPIRES_NOW)) &&
                            (($nodeB = $node) || true)
                        )
                    ) === false)
                }
                rule { .expire() } => { ($expired[$expired.length] = $node) && ($node[__INVALIDATED] = true) && undefined }
                rule { .graph($key, $root, $parent, $type, $value) } => { !($node[__SELF]) && ((
                    $node[__SELF]   = $node  ) || true) && ((
                    $node[__KEY]    = $key   ) || true) && ((
                    $node[__PARENT] = $parent) || true) && ((
                    $node[__ROOT]   = $root  ) || true) && ((
                    $node[__GENERATION]) || ($node[__GENERATION] = 0) || $node) && ((
                    $this.isLink($type, $value)) && ($value[__CONTAINER] = $node)) || $node
                }
                rule { .update($child, $size_offset) } => {
                    if($size_offset > 0) {
                        var child = $child, node = $node;
                        while($child) {
                            $node = $node[__PARENT];
                            if(($child[$SIZE] = $child.size() - $size_offset) <= 0 && $node) {
                                $child = $this.remove($child[__KEY], $child);
                            }
                            $child = $node;
                        }
                        $child = child;
                        $node = node;
                    }
                }
                rule { .update($child, $size_offset, $version) } => { $this.update($child, $size_offset, $version, true) }
                rule { .update($child, $size_offset, $version, $clean) } => {
                    
                    var node = $node, child = $child, stack = [];
                    
                    while($child = $node) {
                        $node = $child[__PARENT];
                        if(($child[$SIZE] = ($child[$SIZE] || 0) - $size_offset) <= 0 && $clean && $node) {
                            $child = $this.remove($child[__KEY], $child);
                        } else if($child[__GENERATION_UPDATED] !== $version) {
                            
                            var depth = 0, references, ref, i, k, n;
                            
                            while(depth > -1) {
                                if((references = stack[depth]) === undefined) {
                                    
                                    i = k = -1;
                                    n = $child[__REFS_LENGTH] || 0;
                                    
                                    $child[__GENERATION_UPDATED] = $version;
                                    $child[__GENERATION] = __GENERATION_GUID++;
                                    
                                    if((ref = $child[__PARENT]) !== undefined && (
                                        ref[__GENERATION_UPDATED] !== $version)) {
                                        stack[depth] = references = new Array(n + 1);
                                        references[++k] = ref;
                                    } else if(n > 0) {
                                        stack[depth] = references = new Array(n);
                                    }
                                    
                                    while(++i < n) {
                                        if((ref = $child[__REF + i]) !== undefined && (
                                            ref[__GENERATION_UPDATED] !== $version)) {
                                            references[++k] = ref;
                                        }
                                    }
                                }
                                if(($child = references && references.pop()) !== undefined) {
                                    ++depth;
                                } else {
                                    stack[depth--] = undefined;
                                }
                            }
                        }
                    }
                    
                    $node = node;
                    $child = child;
                }
                rule infix { $dest = | .replace($key, $child, $replacement) } => {
                    if($child.exists() && $child !== $replacement) {
                        $child.transferBackRefs($replacement);
                        $child = $this.invalidate($key, $child);
                    }
                    $node[$key] = $dest = $replacement
                }
                rule infix { $dest = | .remove($key:expr, $child) } => {
                    $child.unlink($child.value())
                    $child.deleteBackRefs();
                    $child.splice();
                    $node[$key] = $child[__SELF] = $child[__PARENT] = $child[__ROOT] = undefined
                }
                rule infix { $dest = | .invalidate($key:expr, $child) } => {
                    
                    macro varsCount { rule { } => { 8 } }
                    
                    var invParent = $node, invChild = $child, invKey = $key,
                        keys, index, offset, childType, childValue, isBranch,
                        stack = [$node, invKey, $child], depth = 0;
                    
                    while(depth > -1) {
                        
                        $node  = stack[offset = depth * varsCount];
                        invKey = stack[offset + 1];
                        $child = stack[offset + 2];
                        
                        if((childType = stack[offset + 3]) === undefined || (childType = undefined)) {
                            childType = stack[offset + 3] = $child.type() || null;
                        }
                        
                        childValue = stack[offset + 4] || (stack[offset + 4] = $child.value(childType));
                        
                        if((isBranch = stack[offset + 5]) === undefined) {
                            isBranch = stack[offset + 5] = $child.isBranch(childType, childValue);
                        }
                        
                        if(isBranch === true) {
                            if((keys = stack[offset + 6]) === undefined) {
                                keys = stack[offset + 6] = [];
                                index = -1;
                                for(invKey in $child) {
                                    !(falcorKeys(invKey)) && (keys[++index] = invKey);
                                }
                            }
                            index = stack[offset + 7] || (stack[offset + 7] = 0);
                            if(index < keys.length) {
                                stack[offset + 7] = index + 1;
                                stack[offset = ++depth * varsCount] = $child;
                                stack[offset + 1] = invKey = keys[index];
                                stack[offset + 2] = $child[invKey];
                                continue;
                            }
                        }
                        
                        $child = $this.remove(invKey, $child);
                        
                        delete stack[offset + 0];
                        delete stack[offset + 1];
                        delete stack[offset + 2];
                        delete stack[offset + 3];
                        delete stack[offset + 4];
                        delete stack[offset + 5];
                        delete stack[offset + 6];
                        delete stack[offset + 7];
                        --depth;
                    }
                    
                    $node = invParent;
                    $child = invChild
                }
                rule { .link($reference) } => {
                    var refContainer = $reference[__CONTAINER] || $reference,
                        refContext   = refContainer[__CONTEXT];
                    // Set up the hard-link so we don't have to do all
                    // this work the next time we follow this reference.
                    if(refContext === undefined) {
                        // create a back reference
                        var backRefs  = $node[__REFS_LENGTH] || 0;
                        $node[__REF + backRefs] = refContainer;
                        $node[__REFS_LENGTH] = backRefs + 1;
                        // create a hard reference
                        refContainer[__REF_INDEX] = backRefs;
                        refContainer[__CONTEXT]  = $node;
                        refContainer = backRefs = undefined;
                    }
                }
                rule { .unlink($value:expr) } => {
                    var ref = $value, destination;
                    if(ref && Array.isArray(ref)) {
                        destination = ref[__CONTEXT];
                        if(destination) {
                            var i = (ref[__REF_INDEX] || 0) - 1,
                                n = (destination[__REFS_LENGTH] || 0) - 1;
                            while(++i <= n) {
                                destination[__REF + i] = destination[__REF + (i + 1)];
                            }
                            destination[__REFS_LENGTH] = n;
                            ref[__REF_INDEX] = ref[__CONTEXT] = destination = undefined;
                        }
                    }
                }
                rule { .transferBackRefs($dest) } => {
                    var nodeRefsLength = $node[__REFS_LENGTH] || 0,
                        destRefsLength = $dest[__REFS_LENGTH] || 0,
                        i = -1, ref;
                    while(++i < nodeRefsLength) {
                        if((ref = $node[__REF + i]) !== undefined) {
                            ref[__CONTEXT] = $dest;
                            $dest[__REF + (destRefsLength + i)] = ref;
                            $node[__REF + i] = undefined;
                        }
                    }
                    $dest[__REFS_LENGTH] = nodeRefsLength + destRefsLength;
                    $node[__REFS_LENGTH] = ref = undefined
                }
                rule { .deleteBackRefs() } => {
                    var ref, i = -1, n = $node[__REFS_LENGTH] || 0;
                    while(++i < n) {
                        if((ref = $node[__REF + i]) !== undefined) {
                            ref[__CONTEXT] = $node[__REF + i] = undefined;
                        }
                    }
                    $node[__REFS_LENGTH] = undefined
                }
                rule infix { $dest:ident = | .wrapper($type, $value, $size) } => {
                    $dest = $node;
                    if($this.isLink($type, $value)) {
                        $type = "array";
                        $dest[$SIZE] = $size = ($this.isSentinel($type) && SENTINEL_SIZE || 0) + ($value.length || 1);
                        delete $value[$SIZE];
                        $value[__CONTAINER] = $dest;
                    } else if($this.isSentinel($type)) {
                        $dest[$SIZE] = $size = SENTINEL_SIZE + ((typeof $value === "string") && $value.length || 1);
                    } else if($this.isError($type)) {
                        $dest[$SIZE] = $size = SENTINEL_SIZE + ($this.size() || 1);
                    } else if($this.isPrimitive()) {
                        $size = SENTINEL_SIZE + ((typeof $value === "string") && $value.length || 1);
                        $type = "sentinel";
                        $dest = { "value": $value };
                        $dest[$TYPE] = $type;
                        $dest[$SIZE] = $size;
                    } else {
                        $type = $dest[$TYPE] = $type || "leaf";
                        $dest[$SIZE] = $size = $this.size() || (SENTINEL_SIZE + 1);
                    }
                }
                /** LRU operations **/
                rule { .promote($expires) ; } => {
                    if($expires !== EXPIRES_NEVER) {
                        var root = $rootModel,
                            head = root.__head,
                            tail = root.__tail,
                            next = $node.__next,
                            prev = $node.__prev;
                        if ($node !== head) {
                            next && (next != null && typeof next === "object") && (next.__prev = prev);
                            prev && (prev != null && typeof prev === "object") && (prev.__next = next);
                            (next = head) && (head != null && typeof head === "object") && (head.__prev = $node);
                            (root.__head = root.__next = head = $node);
                            (head.__next = next);
                            (head.__prev = undefined);
                        }
                        if (tail == null || $node === tail) {
                            root.__tail = root.__prev = tail = prev || $node;
                        }
                        root = head = tail = next = prev = undefined;
                    }
                }
                rule { .splice() ; } => {
                    if($this.isObject()) {
                        var root = $rootModel,
                            head = root.__head,
                            tail = root.__tail, next, prev;
                        (next = $node.__next) && (next != null && typeof next === "object") && (next.__prev = prev);
                        (prev = $node.__prev) && (prev != null && typeof prev === "object") && (prev.__next = next);
                        ($node === head) && (root.__head = root.__next = head = next);
                        ($node === tail) && (root.__tail = root.__prev = tail = prev);
                        $node.__next = $node.__prev = undefined;
                        head = tail = next = prev = undefined;
                    }
                }
                rule { } => { $node }
            }
            macro $this {
                rule { .$inv() } => { $node.$inv() }
                rule { .$inv($arg (,) $[...]) } => { $node.$inv($arg (,) $[...]) }
                rule { } => { $node }
            }
        }
    }
    rule { } => { $[NodeMixin] }
}
export NodeMixin;