/////////////////// CPS PROCEDURES /////////////////////
var mapDashCps = function (proc, xs, ret) {
  return foldrDashCps((function (x, ys, k) {
    return proc(x, (function (y) {
      return k(cons(y, ys));
    }));
  }), [], xs, ret);
};

var andmapDashCps = function (proc, xs, ret) {
  return foldlDashCps((function (f, r, k) {
    return proc(f, (function (b) {
      return k(((b) && (r)));
    }));
  }), true, xs, ret);
};

function continuation(value) {
  this.value = value;
}

var foldrDashCps = function (proc, base, ls, ret) {
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

var foldlDashCps = function (proc, base, ls, ret) {
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

var filterDashCps = function (proc, ls, k) {
  return foldlDashCps((function (x, xs, k2) {
          return proc(x, (function (bool) {
              return k2(falseP(bool) ? xs :
                cons(x, xs));
              }));
          }), [], ls,
          (function (newDashLs) {
             return k(reverse(newDashLs));
           }));
};

////////////////////// EVAL /////////////////////////

var selfDashEvalP = (function (e) {
  return ((numberDashExprP(e)) || (booleanDashExprP(e)) || (symbolDashExprP(e)) || (charDashExprP(e)) || (mtDashListDashExprP(e)) || (stringDashExprP(e)) || (imageDashExprP(e)));
});

var evalDashSelf = (function (e) {
  return numberDashExprP(e) ? e.val :
  booleanDashExprP(e) ? symbolEqualSignP(e.val, new quote("true")) :
  symbolDashExprP(e) ? e.val :
  charDashExprP(e) ? makeDashCharDashVal(e.val) :
  stringDashExprP(e) ? e.val :
  mtDashListDashExprP(e) ? [] :
  imageDashExprP(e) ? makeDashImgDashVal(e.val, e.width, e.height, e.x, e.y) :
  err("cond", "all questions false");
});

function progDashRes(vals, err, testDashResults, provides) {
  this.vals = vals;
  this.err = err;
  this.testDashResults = testDashResults;
  this.provides = provides;
};
function makeDashProgDashRes(vals, err, testDashResults, provides) { return new progDashRes(vals, err, testDashResults, provides); };
function progDashResP(x) { return x instanceof progDashRes; };
function progDashResDashVals(x) { return x.vals; };
function progDashResDashErr(x) { return x.err; };
function progDashResDashTestDashResults(x) { return x.testDashResults; };
function progDashResDashProvides(x) { return x.provides; };



////////////////   COMPILER  OBJECT ////////////////////
(function () {

var compile = (function (p) {
  return (function () { var c = compileStar(testsDashToDashEnd(p), loadDashNdefs(p, initDashNenv));

return (function (_) {
  return first(tramp(c(loadDashVdefs(p, initDashVenv), [], [])));
});
 })();
});

var compileSlashEnvs = (function (p, nenv, venv) {
  return (function () { var c = compileStar(testsDashToDashEnd(p), loadDashNdefs(p, nenv));

return (function (_) {
  return tramp(c(loadDashVdefs(p, venv), [], []));
});
 })();
});

var compileStar = (function (p, nenv) {
  return emptyP(p) ? (function (venv, vs, provides) {
  return (function (_) {
  return [makeDashProgDashRes(reverse(vs), false, [], provides), nenv, venv];
});
}) :
  testDashCaseP(first(p)) ? (function () { var cDashT = compileDashTestsStar(p, nenv);

return (function (venv, vs, provides) {
  return (function (_) {
  return [makeDashProgDashRes(reverse(vs), false, cDashT(venv), provides), nenv, venv];
});
});
 })() :
  reqP(first(p)) ? (function () { var cDashReq = compileDashReq(first(p));

var cDashR = compileStar(rest(p), append(nenv, first(cDashReq)));

return (function (venv, vs, provides) {
  return (function (_) {
  return (function () { var progresSlashEnv = tramp(second(cDashReq)(venv, identity));

var progres = first(progresSlashEnv);

var resDashNenv = second(progresSlashEnv);

var resDashVenv = third(progresSlashEnv);

var resDashErr = progDashResDashErr(progres);

var resDashVals = progDashResDashVals(progres);

var providedDashIds = progDashResDashProvides(progres);

var providedDashVenv = map((function (nenvDashFrame, venvDashFrame) {
  return reverse(foldl2((function (x1, x2, b) {
  return consP(providedDashIds) ? ormap((function (id) {
  return eqP(x1, id);
}), providedDashIds) ? cons(x2, b) :
  b :
  cons(x2, b);
}), [], recDashFrameP(nenvDashFrame) ? recDashFrameDashIds(nenvDashFrame) :
  nenvDashFrame, venvDashFrame));
}), resDashNenv, resDashVenv);

return errP(resDashErr) ? [makeDashProgDashRes(reverse(vs), resDashErr, false, provides), nenv, venv] :
  cDashR(append(venv, providedDashVenv), append(resDashVals, vs), provides);
 })();
});
});
 })() :
  provideP(first(p)) ? (function () { var ids = first(p).val;

var cDashR = compileStar(rest(p), nenv);

return symbolP(ids) ? (function (venv, vs, provides) {
  return (function (_) {
  return cDashR(venv, vs, new quote("all-defined-out"));
});
}) :
  (function (venv, vs, provides) {
  return (function (_) {
  return symbolP(provides) ? cDashR(venv, vs, provides) :
  cDashR(venv, vs, append(ids, provides));
});
});
 })() :
  exprP(first(p)) ? (function () { var cDashE = compileDashExpr(first(p), nenv);

var cDashR = compileStar(rest(p), nenv);

return (function (venv, vs, provides) {
  return (function (_) {
  return (function () { var v = tramp(cDashE(venv, identity));

return errP(v) ? [makeDashProgDashRes(reverse(vs), v, false, provides), nenv, venv] :
  cDashR(venv, cons(v, vs), provides);
 })();
});
});
 })() :
  defDashStructP(first(p)) ? (function () { var cDashR = compileStar(rest(p), nenv);

return (function (venv, vs, provides) {
  return (function (_) {
  return cDashR(venv, vs, provides);
});
});
 })() :
  defDashFuncP(first(p)) ? compileStar(cons(defDashFuncDashToDashDefDashVarDashLambda(first(p)), rest(p)), nenv) :
  defDashVarP(first(p)) ? (function () { var cDashD = compileDashDefDashVar(first(p), nenv);

var cDashR = compileStar(rest(p), nenv);

return (function (venv, vs, provides) {
  return (function (_) {
  return (function () { var venvStar = tramp(cDashD(venv));

return errP(venvStar) ? [makeDashProgDashRes(vs, venvStar, false, provides), nenv, venv] :
  cDashR(venvStar, vs, provides);
 })();
});
});
 })() :
  err("cond", "all questions false");
});

var foldl2 = (function (proc, base, l1, l2) {
  return (function () { var f = (function (p, b, l1, l2) {
  return emptyP(l1) ? b :
  f(p, proc(first(l1), first(l2), b), rest(l1), rest(l2));
});

return EqualSign(length(l1), length(l2)) ? f(proc, base, l1, l2) :
  error(new quote("foldl"), "lists are not of the same length.");
 })();
});

var compileDashTestsStar = (function (p, nenv) {
  return emptyP(p) ? (function (venv) {
  return [];
}) :
  (function () { var cDashT = compileDashTest(first(p), nenv);

var cDashR = compileDashTestsStar(rest(p), nenv);

return (function (venv) {
  return cons(tramp(cDashT(venv)), cDashR(venv));
});
 })();
});

var loadDashVdefs = (function (prog, venv) {
  return foldr((function (x, xs) {
  return ((defDashVarP(x)) || (defDashFuncP(x))) ? extend([box(undefn)], xs) :
  defDashStructP(x) ? extend(buildDashStructDashVframe(x), xs) :
  xs;
}), venv, prog);
});

var loadDashNdefs = (function (prog, nenv) {
  return foldr((function (x, xs) {
  return ((defDashVarP(x)) || (defDashFuncP(x))) ? extend(makeDashRecDashFrame([definitionDashName(x)]), xs) :
  defDashStructP(x) ? extend(buildDashStructDashNframe(x), xs) :
  xs;
}), nenv, prog);
});

var defDashFuncDashToDashDefDashVarDashLambda = (function (d) {
  return makeDashDefDashVar(d.name, makeDashLambdaDashExpr(d.args, d.body));
});

var testsDashToDashEnd = (function (p) {
  return (function () { var splitDashTestDashCasesStar = (function (p, pStar, ts) {
  return emptyP(p) ? append(reverse(pStar), reverse(ts)) :
  testDashCaseP(first(p)) ? splitDashTestDashCasesStar(rest(p), pStar, cons(first(p), ts)) :
  splitDashTestDashCasesStar(rest(p), cons(first(p), pStar), ts);
});

return splitDashTestDashCasesStar(p, [], []);
 })();
});

var compileDashDefDashVar = (function (def, nenv) {
  return (function () { var cDashExpr = compileDashExpr(def.expr, nenv);

var addr = address(def.name, nenv);

return (function (venv) {
  return (function (_) {
  return cDashExpr(venv, (function (v) {
  return errP(v) ? v :
  (function () { var undefDashVal = valueof(boxedDashAddrDashI(addr), boxedDashAddrDashJ(addr), venv);

var DO = setDashBoxB(undefDashVal, v);

return venv;
 })();
}));
});
});
 })();
});

var compileDashExpr = (function (e, nenv) {
  return selfDashEvalP(e) ? compileDashSelf(e) :
  symbolP(e) ? compileDashVar(e, nenv) :
  primopP(e) ? compileDashPrimop(e) :
  lambdaDashExprP(e) ? compileDashLambda(e, nenv) :
  callP(e) ? compileDashCall(e, nenv) :
  letDashExprP(e) ? compileDashLet(e, nenv) :
  letStarDashExprP(e) ? compileDashLetStar(e, nenv) :
  letrecDashExprP(e) ? compileDashLetrecStar(e, nenv) :
  localDashExprP(e) ? compileDashLocal(e, nenv) :
  ifDashExprP(e) ? compileDashIf(e, nenv) :
  condDashExprP(e) ? compileDashCond(e, nenv) :
  andDashExprP(e) ? compileDashAnd(e, nenv) :
  orDashExprP(e) ? compileDashOr(e, nenv) :
  qqDashListP(e) ? compileDashQqDashList(e, nenv) :
  error(new quote("compile-expr"), format("~a is unsupported at this time.", e));
});

var compileDashExprs = (function (es, nenv) {
  return emptyP(es) ? (function (venv, ret) {
  return ret([]);
}) :
  consP(es) ? (function () { var cDashF = compileDashExpr(first(es), nenv);

var cDashR = compileDashExprs(rest(es), nenv);

return (function (venv, ret) {
  return (function (_) {
  return cDashF(venv, (function (f) {
  return cDashR(venv, (function (r) {
  return ret(cons(f, r));
}));
}));
});
});
 })() :
  err("cond", "all questions false");
});

var compileDashSelf = (function (expr) {
  return (function () { var v = evalDashSelf(expr);

return (function (env, ret) {
  return (function (_) {
  return ret(v);
});
});
 })();
});

var compileDashVar = (function (expr, nenv) {
  return (function () { var addr = address(expr, nenv);

return boxedDashAddrP(addr) ? (function () { var i = boxedDashAddrDashI(addr);

var j = boxedDashAddrDashJ(addr);

return (function (venv, ret) {
  return (function (_) {
  return (function () { var v = unbox(valueof(i, j, venv));

return undefinedP(v) ? err(new quote("local-variable"), msgDashUndefn(expr)) :
  ret(v);
 })();
});
});
 })() :
  unboxedDashAddrP(addr) ? (function () { var i = unboxedDashAddrDashI(addr);

var j = unboxedDashAddrDashJ(addr);

return (function (venv, ret) {
  return (function (_) {
  return ret(valueof(i, j, venv));
});
});
 })() :
  (function (venv, ret) {
  return (function (_) {
  return addr;
});
});
 })();
});

var compileDashPrimop = (function (expr) {
  return (function () { var primop = lookupDashPrim(expr.val);

return (function (venv, ret) {
  return (function (_) {
  return ret(primop);
});
});
 })();
});

var compileDashLambda = (function (expr, nenv) {
  return (function () { var cDashBody = compileDashExpr(expr.body, cons(expr.args, nenv));

var arity = length(expr.args);

return (function (venv, ret) {
  return (function (_) {
  return ret(makeDashProc(arity, cDashBody, venv));
});
});
 })();
});

var compileDashCall = (function (expr, nenv) {
  return (function () { var cDashF = compileDashExpr(expr.func, nenv);

var csDashVs = compileDashExprs(expr.args, nenv);

return (function (venv, ret) {
  return (function (_) {
  return cDashF(venv, (function (f) {
  return csDashVs(venv, (function (vs) {
  return applyDashProcedure(f, vs, err, ret);
}));
}));
});
});
 })();
});

var compileDashLet = (function (expr, nenv) {
  return (function () { var ids = map(coupleDashFirst, expr.bindings);

var cDashVals = compileDashExprs(map(coupleDashSecond, expr.bindings), nenv);

var cDashBody = compileDashExpr(expr.body, cons(ids, nenv));

return (function (venv, ret) {
  return (function (_) {
  return cDashVals(venv, (function (vals) {
  return cDashBody(cons(vals, venv), ret);
}));
});
});
 })();
});

var compileDashLetStar = (function (expr, nenv) {
  return compileDashLetStarDashBindings(expr.bindings, expr.body, nenv);
});

var compileDashLetStarDashBindings = (function (bs, body, nenv) {
  return emptyP(bs) ? compileDashExpr(body, nenv) :
  (function () { var cDashF = compileDashExpr(coupleDashSecond(first(bs)), nenv);

var cDashR = compileDashLetStarDashBindings(rest(bs), body, cons([coupleDashFirst(first(bs))], nenv));

return (function (venv, ret) {
  return (function (_) {
  return cDashF(venv, (function (v1) {
  return cDashR(cons([v1], venv), ret);
}));
});
});
 })();
});

var compileDashLetrecStar = (function (expr, nenv) {
  return (function () { var ids = map(coupleDashFirst, expr.bindings);

var cDashBody = compileDashExpr(expr.body, cons(ids, nenv));

var cDashBindings = compileDashLetrecStarDashRhss(map(coupleDashSecond, expr.bindings), cons(makeDashRecDashFrame(ids), nenv));

return (function (venv, ret) {
  return (function (_) {
  return (function () { var venvStar = cons(buildDashList(length(ids), (function (x) {
  return box(undefn);
})), venv);

return cDashBindings(0, venvStar, (function (vs) {
  return cDashBody(cons(map(unbox, first(venvStar)), rest(venvStar)), ret);
}));
 })();
});
});
 })();
});

var compileDashLetrecStarDashRhss = (function (es, nenv) {
  return emptyP(es) ? (function (i, venv, ret) {
  return ret([]);
}) :
  consP(es) ? (function () { var cDashF = compileDashExpr(first(es), nenv);

var cDashR = compileDashLetrecStarDashRhss(rest(es), nenv);

return (function (i, venv, ret) {
  return (function (_) {
  return cDashF(venv, (function (f) {
  return (function () { var DO = setDashBoxB(listDashRef(first(venv), i), f);

return cDashR(add1(i), venv, (function (r) {
  return ret(cons(f, r));
}));
 })();
}));
});
});
 })() :
  err("cond", "all questions false");
});

var compileDashLocal = (function (e, nenv) {
  return (function () { var defs = e.defs;

var cDashLocal = compileDashLocalDashDefs(defs, e.body, loadDashNdefs(defs, nenv));

return (function (venv, ret) {
  return (function (_) {
  return cDashLocal(loadDashVdefs(defs, venv), ret);
});
});
 })();
});

var compileDashLocalDashDefs = (function (ds, b, nenv) {
  return emptyP(ds) ? compileDashExpr(b, nenv) :
  defDashStructP(first(ds)) ? (function () { var cDashR = compileDashLocalDashDefs(rest(ds), b, nenv);

return (function (venv, ret) {
  return (function (_) {
  return cDashR(venv, ret);
});
});
 })() :
  defDashFuncP(first(ds)) ? compileDashLocalDashDefs(cons(defDashFuncDashToDashDefDashVarDashLambda(first(ds)), rest(ds)), b, nenv) :
  defDashVarP(first(ds)) ? (function () { var cDashD = compileDashDefDashVar(first(ds), nenv);

var cDashR = compileDashLocalDashDefs(rest(ds), b, nenv);

return (function (venv, ret) {
  return (function (_) {
  return (function () { var venvStar = tramp(cDashD(venv));

return errP(venvStar) ? venvStar :
  cDashR(venvStar, ret);
 })();
});
});
 })() :
  err("cond", "all questions false");
});

var compileDashIf = (function (expr, nenv) {
  return (function () { var cDashPred = compileDashExpr(expr.predicate, nenv);

var cDashThen = compileDashExpr(expr.then, nenv);

var cDashElse = compileDashExpr(expr.els, nenv);

return (function (venv, ret) {
  return (function (_) {
  return cDashPred(venv, (function (v) {
  return booleanP(v) ? v ? cDashThen(venv, ret) :
  cDashElse(venv, ret) :
  err(new quote("if"), msgDashNotDashBool(v));
}));
});
});
 })();
});

var compileDashCond = (function (expr, nenv) {
  return (function () { var compileDashClauses = (function (cs) {
  return emptyP(cs) ? (function (venv, ret) {
  return (function (_) {
  return err(new quote("cond"), msgDashCondDashAllDashFalse);
});
}) :
  eqP(new quote("else"), coupleDashFirst(first(cs))) ? compileDashExpr(coupleDashSecond(first(cs)), nenv) :
  (function () { var cDashQ = compileDashExpr(coupleDashFirst(first(cs)), nenv);

var cDashA = compileDashExpr(coupleDashSecond(first(cs)), nenv);

var cDashR = compileDashClauses(rest(cs));

return (function (venv, ret) {
  return (function (_) {
  return cDashQ(venv, (function (vDashQ) {
  return booleanP(vDashQ) ? vDashQ ? cDashA(venv, ret) :
  cDashR(venv, ret) :
  err(new quote("cond"), msgDashNotDashBool(vDashQ));
}));
});
});
 })();
});

return compileDashClauses(expr.clauses);
 })();
});

var andDashLoop = (function (ls) {
  return emptyP(ls) ? (function (venv, ret) {
  return ret(true);
}) :
  (function () { var fstDashC = first(ls);

var rstDashC = andDashLoop(rest(ls));

return (function (venv, ret) {
  return (function (_) {
  return fstDashC(venv, (function (fstDashV) {
  return booleanP(fstDashV) ? fstDashV ? rstDashC(venv, ret) :
  ret(false) :
  err(new quote("and"), msgDashNotDashBool(fstDashV));
}));
});
});
 })();
});

var compileDashAnd = (function (expr, nenv) {
  return andDashLoop(map((function (e) {
  return compileDashExpr(e, nenv);
}), expr.exprs));
});

var orDashLoop = (function (ls) {
  return emptyP(ls) ? (function (venv, ret) {
  return ret(false);
}) :
  (function () { var fstDashC = first(ls);

var rstDashC = orDashLoop(rest(ls));

return (function (venv, ret) {
  return (function (_) {
  return fstDashC(venv, (function (fstDashV) {
  return booleanP(fstDashV) ? fstDashV ? ret(true) :
  rstDashC(venv, ret) :
  err(new quote("or"), msgDashNotDashBool(fstDashV));
}));
});
});
 })();
});

var compileDashOr = (function (expr, nenv) {
  return orDashLoop(map((function (e) {
  return compileDashExpr(e, nenv);
}), expr.exprs));
});

var compileDashQqDashList = (function (expr, nenv) {
  return (function () { var cDashEs = map((function (expr) {
  return qqDashSpliceP(expr) ? makeDashQqDashSplice(compileDashExpr(expr.val, nenv)) :
  compileDashExpr(expr, nenv);
}), expr.val);

return (function (venv, ret) {
  return (function (_) {
  return foldrDashCps((function (x, xs, retStar) {
  return qqDashSpliceP(x) ? x.val(venv, (function (vals) {
  return retStar(foldr(cons, xs, vals));
})) :
  x(venv, (function (val) {
  return retStar(cons(val, xs));
}));
}), [], cDashEs, ret);
});
});
 })();
});

var compileDashTest = (function (test, nenv) {
  return chkDashExpectP(test) ? compileDashChkDashExpect(test, nenv) :
  chkDashWithinP(test) ? compileDashChkDashWithin(test, nenv) :
  chkDashErrorP(test) ? compileDashChkDashError(test, nenv) :
  err("cond", "all questions false");
});

var compileDashChkDashExpect = (function (test, nenv) {
  return (function () { var cDashActual = compileDashExpr(test.actual, nenv);

var cDashExpect = compileDashExpr(test.expected, nenv);

return (function (venv) {
  return (function (_) {
  return cDashActual(venv, (function (a) {
  return cDashExpect(venv, (function (e) {
  return primColonEqualP([a, e], err, identity) ? true :
  [new quote("expect"), test.sexp, a, e];
}));
}));
});
});
 })();
});

var compileDashChkDashWithin = (function (test, nenv) {
  return (function () { var cDashActual = compileDashExpr(test.actual, nenv);

var cDashExpect = compileDashExpr(test.expected, nenv);

var cDashRange = compileDashExpr(test.range, nenv);

return (function (venv) {
  return (function (_) {
  return cDashActual(venv, (function (v1) {
  return cDashExpect(venv, (function (v2) {
  return cDashRange(venv, (function (dx) {
  return primColonEqualTildeP([v1, v2, dx], err, identity) ? true :
  [new quote("within"), test.sexp, v1, v2, dx];
}));
}));
}));
});
});
 })();
});

var compileDashChkDashError = (function (test, nenv) {
  return (function () { var cDashActual = compileDashExpr(test.actual, nenv);

var cDashError = compileDashExpr(test.error, nenv);

return (function (venv) {
  return (function (_) {
  return (function () { var actual = tramp(cDashActual(venv, identity));

return cDashError(venv, (function (errmsg) {
  return stringP(errmsg) ? errP(actual) ? stringEqualSignP(errmsg, errDashGreaterThanString(actual)) ? true :
  [new quote("error"), test.sexp, errmsg, errDashGreaterThanString(actual)] :
  err(new quote("check-error"), msgDashNotDashError(actual)) :
  err(new quote("check-error"), stringDashAppend("expected a string to check against", " error message but found: ", valDashGreaterThanString(errmsg)));
}));
 })();
});
});
 })();
 
});

 
/////////////////////
/* Export Bindings */
/////////////////////
 
window.compile = compile;
window.compileSlashEnvs = compileSlashEnvs;
window.compileDashExpr = compileDashExpr;

})();