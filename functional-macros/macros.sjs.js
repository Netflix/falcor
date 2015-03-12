macro identity {
    rule infix { $ret:expr = | ($arg) } => { $ret = $arg }
    rule infix { $ret:expr = | ($arg, $rest ...) } => { $ret = $arg }
    rule { ($arg) } => { $arg }
    rule { ($arg, $rest ...) } => { $arg }
    rule { } => { $[identity] }
}
export identity;

macro noop {
    rule infix { $ret:expr = | ($rest ...) } => { }
    rule infix { $ret:expr = | [$rest:expr] ; } => { }
    rule infix { $ret:expr = | [$rest:expr] } => { }
    rule { [$x:expr] = $y:expr ; } => { }
    rule { [$x:expr] = $y:expr } => { }
    rule { ($rest ...) } => { }
    rule { [$rest ...] } => { }
    rule { = $x:expr ; } => { }
    rule { = $x:expr } => { }
    rule { } => { $[noop] }
}
export noop;

macro exists {
    rule { ($x:ident = $y:expr) } => { (($x = $y) != null) }
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
            }($exp (,) ...);
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
                    letstx $args $[...] = #{ $arg ... }.map(function(x) {
                        return x.addDefCtx(context.defscope);
                    });
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
            };
            $label: do {
                $body ...
            } while(true)
        };
        return #{
            $inner ...
            macro $return { rule { } => { $[return] } }
        };
    }
}
export tailrec;

macro curried {
    rule { $($id = $mac($opt (,) ...)) (,) ... ; } => {
        $(macro $id {
            rule infix { $lhs:ident = | ($rest $[...]) } => {
                $lhs = $mac($opt (,) ... , $rest $[...])
            }
            rule { ($rest $[...]) } => {
                $mac($opt (,) ... , $rest $[...])
            }
        }) ...
    }
}
export curried;

macro sequence {
    rule { $($id = [$mac (,) ...]) (,) ... ; } => {
        $(macro $id {
            rule infix { $lhs:ident = | ($rest $[...]) } => {
                $($lhs = $mac($rest $[...])) ...
            }
            rule { ($rest $[...]) } => {
                $($mac($rest $[...])) ...
            }
        }) ...
    }
}
export sequence;

macro internalKey {
    rule { ($key:expr) } => { (!($key[0] !== "_" || $key[1] !== "_") || ($key === __SELF || $key === __PARENT || $key === __ROOT)) }
    rule { } => { $[internalKey] }
}
export internalKey;

macro signedKey {
    rule { ($key:expr) } => { ($key[0] === "$" && $key !== $SIZE) }
    rule { } => { $[signedKey] }
}
export signedKey;

macro falcorKey {
    rule { ($key:expr) } => { (internalKey($key) || $key[0] === "$") }
    rule { } => { $[falcorKey] }
}
export falcorKey;
