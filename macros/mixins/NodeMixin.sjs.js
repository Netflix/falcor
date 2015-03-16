macro NodeMixin {
    case { _ ($rootModel, $expired, $errorSelector, $node) } => {
    var node = #{$node}, name = unwrapSyntax(node);
    return withSyntax($this = [makeIdent(name + "MacroSelf" + __fresh(), node)]) #{
        let $node = macro {
            rule { .type() } => { ($node && $node[$TYPE] || undefined) }
            rule { .size() } => { ($node && $node[$SIZE] || 0) }
            rule { .valueOrError($type) } => {
                ($type === SENTINEL) ? $node[VALUE] :
                ($type === ERROR   ) ? ($node = $errorSelector($node)) :
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
            rule { .isNode($type, $value) } => { (!$type && $this.isObject()) || $this.isLink($type, $value) }
            rule { .isEdge($type, $value) } => { ($node == null || $type !== undefined || typeof $node !== "object" || $this.isArray($value)) }
            rule { .isBranch($type, $value) } => { (!$type && $this.isObject() && !$this.isArray($value)) }
            rule { .isTerminus($type, $value) } => { ($node == null || typeof $node !== "object" || (!!$type && $type !== SENTINEL && !Array.isArray($value))) }
            rule { .isError($type) } => { ($type === ERROR) }
            rule { .isSentinel($type) } => { ($type === SENTINEL) }
            rule { .isLink($type, $value) } => { ((!$type || $type === SENTINEL) && Array.isArray($value)) }
            rule { .isExpired($expires) } => { (
                $expires !== EXPIRES_NEVER && (
                $expires === EXPIRES_NOW || $expires < now())
            ) }
            rule { .isExpiredOrInvalid($expire)  } => { ((
                $expire = $this.expires() != null) && (
                $this.isExpired($expire)         ) || (
                $this.exists()                   ) && (
                $this.isInvalid()                )    )
            }
            rule { .isInvalid() } => { ($node[__INVALIDATED] === true) }
            rule infix { $dest:expr = | .clone($value, $filter) } => {
                var dest = $value, src = dest, i = -1, n, x;
                if(obj_exists(dest)) {
                    if(Array.isArray(src)) {
                        dest = new Array(n = src.length);
                        while(++i < n) { dest[i] = src[i]; }
                    } else {
                        dest = Object.create(null);
                        for(x in src) { !($filter(x)) && (dest[x] = src[x]); }
                    }
                }
                $dest = dest
            }
            rule { .createNode() } => { Object.create(null) }
            rule { .createJSONNode() } => { Object.create(null) }
            rule { .expire() } => { ($expired[$expired.length] = $node) && ($node[__INVALIDATED] = true) && undefined }
            rule infix { $val  = | .getPathValue($type, $value, $materialized, $boxed) } => {
                if($materialized === true) {
                    if($node == null) {
                        $val = Object.create(null);
                        $val[$TYPE] = SENTINEL;
                    } else if($value === undefined) {
                        $val = $this.clone($node, internalKey);
                    } else {
                        $val = $this.clone($value, internalKey);
                    }
                } else if($boxed === true) {
                    $val = $this.clone($node, internalKey);
                    if($type === SENTINEL) {
                        $val.value = $this.clone($value, internalKey);
                    }
                } else {
                    $val = $this.clone($value, internalKey);
                }
            }
            rule infix { $json = | .getJSONEdge($type, $value, $materialized, $boxed, $errorsAsValues) } => {
                if($materialized === true) {
                    if($node == null) {
                        $json = Object.create(null);
                        $json[$TYPE] = SENTINEL;
                    } else if($value === undefined) {
                        $json = $this.clone($node, internalKey);
                    } else {
                        $json = $this.clone($value, internalKey);
                        if(obj_exists($json) && !Array.isArray($json)) {
                            $json[$TYPE] = GROUP;
                        }
                    }
                } else if($boxed === true) {
                    $json = $this.clone($node, internalKey);
                    if($type === SENTINEL) {
                        $json.value = $this.clone($value, internalKey);
                    }
                } else if($errorsAsValues === true || $type !== ERROR) {
                    if($node != null) {
                        $json = $this.clone($value, internalKey);
                        if(obj_exists($json) && !Array.isArray($json)) {
                            $json[$TYPE] = GROUP;
                        }
                    } else {
                        $json = undefined;
                    }
                } else {
                    $json = undefined;
                }
            }
            rule { .graph($key, $root, $parent, $type, $value) } => { !($node[__SELF]) && ((
                $node[__SELF]   = $node  ) || true) && ((
                $node[__KEY]    = $key   ) || true) && ((
                $node[__PARENT] = $parent) || true) && ((
                $node[__ROOT]   = $root  ) || true) && ((
                $node[__GENERATION]) || ($node[__GENERATION] = ++__GENERATION_GUID) && $node) && ((
                $this.isLink($type, $value)) && ($value[__CONTAINER] = $node)) || $node
            }
            rule { .update($child, $size_offset, $version) } => {
                
                var self = $node, child = $child;
                
                while($child = $node) {
                    $node = $child[__PARENT];
                    if(($child[$SIZE] = ($child[$SIZE] || 0) - $size_offset) <= 0 && $node) {
                        $this.remove($child, $child[__KEY])
                    } else if($child[__GENERATION_UPDATED] !== $version) {
                        $child.mutate($version)
                    }
                }
                
                $node = self;
                $child = child;
            }
            rule { .evolve($version) } => {
                var self = $node, node;
                while(node = $node) {
                    if($node[__GENERATION_UPDATED] !== $version) {
                        $this.mutate($version)
                    }
                    $node = node[__PARENT];
                }
                $node = self;
            }
            rule { .mutate($version) } => {
                
                var self  = $node,
                    stack = [], depth = 0,
                    linkPaths, ref, i, k, n;
                
                while(depth > -1) {
                    if((linkPaths = stack[depth]) === undefined) {
                        
                        i = k = -1;
                        n = $node[__REFS_LENGTH] || 0;
                        
                        $node[__GENERATION_UPDATED] = $version;
                        $node[__GENERATION] = ++__GENERATION_GUID;
                        
                        if((ref = $node[__PARENT]) !== undefined && (
                            ref[__GENERATION_UPDATED] !== $version)) {
                            stack[depth] = linkPaths = new Array(n + 1);
                            linkPaths[++k] = ref;
                        } else if(n > 0) {
                            stack[depth] = linkPaths = new Array(n);
                        }
                        
                        while(++i < n) {
                            if((ref = $node[__REF + i]) !== undefined && (
                                ref[__GENERATION_UPDATED] !== $version)) {
                                linkPaths[++k] = ref;
                            }
                        }
                    }
                    if(($node = linkPaths && linkPaths.pop()) !== undefined) {
                        ++depth;
                    } else {
                        stack[depth--] = undefined;
                    }
                }
                $node = self;
            }
            rule infix { $dest = | .replace($child, $replacement, $key) } => {
                if($child !== $replacement && $child.isObject()) {
                    $child.transferBackRefs($replacement)
                    $this.invalidate($child, $key)
                }
                $node[$key] = $dest = $replacement
            }
            rule { .remove($child, $key:expr) } => {
                $child.unlink($child.value())
                if($child.isObject()) {
                    $child.deleteBackRefs();
                    $child.splice();
                    $node[$key] = $child[__SELF] = $child[__PARENT] = $child[__ROOT] = undefined;
                }
            }
            rule { .invalidate($child, $key:expr) } => {
                
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
                            for(var childKey in $child) {
                                !(falcorKey(childKey)) && (keys[++index] = childKey);
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
                    
                    $this.remove($child, invKey);
                    
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
            rule { .link($linkPath) } => {
                var refContainer = $linkPath[__CONTAINER] || $linkPath,
                    refContext   = refContainer[__CONTEXT];
                // Set up the hard-link so we don't have to do all
                // this work the next time we follow this linkPath.
                if(refContext === undefined) {
                    
                    var backRefs = $node[__REFS_LENGTH] || 0;
                    
                    // create a back link
                    $node[__REF + backRefs] = refContainer;
                    $node[__REFS_LENGTH] = backRefs + 1;
                    
                    // create a forward link
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
                $node[__REFS_LENGTH] = ref = undefined;
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
                    delete $value[$SIZE];
                    if($this.isSentinel($type)) {
                        $size = SENTINEL_SIZE + ($value.length || 1);
                    } else {
                        $size = $value.length || 1;
                    }
                    $dest[$SIZE] = $size;
                    $value[__CONTAINER] = $dest;
                } else if($this.isSentinel($type)) {
                    $dest[$SIZE] = $size = SENTINEL_SIZE + ((typeof $value === "string") && $value.length || 1);
                } else if($this.isError($type)) {
                    $dest[$SIZE] = $size = $this.size() || (SENTINEL_SIZE + 1);
                } else if($this.isPrimitive()) {
                    $size = SENTINEL_SIZE + ((typeof $value === "string") && $value.length || 1);
                    $type = "sentinel";
                    $dest = Object.create(null);
                    $dest[VALUE] = $value;
                    $dest[$TYPE] = $type;
                    $dest[$SIZE] = $size;
                } else {
                    $type = $dest[$TYPE] = $type || GROUP;
                    $dest[$SIZE] = $size = $this.size() || (SENTINEL_SIZE + 1);
                }
            }
            /** LRU operations **/
            rule { .promote($expires:expr) } => {
                if($node != null && ($expires !== EXPIRES_NEVER)) {
                    var root = $rootModel,
                        head = root.__head,
                        tail = root.__tail,
                        next = $node.__next,
                        prev = $node.__prev;
                    if ($node !== head) {
                        (next != null && typeof next === "object") && (next.__prev = prev);
                        (prev != null && typeof prev === "object") && (prev.__next = next);
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
            rule { .splice() } => {
                var root = $rootModel,
                    head = root.__head, tail = root.__tail,
                    next = $node.__next, prev = $node.__prev;
                (next != null && typeof next === "object") && (next.__prev = prev);
                (prev != null && typeof prev === "object") && (prev.__next = next);
                ($node === head) && (root.__head = root.__next = next);
                ($node === tail) && (root.__tail = root.__prev = prev);
                $node.__next = $node.__prev = undefined;
                head = tail = next = prev = undefined;
            }
            rule { } => { $node }
        }
        macro $this {
            rule { .$inv() } => { $node.$inv() }
            rule { .$inv($arg (,) $[...]) } => { $node.$inv($arg (,) $[...]) }
            rule { } => { $node }
        }
    }; }
    rule { } => { $[NodeMixin] }
}
export NodeMixin;