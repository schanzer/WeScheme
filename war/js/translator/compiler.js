/////////////////// CPS PROCEDURES /////////////////////
var mapCps = function (proc, xs, ret) {
  return foldrCps((function (x, ys, k) {
    return proc(x, (function (y) {
      return k(cons(y, ys));
    }));
  }), [], xs, ret);
};

var andmapCps = function (proc, xs, ret) {
  return foldlCps((function (f, r, k) {
    return proc(f, (function (b) {
      return k(((b) && (r)));
    }));
  }), true, xs, ret);
};

function continuation(value) {
  this.value = value;
}

var foldrCps = function (proc, base, ls, ret) {
  for(var index=ls.length; index>0; index--) {
    base = proc(ls[index-1], base,
                (function (y) {
		   return new continuation(y);
		 }));
    if(base instanceof continuation) {
      base = base.value;
    } else {
      return base;
    }
  }

  return ret(base);
};

var foldlCps = function (proc, base, ls, ret) {
  for(var index=0; index<ls.length; index++){
    base = proc(ls[index], base,
		 (function (y) {
		    return new continuation(y);
		  }));
    if(base instanceof continuation) {
      base = base.value;
    } else {
      return base;
    }
  }

  return ret(base);
};

var filterCps = function (proc, ls, k) {
  return foldlCps((function (x, xs, k2) {
          return proc(x, (function (bool) {
              return k2(falseP(bool) ? xs :
                cons(x, xs));
              }));
          }), [], ls,
          (function (newLs) {
             return k(reverse(newLs));
           }));
};

////////////////////// EVAL /////////////////////////

var selfEvalP = (function (e) {
  return ((numberExprP(e)) || (booleanExprP(e)) || (symbolExprP(e)) || (charExprP(e)) || (mtListExprP(e)) || (stringExprP(e)) || (imageExprP(e)));
});

var evalSelf = (function (e) {
  return numberExprP(e) ? e.val :
  booleanExprP(e) ? isSymbolEqualTo(e.val, new quote("true")) :
  symbolExprP(e) ? e.val :
  charExprP(e) ? makeCharVal(e.val) :
  stringExprP(e) ? e.val :
  mtListExprP(e) ? [] :
  imageExprP(e) ? makeImgVal(e.val, e.width, e.height, e.x, e.y) :
  err("cond", "all questions false");
});

function progRes(vals, err, testResults, provides) {
  this.vals = vals;
  this.err = err;
  this.testResults = testResults;
  this.provides = provides;
};
function makeProgRes(vals, err, testResults, provides) { return new progRes(vals, err, testResults, provides); };
function progResP(x) { return x instanceof progRes; };
function progResVals(x) { return x.vals; };
function progResErr(x) { return x.err; };
function progResTestResults(x) { return x.testResults; };
function progResProvides(x) { return x.provides; };



////////////////   COMPILER  OBJECT ////////////////////
(function () {

function compile(p) {
  var c = compileStar(testsToEnd(p), loadNdefs(p, initNenv));
  return (function (_) {
          return first(tramp(c(loadVdefs(p, initVenv), [], [])));
          });
};

function compileSlashEnvs(p, nenv, venv) {
  var c = compileStar(testsToEnd(p), loadNdefs(p, nenv));
  return (function (_) {
          return tramp(c(loadVdefs(p, venv), [], []));
          });
};

// compile* : AST nEnv -> bytecode
function compileStar(p, nenv) {
   var bytecode;
   if(emptyP(p)){ // compile empty AST
console.log("given nothing to compile: "+p);
     bytecode = (function (venv, vs, provides) {
      return (function (_) {
              return [makeProgRes(reverse(vs), false, [], provides), nenv, venv];
              });
      })()
   } else if(testCaseP(first(p))){ // compile test case
console.log("compiling test case: "+p);
     var cT = compileTestsStar(p, nenv);
     bytecode = (function (venv, vs, provides) {
                 return (function (_) {
                         return [makeProgRes(reverse(vs), false, cT(venv), provides), nenv, venv];
                         });
                 });
   } else if(reqP(first(p))){ // compile require
console.log("compiling require: "+p);
      bytecode = (function () {
      var cReq = compileReq(first(p));
      var cR = compileStar(rest(p), append(nenv, first(cReq)));
      return (function (venv, vs, provides) {
        return (function (_) {
        return (function () { var progresSlashEnv = tramp(second(cReq)(venv, identity));
      var progres = first(progresSlashEnv);
      var resNenv = second(progresSlashEnv);
      var resVenv = third(progresSlashEnv);
      var resErr = progResErr(progres);
      var resVals = progResVals(progres);
      var providedIds = progResProvides(progres);
      var providedVenv = map((function (nenvFrame, venvFrame) {
        return reverse(foldl2((function (x1, x2, b) {
        return consP(providedIds) ? ormap((function (id) {
        return eqP(x1, id);
      }), providedIds) ? cons(x2, b) :
        b :
        cons(x2, b);
      }), [], recFrameP(nenvFrame) ? recFrameIds(nenvFrame) :
        nenvFrame, venvFrame));
      }), resNenv, resVenv);

      return errP(resErr) ? [makeProgRes(reverse(vs), resErr, false, provides), nenv, venv] :
        cR(append(venv, providedVenv), append(resVals, vs), provides);
       })();
      });
      });
       })()
   } else if (provideP(first(p))) { // compile provide
console.log("compiling provide: "+p);
    bytecode = (function () {
                var ids = first(p).val;
                var cR = compileStar(rest(p), nenv);
                return isSymbol(ids) ? (function (venv, vs, provides) {
                                       return (function (_) {
                                               return cR(venv, vs, new quote("all-defined-out"));
                                               });
                                       }) :
                (function (venv, vs, provides) {
                 return (function (_) {
                         return isSymbol(provides) ? cR(venv, vs, provides) :
                         cR(venv, vs, append(ids, provides));
                         });
                 });
                })()
     } else if(exprP(first(p))) { // compile expression
console.log("compiling expr: "+p);
        bytecode = (function () { var cE = compileExpr(first(p), nenv);
          var cR = compileStar(rest(p), nenv);
          return (function (venv, vs, provides) {
            return (function (_) {
            return (function () { var v = tramp(cE(venv, identity));
          return errP(v) ? [makeProgRes(reverse(vs), v, false, provides), nenv, venv] :
            cR(venv, cons(v, vs), provides);
           })();
          });
          });
           })()
     } else if(defStructP(first(p))){ // compile struct definition
console.log("compiling struct definition: "+p);
         bytecode = (function () { var cR = compileStar(rest(p), nenv);
          
          return (function (venv, vs, provides) {
                  return (function (_) {
                          return cR(venv, vs, provides);
                          });
                  });
          })()
     } else if(defFuncP(first(p))){ // compile func definition
console.log("compiling function definition: "+p);
       bytecode = compileStar(cons(defFuncToDefVarLambda(first(p)), rest(p)), nenv)
     } else if(defVarP(first(p))){ // compile var definition
console.log("compiling var definition: "+p);
       bytecode = (function () { var cD = compileDefVar(first(p), nenv);
                    var cR = compileStar(rest(p), nenv);
                    return (function (venv, vs, provides) {
                            return (function (_) {
                                    return (function () { var venvStar = tramp(cD(venv));
                                            return errP(venvStar) ? [makeProgRes(vs, venvStar, false, provides), nenv, venv] :
                                            cR(venvStar, vs, provides);
                                            })();
                                    });
                            });
                    })()
     } else {
       err("cond", "all questions false");
     }
 console.log(bytecode);
     return bytecode;
}

var foldl2 = (function (proc, base, l1, l2) {
  return (function () { var f = (function (p, b, l1, l2) {
  return emptyP(l1) ? b :
  f(p, proc(first(l1), first(l2), b), rest(l1), rest(l2));
});

return EqualSign(length(l1), length(l2)) ? f(proc, base, l1, l2) :
  error(new quote("foldl"), "lists are not of the same length.");
 })();
});

// compileTestsStar : AST nEnv -> bytecode
function compileTestsStar(p, nenv) {
  var bytecode;
  if(emptyP(p)){
    bytecode = (function (venv) { return [];})
  } else {
    var cT = compileTest(first(p), nenv);
    var cR = compileTestsStar(rest(p), nenv);
    bytecode = (function (venv) {
                return cons(tramp(cT(venv)), cR(venv));
                });
 }
 return bytecode;
}

var loadVdefs = (function (prog, venv) {
  return foldr((function (x, xs) {
  return ((defVarP(x)) || (defFuncP(x))) ? extend([box(undefn)], xs) :
  defStructP(x) ? extend(buildStructVframe(x), xs) :
  xs;
}), venv, prog);
});

var loadNdefs = (function (prog, nenv) {
  return foldr((function (x, xs) {
  return ((defVarP(x)) || (defFuncP(x))) ? extend(makeRecFrame([definitionName(x)]), xs) :
  defStructP(x) ? extend(buildStructNframe(x), xs) :
  xs;
}), nenv, prog);
});

// defFuncToDefVarLambda : defFun -> defLambda
function defFuncToDefVarLambda(d) {
  return makeDefVar(d.name, makeLambdaExpr(d.args, d.body));
}

function testsToEnd(p) {
  var splitTestCasesStar = (function (p, pStar, ts) {
        return emptyP(p) ? append(reverse(pStar), reverse(ts)) :
        testCaseP(first(p)) ? splitTestCasesStar(rest(p), pStar, cons(first(p), ts)) :
        splitTestCasesStar(rest(p), cons(first(p), pStar), ts);
      });
  return splitTestCasesStar(p, [], []);
}

// compileDefVar : defVar nEnv -> bytecode
function compileDefVar(def, nenv) {
  console.log("compiling defVar: "+def);
  var cExpr = compileExpr(def.expr, nenv);
  var addr = address(def.name, nenv);
  var bytecode = (function (venv) {
          return (function (_) {
                  return cExpr(venv, (function (v) {
                                          if(errP(v)){ return v; }
                                          else{
                                           var undefVal = valueof(boxedAddrI(addr), boxedAddrJ(addr), venv);
                                           var DO = setBoxB(undefVal, v);
                                           return venv;
                                          }
                                          }));
                  });
          });
 return bytecode;
}

// compileExpr : Expr nEnv -> bytecode
function compileExpr(e, nenv) {
console.log("compiling single Expr: "+e);
  var bytecode = selfEvalP(e) ? compileSelf(e) :
                isSymbol(e) ? compileVar(e, nenv) :
                primopP(e) ? compilePrimop(e) :
                lambdaExprP(e) ? compileLambda(e, nenv) :
                callP(e) ? compileCall(e, nenv) :
                letExprP(e) ? compileLet(e, nenv) :
                letStarExprP(e) ? compileLetStar(e, nenv) :
                letrecExprP(e) ? compileLetrecStar(e, nenv) :
                localExprP(e) ? compileLocal(e, nenv) :
                ifExprP(e) ? compileIf(e, nenv) :
                condExprP(e) ? compileCond(e, nenv) :
                andExprP(e) ? compileAnd(e, nenv) :
                orExprP(e) ? compileOr(e, nenv) :
                qqListP(e) ? compileQqList(e, nenv) :
                error(new quote("compile-expr"), format("~a is unsupported at this time.", e));
}

// compileExprs : Exprs nEnv -> bytecode
function compileExprs(es, nenv) {
console.log("compiling Exprs: "+e);
 var bytecode;
 if(emptyP(es)){
  bytecode = (function (venv, ret) { return ret([]); });
 } else if(consP(es)) {
   var cF = compileExpr(first(es), nenv);
   var cR = compileExprs(rest(es), nenv);
   bytecode = (function (venv, ret) {
                return (function (_) {
                          return cF(venv, (function (f) {
                                                return cR(venv, (function (r) {
                                                                      return ret(cons(f, r));
                                                                     }));
                                                }));
                          });
                });
 } else {
  err("cond", "all questions false");
 }
 return bytecode;
}

// compileSelf : expr -> bytecode
function compileSelf(expr) {
 console.log("compiling self: "+expr);
 var v = evalSelf(expr);
 return (function (env, ret) {
                  return (function (_) { return ret(v); });
                  });
}

// compileVar : var nEnv -> bytecode
function compileVar(expr, nenv) {
console.log("compiling var reference: "+expr);
 var bytecode = (function () {
     var addr = address(expr, nenv);
     if(boxedAddrP(addr)){
       var i = boxedAddrI(addr);
       var j = boxedAddrJ(addr);
       return (function (venv, ret) {
               return (function (_) {
                       var v = unbox(valueof(i, j, venv));
                       return undefinedP(v) ? err(new quote("local-variable"), msgUndefn(expr)) : ret(v);
                       });
               });
       } else if(unboxedAddrP(addr)){
         var i = unboxedAddrI(addr);
         var j = unboxedAddrJ(addr);
         return (function (venv, ret) {
                  return (function (_) {
                          return ret(valueof(i, j, venv));
                          });
                    });
       } else {
          return (function (venv, ret) {
                  return (function (_) { return addr; });
                  });
                 }
       })();
}
 
// compilePrimop : expr -> bytecode
function compilePrimop(expr) {
console.log("compiling primop "+expr);
  var primop = lookupPrim(expr.val);
  var bytecode = (function (venv, ret) {
                  return (function (_) { return ret(primop);});
                  });
 return bytecode;
}

// compileLambda : lambda nEnv -> bytecode
function compileLambda(expr, nenv) {
console.log("compiling lambda "+expr);
 var bytecode = (function () {
                 var cBody = compileExpr(expr.body, cons(expr.args, nenv));
                 var arity = length(expr.args);
                 return (function (venv, ret) {
                         return (function (_) {
                                 return ret(makeProc(arity, cBody, venv));
                                 });
                         });
                 })();
 return bytecode;
}

// compileCall : call nEnv -> bytecode
function compileCall(expr, nenv) {
console.log("compiling call: "+expr);
  var bytecode = (function () {
          var cF = compileExpr(expr.func, nenv);
          var csVs = compileExprs(expr.args, nenv);
          return (function (venv, ret) {
                  return (function (_) {
                          return cF(venv, (function (f) {
                                               return csVs(venv, (function (vs) {
                                                                      return applyProcedure(f, vs, err, ret);
                                                                      }));
                                               }));
                          });
                  });
          })();
   return bytecode;
}
 
// compileLet : let nEnv -> bytecode
function compileLet(expr, nenv) {
console.log("compiling let: "+expr);
  return (function () {
          var ids = map(coupleFirst, expr.bindings);
          var cVals = compileExprs(map(coupleSecond, expr.bindings), nenv);
          var cBody = compileExpr(expr.body, cons(ids, nenv));
          return (function (venv, ret) {
                  return (function (_) {
                          return cVals(venv, (function (vals) {
                                                  return cBody(cons(vals, venv), ret);
                                                  }));
                          });
                  });
          })();
}

// compileLetStar : expr nEnv -> bytecode
function compileLetStar(expr, nenv) {
  return compileLetStarBindings(expr.bindings, expr.body, nenv);
}

//compileLetStarBindings : bindings body nEnv -> bytecode
function compileLetStarBindings(bs, body, nenv) {
console.log("compiling let* bindings: "+bs);
  var bytecode;
  if(emptyP(bs)){
    bytecode = compileExpr(body, nenv);
  } else {
    bytecode = (function () {
                var cF = compileExpr(coupleSecond(first(bs)), nenv);
                var cR = compileLetStarBindings(rest(bs), body, cons([coupleFirst(first(bs))], nenv));
                return (function (venv, ret) {
                        return (function (_) {
                                return cF(venv, (function (v1) {
                                                     return cR(cons([v1], venv), ret);
                                                     }));
                                });
                        });
                })();
 }
 return bytecode;
}

// compileLetrecStar : letrec nEnv -> bytecode
function compileLetrecStar(expr, nenv) {
console.log("compiling letrec bindings: "+expr);
 var bytecode = (function () {
    var ids = map(coupleFirst, expr.bindings);
    var cBody = compileExpr(expr.body, cons(ids, nenv));
    var cBindings = compileLetrecStarRhss(map(coupleSecond, expr.bindings),
                                                      cons(makeRecFrame(ids), nenv));
    return (function (venv, ret) {
            return (function (_) {
                    return (function () { var venvStar = cons(buildList(length(ids), (function (x) {
                                                                                          return box(undefn);
                                                                                          })), venv);
                            return cBindings(0, venvStar, (function (vs) {
                                                               return cBody(cons(map(unbox, first(venvStar)), rest(venvStar)), ret);
                                                               }));
                            })();
                    });
            });
    })();
}

// compileLetrecStarRhss : exprs nEnv -> bytecode
function compileLetrecStarRhss(es, nenv) {
console.log("compiling letrec RHS: "+expr);
 var bytecode;
 if(emptyP(es)){
  bytecode = (function (i, venv, ret) { return ret([]);});
 } else if(consP(es)) {
  bytecode = (function () {
              var cF = compileExpr(first(es), nenv);
              var cR = compileLetrecStarRhss(rest(es), nenv);
              return (function (i, venv, ret) {
                      return (function (_) {
                              return cF(venv, (function (f) {
                                                   return (function () { var DO = setBoxB(listRef(first(venv), i), f);
                                                           return cR(add1(i), venv, (function (r) { return ret(cons(f, r));}));
                                                           })();
                                                   }));
                              });
                      });
              })();
 } else {
  err("cond", "all questions false");
 }
 return bytecode;
}

// compileLocal : local nEnv -> bytecode
function compileLocal(e, nenv) {
  console.log("compiling local: "+e);
  return (function () {
          var defs = e.defs;
          var cLocal = compileLocalDefs(defs, e.body, loadNdefs(defs, nenv));
          return (function (venv, ret) {
                  return (function (_) {
                          return cLocal(loadVdefs(defs, venv), ret);
                          });
                  });
          })();
}

// compileLocalDefs : defintions body nEnv -> bytecode
function compileLocalDefs(ds, b, nenv) {
  console.log("compiling local defs: "+ds);
  var bytecode;
  if(emptyP(ds)){
    bytecode = compileExpr(b, nenv);
 } else if(defStructP(first(ds))) {
    bytecode = (function () {
     var cR = compileLocalDefs(rest(ds), b, nenv);
     return (function (venv, ret) {
             return (function (_) { return cR(venv, ret); });
             });
     })()
 } else if(defFuncP(first(ds))){
     bytecode = compileLocalDefs(cons(defFuncToDefVarLambda(first(ds)), rest(ds)), b, nenv);
 } else if(defVarP(first(ds))){
     bytecode = (function () {
                  var cD = compileDefVar(first(ds), nenv);
                 var cR = compileLocalDefs(rest(ds), b, nenv);
                 return (function (venv, ret) {
                         return (function (_) {
                                 return (function () { var venvStar = tramp(cD(venv));
                                         return errP(venvStar) ? venvStar :
                                         cR(venvStar, ret);
                                         })();
                                 });
                         });
                 })()
  } else {
    err("cond", "all questions false");
  }
  return bytecode;
}

// compileIf : expr nEnv -> bytecode
function compileIffunction (expr, nenv) {
 console.log("compiling if function: "+expr);
 bytecode = (function () {
         var cPred = compileExpr(expr.predicate, nenv);
         var cThen = compileExpr(expr.then, nenv);
         var cElse = compileExpr(expr.els, nenv);
         return (function (venv, ret) {
                 return (function (_) {
                         return cPred(venv, (function (v) {
                                                 return booleanP(v) ? v ? cThen(venv, ret) :
                                                 cElse(venv, ret) :
                                                 err(new quote("if"), msgNotBool(v));
                                                 }));
                         });
                 });
         })();
 return bytecode;
}

// compileCond : expr nEnv -> bytecode
function compileCond(expr, nenv) {
 console.log("compiling cond expr: "+expr);
  return (function () { var compileClauses = (function (cs) {
  return emptyP(cs) ? (function (venv, ret) {
  return (function (_) {
  return err(new quote("cond"), msgCondAllFalse);
});
}) :
  eqP(new quote("else"), coupleFirst(first(cs))) ? compileExpr(coupleSecond(first(cs)), nenv) :
  (function () { var cQ = compileExpr(coupleFirst(first(cs)), nenv);

var cA = compileExpr(coupleSecond(first(cs)), nenv);

var cR = compileClauses(rest(cs));

return (function (venv, ret) {
  return (function (_) {
  return cQ(venv, (function (vQ) {
  return booleanP(vQ) ? vQ ? cA(venv, ret) :
  cR(venv, ret) :
  err(new quote("cond"), msgNotBool(vQ));
}));
});
});
 })();
});

return compileClauses(expr.clauses);
 })();
}


function andLoop(ls) {
  return emptyP(ls) ? (function (venv, ret) {
  return ret(true);
}) :
  (function () { var fstC = first(ls);

var rstC = andLoop(rest(ls));

return (function (venv, ret) {
  return (function (_) {
  return fstC(venv, (function (fstV) {
  return booleanP(fstV) ? fstV ? rstC(venv, ret) :
  ret(false) :
  err(new quote("and"), msgNotBool(fstV));
}));
});
});
 })();
}

// compileAnd : expr nEnv -> bytecode
function compileAnd(expr, nenv) {
 console.log("compiling and: "+expr);
 var bytecode = andLoop(map((function (e) {
                          return compileExpr(e, nenv);
                          }), expr.exprs));
 return bytecode;
}

var orLoop = (function (ls) {
  return emptyP(ls) ? (function (venv, ret) {
  return ret(false);
}) :
  (function () { var fstC = first(ls);

var rstC = orLoop(rest(ls));

return (function (venv, ret) {
  return (function (_) {
  return fstC(venv, (function (fstV) {
  return booleanP(fstV) ? fstV ? ret(true) :
  rstC(venv, ret) :
  err(new quote("or"), msgNotBool(fstV));
}));
});
});
 })();
});

// compileAnd : expr nEnv -> bytecode
function compileOr(expr, nenv) {
 console.log("compiling or: "+expr);
 var bytecode = orLoop(map((function (e) {
                                 return compileExpr(e, nenv);
                                 }), expr.exprs));
 return bytecode;
}

// compileQqList : expr nEnv -> bytecode
function compileQqList(expr, nenv) {
 console.log("compiling compileQqList: " + expr);
  return (function () { var cEs = map((function (expr) {
  return qqSpliceP(expr) ? makeQqSplice(compileExpr(expr.val, nenv)) :
  compileExpr(expr, nenv);
}), expr.val);

return (function (venv, ret) {
  return (function (_) {
  return foldrCps((function (x, xs, retStar) {
  return qqSpliceP(x) ? x.val(venv, (function (vals) {
  return retStar(foldr(cons, xs, vals));
})) :
  x(venv, (function (val) {
  return retStar(cons(val, xs));
}));
}), [], cEs, ret);
});
});
 })();
}

// compileTest : test nEnv -> bytecode
function compileTest(test, nenv) {
 console.log("compiling test: "+test);
 if(chkExpectP(test)) return compileChkExpect(test, nenv);
 if(chkWithinP(test)) return compileChkWithin(test, nenv);
 if(chkErrorP(test))  return compileChkError(test, nenv);
 else err("cond", "all questions false");
}

// compileTest : test nEnv -> bytecode
function compileChkExpect(test, nenv) {
 console.log("compiling check-expect: "+test);
  return (function () {
          var cActual = compileExpr(test.actual, nenv);
          var cExpect = compileExpr(test.expected, nenv);
          return (function (venv) {
                  return (function (_) {
                          return cActual(venv, (function (a) {
                                                    return cExpect(venv, (function (e) {
                                                                              return primColonEqualP([a, e], err, identity) ? true :
                                                                              [new quote("expect"), test.sexp, a, e];
                                                                              }));
                                                    }));
                          });
                  });
          })();
}

// compileChkWithin : test nEnv -> bytecode
function compileChkWithin(test, nenv) {
  console.log("compiling check-within: "+test);
  return (function () {
          var cActual = compileExpr(test.actual, nenv);
          var cExpect = compileExpr(test.expected, nenv);
          var cRange = compileExpr(test.range, nenv);
          return (function (venv) {
                  return (function (_) {
                          return cActual(venv, (function (v1) {
                                                    return cExpect(venv, (function (v2) {
                                                                              return cRange(venv, (function (dx) {
                                                                                                       return primColonEqualTildeP([v1, v2, dx], err, identity) ? true :
                                                                                                       [new quote("within"), test.sexp, v1, v2, dx];
                                                                                                       }));
                                                                              }));
                                                    }));
                          });
                  });
          })();
}

// compileChkError : test nEnv -> bytecode
function compileChkError(test, nenv) {
 console.log("compiling check-error: "+test);
 return (function () {
         var cActual = compileExpr(test.actual, nenv);
         var cError = compileExpr(test.error, nenv);
         return (function (venv) {
                 return (function (_) {
                         return (function () { var actual = tramp(cActual(venv, identity));
                                 return cError(venv, (function (errmsg) {
                                                          return isString(errmsg) ? errP(actual) ? stringEqualSignP(errmsg, errGreaterThanString(actual)) ? true :
                                                          [new quote("error"), test.sexp, errmsg, errGreaterThanString(actual)] :
                                                          err(new quote("check-error"), msgNotError(actual)) :
                                                          err(new quote("check-error"), stringAppend("expected a string to check against", " error message but found: ", valGreaterThanString(errmsg)));
                                                          }));
                                 })();
                         });
                 });
         })();
}

 
/////////////////////
/* Export Bindings */
/////////////////////
 
window.compile = compile;
window.compileSlashEnvs = compileSlashEnvs;
window.compileExpr = compileExpr;

})();