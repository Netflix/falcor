macro identity {
    rule infix { $ret:ident = | ($arg) } => { $arg }
    rule infix { $ret:ident = | ($arg, $opts ...) } => { $arg }
    rule { ($arg) } => { $arg }
    rule { ($arg, $opts ...) } => { $arg }
    rule { } => { $[identity] }
}
export identity;

macro noop {
    rule infix { $ret:ident = | ($opts ...) } => { }
    rule { ($opts ...) } => { }
    rule { = $x:expr ; } => { }
    rule { = $x:expr } => { }
    rule { } => { }
}
export noop;

let break = macro {
    rule infix { $ret:ident = | ($arg ...) } => { break }
    rule { ($arg ...) } => { break }
    rule { } => { break }
}
export break;

macro keySetFalse {
    rule infix { $isKeySet:ident = | ($arg ...) } => { $isKeySet = false }
    rule { } => { $[keySetFalse] }
}
export keySetFalse;

let now = macro {
    rule { () } => { Date.now() }
    rule { } => { now }
}
export now;

macro constexpr {
    case {_($e:expr) } => {
        return localExpand(#{
            macro cexpr {
                case { _ } => {
                    return [makeValue($e, #{ here })];
                }
            }
            cexpr
        });
    }
}
export constexpr;

macro timeProcess {
    rule { $label:lit { $e ... } ; } => {
        var t = Date.now();
        $e ...
        t = Date.now() - t;
        console.log($label, t + 'ns');
    }
}
export timeProcess;

macro exists {
    rule { ($x:ident = $y:expr) } => {(($x = $y) && (typeof $x !== "undefined")) }
    rule { ($x:expr) } => { ($x != null) }
    rule { } => { $[exists] }
}
export exists;

macro obj_exists {
    rule { ($x:ident = $y:expr) } => {((($x = $y) != null) && (typeof $x === "object")) }
    rule { ($x:expr) } => { ($x != null && typeof $x === "object") }
}
export obj_exists;

macro tailrec {
    case infix { return | _ $name ($arg:ident (,) ...) { $body ... }($exp:expr (,) ...) } => {
        letstx $arg0 = #{ $arg ... }.slice(0, 1);
        return #{
            tailrec $name ($arg(,) ...) {
                $body ...
            }($exp (,) ...)
            return $arg0
        }
    }
    case infix { return | _ $name ($arg:ident (,) ...) { $body ... } } => {
        letstx $arg0 = #{ $arg ... }.slice(0, 1);
        return #{
            tailrec $name ($arg (,) ...) {
                $body ...
            }
            return $arg0
        }
    }
    case infix { $ret:ident = | _ $name ($arg:ident (,) ...) { $body ... }($exp:expr (,) ...) } => {
        letstx $arg0 = #{ $arg ... }.slice(0, 1);
        return #{
            tailrec $name ($arg (,) ...) {
                $body ...
            }($exp (,) ...)
            $ret = $arg0
        }
    }
    case infix { $ret:expr = | _ $name ($arg:ident (,) ...) { $body ... }($exp:expr (,) ...) } => {
        letstx $arg0 = #{ $arg ... }.slice(0, 1);
        return #{
            tailrec $name ($arg (,) ...) {
                $body ...
            }($exp (,) ...)
            $ret = $arg0
        }
    }
    rule { function $name:ident ($arg:ident (,) ...) { $body ... }($exp:expr (,) ...) } => {
        function $name ($arg (,) ...) {
            $($arg = $exp) (,) ... ;
            return tailrec $name ($arg (,) ...) {
                $body ...
            }($exp (,) ...)
        }
    }
    rule { function $name:ident ($arg:ident (,) ...) { $body ... } } => {
        function $name ($arg (,) ...) {
            return tailrec $name ($arg (,) ...) {
                $body ...
            }
        }
    }
    rule { $name ($arg:ident (,) ...) { $body ... }($exp:expr (,) ...) } => {
        $($arg = $exp) (;) ...
        tailrec $name ($arg (,) ...) {
            $body ...
        }
    }
    case {_ $name ($arg:ident (,) ...) { $body ... } } => {
        var bstx = #{ $body ... }[0];
        var nstx = #{ $name }[0];
        letstx $inner ... = withSyntax(
            $arg0   = #{ $arg ... }.slice(0, 1),
            $label  = [makeIdent(nstx.token.value + "_" + __fresh(), nstx)],
            $return = [makeKeyword("return", nstx)]
        ) #{
            let $return = macro {
                case {_ $name ($val:expr (,) $[...]) } => {
                    letstx $args $[...] = #{ $arg ... };
                    letstx $vals $[...] = #{ $val $[...] };
                    return #{
                        $($args = $vals) (;) $[...] ;
                        continue $label
                    };
                }
                rule { $val:expr } => {
                    $arg0 = $val;
                    break $label
                }
                rule { } => { return }
            }
            $label: do {
                $body ...
            } while(true)
        };
        return #{
            $inner ...
            let $return = macro {
                case { _ } => {
                    console.log("end return");
                    return #{ $return }
                }
            }
        };
    }
}
export tailrec;

macro curried {
    rule { $($id = $mac($opt (,) ...)) (,) ... ; } => {
        $(macro $id {
            rule infix { $lhs:ident = | ($rest $[...]) } => {
                $lhs = $mac($opt (,) ..., $rest $[...])
            }
            rule { ($rest $[...]) } => {
                $mac($opt (,) ..., $rest $[...])
            }
        }) ...
    }
}
export curried;

let extends = macro {
    rule infix { $impl | macro $base ; } => {
        macro $impl {
            rule { $rest $[...] } => { $base $rest $[...] }
        }
    }
    rule infix { $impl | macro $base { $rules ... } } => {
        macro $impl {
            $rules ...
            rule { $rest $[...] } => { $base $rest $[...] }
        }
    }
    rule infix { $impl | $base } => { $impl extends $base }
}
export extends;

macro default {
    rule { var $source:ident <- $id:ident; } => {
        var $id = $source.$id;
    }
    rule { var $source:ident <- $id:ident $[:] $def:expr ; } => {
        var $id = $source.$id || ($source.$id = $def);
    }
    rule { var $source:ident <- $id:ident, $rest ... ; } => {
        var $id = $source.$id;
        default var $source <- $rest ...;
    }
    rule { var $source:ident <- $id:ident $[:] $def:expr, $rest ... ; } => {
        var $id = $source.$id || ($source.$id = $def);
        default var $source <- $rest ...;
    }
    rule { } => { $[default] }
}
export default;

macro internalKeys {
    rule { ($key:expr) } => { (!($key[0] !== "_" || $key[1] !== "_") || ($key === __SELF || $key === __PARENT || $key === __ROOT)) }
    rule { } => { $[internalKeys] }
}
export internalKeys;

macro falcorKeys {
    rule { ($key:expr) } => { (internalKeys($key) || ($key[0] === "$")) }
    rule { } => { $[falcorKeys] }
}
export falcorKeys;

macroclass decl {
    pattern { rule { $name:ident = $value:expr } }
    pattern { rule { $name:ident } with $value = #{undefined}; }
}

macroclass clone_class {
    pattern { rule { $name:ident = $[clone] $type:ident $value:expr } }
}

macroclass clone_array {
    pattern { rule { $name:ident = $[clone] array $value:expr } }
}

macroclass clone_object {
    pattern { rule { $name:ident = $[clone] object $value:expr without $filter:ident } }
    pattern { rule { $name:ident = $[clone] object $value:expr } with $filter = #{falcorKeys}; }
}

macro var {
    rule { $d:decl , $c:clone_class , $rest ... ; } => {
        var $d$name = $d$value;
        var $c$name = clone $c$type $c$value, $rest ... ;
    }
    rule { $c:clone_class , $rest ... ; } => {
        var $c$name = clone $c$type $c$value ;
        var $rest ... ;
    }
    rule { $c:clone_array ; } => {
        var src = $c$value, i = -1, n = src.length, $c$name = new Array(n);
        while(++i < n) { $c$name[i] = src[i]; }
    }
    rule { $c:clone_object ; } => {
        var $c$name = $c$value;
        if(obj_exists($c$name)) {
            var src = $c$name, keys = Object.keys(src),
                x, i = -1, n = keys.length;
            $c$name = Array.isArray(src) && new Array(src.length) || Object.create(null);
            while(++i < n) {
                x = keys[i];
                !($c$filter(x)) && ($c$name[x] = src[x]);
            }
        }
    }
    rule { } => { $[var] }
}
export var;

// Old clone impl. Compare perf
/*
var src = dest, keys = Object.keys(src),
    x, i = -1, n = keys.length;
dest = Array.isArray(src) && [] || Object.create(null);
while(++i < n) {
    x = keys[i];
    !($filter(x)) && (dest[x] = src[x]);
}
*/

macro clone {
    rule infix { $dest:expr = | object $source:expr without $filter:ident } => {
        var dest = $source, src = dest, x;
        if(obj_exists(dest)) {
            dest = Array.isArray(src) && [] || Object.create(null);
            for(x in src) { !($filter(x)) && (dest[x] = src[x]); }
        }
        $dest = dest
    }
    rule infix { $dest:expr = | object $source:expr } => {
        $dest = clone object $source without falcorKeys
    }
    rule infix { $dest:expr = | array $source:expr } => {
        var src = $source, i = -1, n = src.length, dest = new Array(n);
        while(++i < n) { dest[i] = src[i]; }
        $dest = dest
    }
    rule { } => { $[clone] }
}
export clone;