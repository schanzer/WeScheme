///////////////////////////////////////// Constructor Wrappers ////////////////////////
function makeDashDefDashFunc(name, args, body) { return new defDashFunc(name, args, body); };
function makeDashDefDashVar(name, expr) { return new defDashVar(name, expr); };
function makeDashDefDashStruct(name, fields) { return new defDashStruct(name, fields); };
function makeDashLambdaDashExpr(args, body) { return new lambdaDashExpr(args, body); };
function makeDashLocalDashExpr(defs, body) { return new localDashExpr(defs, body); };
function makeDashLetrecDashExpr(bindings, body) { return new letrecDashExpr(bindings, body); };
function makeDashLetDashExpr(bindings, body) { return new letDashExpr(bindings, body); };
function makeDashLetStarDashExpr(bindings, body) { return new letStarDashExpr(bindings, body); };
function makeDashCall(func, args) { return new call(func, args); };
function makeDashCondDashExpr(clauses) { return new condDashExpr(clauses); };
function makeDashIfDashExpr(predicate, then, els) { return new ifDashExpr(predicate, then, els); };
function makeDashAndDashExpr(exprs) { return new andDashExpr(exprs); };
function makeDashOrDashExpr(exprs) { return new orDashExpr(exprs); };
function makeDashTimeDashExpr(val) { return new timeDashExpr(val); };
function makeDashSymbolDashExpr(val) { return new symbolDashExpr(val); };
function makeDashNumberDashExpr(val) { return new numberDashExpr(val); };
function makeDashStringDashExpr(val) { return new stringDashExpr(val); };
function makeDashCharDashExpr(val) { return new charDashExpr(val); };
function makeDashListDashExpr(val) { return new listDashExpr(val); };
function makeDashMtDashListDashExpr() { return new mtDashListDashExpr(); };
function makeDashBooleanDashExpr(val) { return new booleanDashExpr(val); };
function makeDashQuotedDashExpr(val) { return new quotedDashExpr(val); };
function makeDashQuasiquotedDashExpr(val) { return new quasiquotedDashExpr(val); };
function makeDashImageDashExpr(val, width, height, x, y) { return new imageDashExpr(val, width, height, x, y); };
function makeDashQqDashList(val) { return new qqDashList(val); };
function makeDashQqDashSplice(val) { return new qqDashSplice(val); };
function makeDashCouple(first, second) { return new couple(first, second); };
function makeDashPrimop(val) { return new primop(val); };
function makeDashChkDashExpect(actual, expected, sexp) { return new chkDashExpect(actual, expected, sexp); };
function makeDashChkDashWithin(actual, expected, range, sexp) { return new chkDashWithin(actual, expected, range, sexp); };
function makeDashChkDashError(actual, error, sexp) { return new chkDashError(actual, error, sexp); };
function makeDashReq(uri) { return new req(uri); };
function makeDashProvideDashStatement(val) { return new provideDashStatement(val); };

//////////////////////////////////// INSTANCE CHECKING WRAPPERS //////////////////////////////
function defDashFuncP(x) { return x instanceof defDashFunc; };
function defDashVarP(x) { return x instanceof defDashVar; };
function defDashStructP(x) { return x instanceof defDashStruct; };
function lambdaDashExprP(x) { return x instanceof lambdaDashExpr; };
function localDashExprP(x) { return x instanceof localDashExpr; };
function letrecDashExprP(x) { return x instanceof letrecDashExpr; };
function letDashExprP(x) { return x instanceof letDashExpr; };
function letStarDashExprP(x) { return x instanceof letStarDashExpr; };
function callP(x) { return x instanceof call; };
function condDashExprP(x) { return x instanceof condDashExpr; };
function ifDashExprP(x) { return x instanceof ifDashExpr; };
function andDashExprP(x) { return x instanceof andDashExpr; };
function orDashExprP(x) { return x instanceof orDashExpr; };
function timeDashExprP(x) { return x instanceof timeDashExpr; };
function symbolDashExprP(x) { return x instanceof symbolDashExpr; };
function numberDashExprP(x) { return x instanceof numberDashExpr; };
function stringDashExprP(x) { return x instanceof stringDashExpr; };
function charDashExprP(x) { return x instanceof charDashExpr; };
function listDashExprP(x) { return x instanceof listDashExpr; };
function mtDashListDashExprP(x) { return x instanceof mtDashListDashExpr; };
function booleanDashExprP(x) { return x instanceof booleanDashExpr; };
function quotedDashExprP(x) { return x instanceof quotedDashExpr; };
function quasiquotedDashExprP(x) { return x instanceof quasiquotedDashExpr; };
function imageDashExprP(x) { return x instanceof imageDashExpr; };
function qqDashListP(x) { return x instanceof qqDashList; };
function qqDashSpliceP(x) { return x instanceof qqDashSplice; };
function coupleP(x) { return x instanceof couple; };
function primopP(x) { return x instanceof primop; };
function chkDashExpectP(x) { return x instanceof chkDashExpect; };
function chkDashWithinP(x) { return x instanceof chkDashWithin; };
function chkDashErrorP(x) { return x instanceof chkDashError; };
function reqP(x) { return x instanceof req; };
function provideDashStatementP(x) { return x instanceof provideDashStatement; };
var requireP = (function (x) { return reqP(x); });
var provideP = (function (x) { return provideDashStatementP(x); });
// a definition is a function, variable or struct
var definitionP = (function (x) {
                   return ((defDashFuncP(x)) || (defDashVarP(x)) || (defDashStructP(x)));
                   });
// an expression is a lambda, local, letrec, let, let*, call, cond, if, and, or, time, symbol, primop,
// number, string, char, list, boolean, image, quote or quasiquote
var exprP = (function (x) {
             return ((lambdaDashExprP(x)) || (localDashExprP(x)) || (letrecDashExprP(x)) || (letDashExprP(x)) || (letStarDashExprP(x)) || (callP(x)) || (condDashExprP(x)) || (ifDashExprP(x)) || (andDashExprP(x)) || (orDashExprP(x)) || (timeDashExprP(x)) || (symbolP(x)) || (primopP(x)) || (symbolDashExprP(x)) || (numberDashExprP(x)) || (stringDashExprP(x)) || (charDashExprP(x)) || (listDashExprP(x)) || (mtDashListDashExprP(x)) || (booleanDashExprP(x)) || (quotedDashExprP(x)) || (quasiquotedDashExprP(x)) || (imageDashExprP(x)));
             });
// a test case is a check-expect, check-within or check-error
var testDashCaseP = (function (x) {
                     return ((chkDashExpectP(x)) || (chkDashWithinP(x)) || (chkDashErrorP(x)));
                     });



///////////////////////////////////////// DEFINITIONS /////////////////////////////////
// Function definition
function defDashFunc(name, args, body) {
  this.name = name;
  this.args = args;
  this.body = body;
  this.toString = function(){
    return "(define ("+this.name.toString()+" "+this.args.join(" ")+")\n    "+this.body.toString()+")";
  };
};


// Variable definition
function defDashVar(name, expr) {
  this.name = name;
  this.expr = expr;
  this.toString = function(){
    return "(define "+this.name.toString()+" "+this.expr.toString()+")";
  };
};

// Structure definition
function defDashStruct(name, fields) {
  this.name = name;
  this.fields = fields;
  this.toString = function(){
    return "(define-struct "+this.name.toString()+" ("+this.fields.toString()+"))";
  };
};

var definitionDashName = (function (def) {
                          return defDashFuncP(def) ? def.name :
                          defDashVarP(def) ? def.name :
                          defDashStructP(def) ? def.name :
                          err("cond", "all questions false");
                          });

///////////////////////////////////EXPRESSIONS//////////////////////////////
// Lambda expression
function lambdaDashExpr(args, body) {
  this.args = args;
  this.body = body;
  this.toString = function(){
    return "(lambda ("+this.args.toString()+") ("+this.body.toString()+"))";
  };
};

// Local expression TODO
function localDashExpr(defs, body) {
  this.defs = defs;
  this.body = body;
  this.toString = function(){
    return "(local ("+this.defs.toString()+") ("+this.body.toString()+"))";
  };
};

// Letrec expression
function letrecDashExpr(bindings, body) {
  this.bindings = bindings;
  this.body = body;
  this.toString = function(){
    return "(letrec ("+this.bindings.toString()+") ("+this.body.toString()+"))";
  };
};

// Let expression
function letDashExpr(bindings, body) {
  this.bindings = bindings;
  this.body = body;
  this.toString = function(){
    return "(letrec ("+this.bindings.toString()+") ("+this.body.toString()+"))";
  };
};

// Let* expressions
function letStarDashExpr(bindings, body) {
  this.bindings = bindings;
  this.body = body;
  this.toString = function(){
    return "(let* ("+this.bindings.toString()+") ("+this.body.toString()+"))";
  };
};

// application expression
function call(func, args) {
  this.func = func;
  this.args = args;
  this.toString = function(){
    return "("+this.func.toString()+" "+this.args.join(" ")+")";
  };
};

// cond expression
function condDashExpr(clauses) {
  this.clauses = clauses;
  this.toString = function(){
    return "(cond\n    "+this.clauses.join("\n    ")+")";
  };
};

// if expression
function ifDashExpr(predicate, then, els) {
  this.predicate = predicate;
  this.then = then;
  this.els = els;
  this.toString = function(){
    return "(if "+this.predicate.toString()+" "+this.then.toString()+" "+this.els.toString()+")";
  };
};

// and expression
function andDashExpr(exprs) {
  this.exprs = exprs;
  this.toString = function(){ return "(and "+this.exprs.toString()+")"; };
};

// or expression
function orDashExpr(exprs) {
  this.exprs = exprs;
  this.toString = function(){ return "(or "+this.exprs.toString()+")"; };
};

// time expression TODO
function timeDashExpr(val) {
  this.val = val;
};

// symbol expression
function symbolDashExpr(val) {
  this.val = val;
  this.toString = function(){
    return this.val.toString();
  };
};

// number expression
function numberDashExpr(val) {
  this.val = val;
  this.toString = function(){ return this.val.toString(); };
};

// string expression
function stringDashExpr(val) {
  this.val = val;
  this.toString = function(){ return "\""+this.val.toString()+"\""; };
};

// char expression
function charDashExpr(val) {
  this.val = val;
  this.toString = function(){ return "#\\"+this.val.toString(); };
};

// list expression TODO
function listDashExpr(val) {
  this.val = val;
  this.toString = function(){ return "(list "+this.val.toString() + ")"; };
};

// mtList expression TODO
function mtDashListDashExpr() {};

// boolean expression
function booleanDashExpr(val) {
  this.val = val;
  this.toString = function(){
    return this.val? "#t" : "#f";
  };
};

// quoted expression TODO
function quotedDashExpr(val) {
  this.val = val;
  this.toString = function(){
    return "'"+this.val.toString();
  };
};

// quasiquoted expression TODO
function quasiquotedDashExpr(val) {
  this.val = val;
  this.toString = function(){
    return "`"+this.val.toString();
  };
};

// image expression
function imageDashExpr(val, width, height, x, y) {
  this.val = val;
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.toString = function(){
    return "["+this.width+"x"+this.height+"image]";
  };
};

// quasiquoted list expression TODO
function qqDashList(val) {
  this.val = val;
  this.toString = function(){
    return "`"+this.val.toString();
  };
};
function qqDashSplice(val) {
  this.val = val;
};

var letSlashStarSlashRecDashBindings = (function (x) {
                                        return letrecDashExprP(x) ? letrecDashExprDashBindings(x) :
                                        letDashExprP(x) ? x.bindings:
                                        letStarDashExprP(x) ? x.bindings :
                                        err("cond", "all questions false");
                                        });

var letSlashStarSlashRecDashBody = (function (x) {
                                    return letrecDashExprP(x) ? x.body :
                                    letDashExprP(x) ? x.body :
                                    letStarDashExprP(x) ? x.body :
                                    err("cond", "all questions false");
                                    });
// couples...used for cond branches??
function couple(first, second) {
  this.first = first;
  this.second = second;
  this.toString = function(){
    return "["+this.first.toString() +" "+this.second.toString()+"]";
  };
};
function coupleDashFirst(x) { return x.first; };
function coupleDashSecond(x) { return x.second; };

// primop expression
function primop(val) {
  this.val = val;
  this.toString = function(){
    return this.val.toString();
  };
};
////////////////////// CHECK-EXPECTS ////////////////////////
// check-expect TODO
function chkDashExpect(actual, expected, sexp) {
  this.actual = actual;
  this.expected = expected;
  this.sexp = sexp;
  this.toString = function(){
    return "(check-expect "+this.sexp.toString() +" "+this.expected+")";
  };
};

// check-within TODO
function chkDashWithin(actual, expected, range, sexp) {
  this.actual = actual;
  this.expected = expected;
  this.range = range;
  this.sexp = sexp;
  this.toString = function(){
    return "(check-within "+this.sexp.toString() +" "+this.expected+")";
  };
};

// check-error
function chkDashError(actual, error, sexp) {
  this.actual = actual;
  this.error = error;
  this.sexp = sexp;
  this.toString = function(){
    return "(check-error "+this.sexp.toString() +" "+this.error+")";
  };
};


///////////////////////////////// REQUIRE ///////////////////////////
// require-url
function req(uri) {
  this.uri = uri;
};
function reqDashUri(x) {
  return x.uri;
  this.toString = function(){
    return "(require-url "+this.uri+")";
  };
};

var requireDashFileP = (function (x) {
                        return ((reqP(x)) && (stringP(reqDashUri(x))));
                        });

var isDashSymbolDashPred = (function (x) {
                            return (function (y) {
                                    return ((symbolP(y)) && (symbolEqualSignP(y, x)));
                                    });
                            });

var requireDashTypeP = (function (x, type) {
                        return ((reqP(x)) && (consP(reqDashUri(x))) && (isDashSymbolDashPred(type)(first(reqDashUri(x)))));
                        });

// lib TODO
var requireDashLibP = (function (x) {
                       return requireDashTypeP(x, new quote("lib"));
                       });
// planet TODO
var requireDashPlanetP = (function (x) {
                          return requireDashTypeP(x, new quote("planet"));
                          });

////////////////////////////////// PROVIDE /////////////////////////////
function provideDashStatement(val) {
  this.val = val;
  this.toString = function(){
    return "(provide "+this.val+")"
  };
};


///////////////////////////////// PARSER OBJECT //////////////////////////

(function () {

// parse : sexp -> AST?
var parse = (function (sexp) {
  return emptyP(sexp) ? [] :
  not(consP(sexp)) ? error(new quote("parse"), "The sexp is not a list of definitions or expressions: ", sexpDashGreaterThanString(sexp)) :
  parseStar(sexp);
});

// parse* : sexp list -> AST?
var parseStar = (function (sexp) {
  return map((function (x) {
  return parseDashDefDashExprDashTestDashLib(x);
}), sexp);
});

// parse-def-expr-test-lib : sexp -> AST?
var parseDashDefDashExprDashTestDashLib = (function (sexp) {
  return symDashDefinitionP(sexp) ? parseDashDefinition(sexp) :
  symDashExprP(sexp) ? parseDashExpr(sexp) :
  symDashTestDashCaseP(sexp) ? parseDashTestDashCase(sexp) :
  symDashRequireP(sexp) ? parseDashRequire(sexp) :
  symDashProvideP(sexp) ? parseDashProvide(sexp) :
  error(new quote("parse"), "Not a Definition, Expression, Test Case, Library Require, or Provide");
});

var symDashDefinitionP = (function (sexp) {
  return ((structureDashDefinitionP(sexp)) || (functionDashDefinitionP(sexp)) || (variableDashDefinitionP(sexp)));
});

var structureDashDefinitionP = (function (sexp) {
  return ((consP(sexp)) && (EqualSign(length(sexp), 3)) && (symbolP(first(sexp))) && (symbolEqualSignP(new quote("define-struct"), first(sexp))));
});

var functionDashDefinitionP = (function (sexp) {
  return ((consP(sexp)) && (EqualSign(length(sexp), 3)) && (symbolP(first(sexp))) && (symbolEqualSignP(new quote("define"), first(sexp))) && (consP(second(sexp))));
});

var variableDashDefinitionP = (function (sexp) {
  return ((consP(sexp)) && (EqualSign(length(sexp), 3)) && (symbolP(first(sexp))) && (symbolEqualSignP(new quote("define"), first(sexp))) && (not(consP(second(sexp)))));
});

var parseDashDefinition = (function (sexp) {
  return structureDashDefinitionP(sexp) ? parseDashDefDashStruct(sexp) :
  functionDashDefinitionP(sexp) ? parseDashDefDashFunc(sexp) :
  variableDashDefinitionP(sexp) ? parseDashDef(sexp) :
  error(new quote("parse-definition"), stringDashAppend("Expected to find a definition, but found: ", sexpDashGreaterThanString(sexp)));
});

var parseDashDefDashStruct = (function (sexp) {
  return makeDashDefDashStruct(parseDashIdDashExpr(second(sexp)), map(parseDashIdDashExpr, third(sexp)));
});

var parseDashDefDashFunc = (function (sexp) {
  return GreaterThan(length(rest(second(sexp))), 0) ? makeDashDefDashFunc(parseDashIdDashExpr(first(second(sexp))), map(parseDashIdDashExpr, rest(second(sexp))), parseDashExpr(third(sexp))) :
  error(new quote("parse-def-func"), stringDashAppend("expected at least one argument name after the", " function name, but found none."));
});

var parseDashDef = (function (sexp) {
  return makeDashDefDashVar(parseDashIdDashExpr(second(sexp)), parseDashExpr(third(sexp)));
});

var symDashExprP = (function (sexp) {
  return ((not(symDashDefinitionP(sexp))) && (not(symDashTestDashCaseP(sexp))) && (not(symDashRequireP(sexp))) && (not(symDashProvideP(sexp))));
});

var parseDashExpr = (function (sexp) {
  return consP(sexp) ? parseDashExprDashList(sexp) :
  parseDashExprDashSingleton(sexp);
});

var parseDashExprDashList = (function (sexp) {
  return (function () { var peek = first(sexp);

return not(symbolP(peek)) ? parseDashFuncDashCall(sexp) :
  symbolEqualSignP(new quote("lambda"), peek) ? parseDashLambdaDashExpr(sexp) :
  symbolEqualSignP(new quote("local"), peek) ? parseDashLocalDashExpr(sexp) :
  symbolEqualSignP(new quote("letrec"), peek) ? parseDashLetrecDashExpr(sexp) :
  symbolEqualSignP(new quote("let"), peek) ? parseDashLetDashExpr(sexp) :
  symbolEqualSignP(new quote("let*"), peek) ? parseDashLetStarDashExpr(sexp) :
  symbolEqualSignP(new quote("cond"), peek) ? parseDashCondDashExpr(sexp) :
  symbolEqualSignP(new quote("if"), peek) ? parseDashIfDashExpr(sexp) :
  symbolEqualSignP(new quote("and"), peek) ? parseDashAndDashExpr(sexp) :
  symbolEqualSignP(new quote("or"), peek) ? parseDashOrDashExpr(sexp) :
  symbolEqualSignP(new quote("time"), peek) ? parseDashTimeDashExpr(sexp) :
  symbolEqualSignP(new quote("quote"), peek) ? parseDashQuotedDashExpr(second(sexp)) :
  symbolEqualSignP(new quote("quasiquote"), peek) ? parseDashQuasiDashQuotedDashExpr(second(sexp), false) :
  parseDashFuncDashCall(sexp);
 })();
});

var parseDashLambdaDashExpr = (function (sexp) {
  return sexpDashIsDashLambdaP(sexp) ? GreaterThan(length(second(sexp)), -1) ? makeDashLambdaDashExpr(map(parseDashIdDashExpr, second(sexp)), parseDashExpr(third(sexp))) :
  error(new quote("parse-lambda-expr"), stringDashAppend("expected at least one argument name in the ", "sequence after `lambda', but found none")) :
  expectedDashError(new quote("parse-lambda-expt"), "lambda function sexp", sexp);
});

var parseDashLocalDashExpr = (function (sexp) {
  return sexpDashIsDashLocalP(sexp) ? makeDashLocalDashExpr(map(parseDashDefinition, second(sexp)), parseDashExpr(third(sexp))) :
  expectedDashError(new quote("parse-local-expr"), "local expression sexp", sexp);
});

var parseDashLetrecDashExpr = (function (sexp) {
  return sexpDashIsDashLetrecP(sexp) ? makeDashLetrecDashExpr(map(parseDashLetDashCouple, second(sexp)), parseDashExpr(third(sexp))) :
  expectedDashError(new quote("parse-letrec-expr"), "letrec expression sexp", sexp);
});

var parseDashLetDashExpr = (function (sexp) {
  return sexpDashIsDashLetP(sexp) ? makeDashLetDashExpr(map(parseDashLetDashCouple, second(sexp)), parseDashExpr(third(sexp))) :
  expectedDashError(new quote("parse-let-expr"), "let expression sexp", sexp);
});

var parseDashLetStarDashExpr = (function (sexp) {
  return sexpDashIsDashLetStarP(sexp) ? makeDashLetStarDashExpr(map(parseDashLetDashCouple, second(sexp)), parseDashExpr(third(sexp))) :
  expectedDashError(new quote("parse-let*-expr"), "let* expression sexp", sexp);
});

var parseDashFuncDashCall = (function (sexp) {
  return consP(sexp) ? makeDashCall(parseDashExpr(first(sexp)), map(parseDashExpr, rest(sexp))) :
  expectedDashError(new quote("parse-func-call"), "function call sexp", sexp);
});

var parseDashCondDashExpr = (function (sexp) {
  return sexpDashIsDashCondDashListP(sexp) ? makeDashCondDashExpr(foldr((function (couple, rst) {
  return ((symbolP(first(couple))) && (symbolEqualSignP(first(couple), new quote("else"))) && (not(emptyP(rst)))) ? error(new quote("parse-cond-expr"), stringDashAppend("found an `else' clause", " that isn't the last", " clause in its `cond'", " expression")) :
  cons(parseDashCondDashCouple(couple), rst);
}), [], rest(sexp))) :
  expectedDashError(new quote("parse-cond-expr"), "cond expression sexp", sexp);
});

var parseDashCondDashCouple = (function (sexp) {
  return sexpDashIsDashCoupleP(sexp) ? makeDashCouple(parseDashExpr(first(sexp)), parseDashExpr(second(sexp))) :
  expectedDashError(new quote("parse-cond-couple"), "couple of expressions sexp", sexp);
});

var parseDashLetDashCouple = (function (sexp) {
  return sexpDashIsDashCoupleP(sexp) ? makeDashCouple(parseDashIdDashExpr(first(sexp)), parseDashExpr(second(sexp))) :
  expectedDashError(new quote("parse-let-couple"), "couple of an id and an expression sexp", sexp);
});

var parseDashIfDashExpr = (function (sexp) {
  return sexpDashIsDashIfDashExprP(sexp) ? makeDashIfDashExpr(parseDashExpr(second(sexp)), parseDashExpr(third(sexp)), parseDashExpr(fourth(sexp))) :
  expectedDashError(new quote("parse-if-expr"), "if expression sexp", sexp);
});

var parseDashAndDashExpr = (function (sexp) {
  return sexpDashIsDashAndDashExprP(sexp) ? makeDashAndDashExpr(map(parseDashExpr, rest(sexp))) :
  expectedDashError(new quote("parse-and-expr"), "and expression sexp", sexp);
});

var parseDashOrDashExpr = (function (sexp) {
  return sexpDashIsDashOrDashExprP(sexp) ? makeDashOrDashExpr(map(parseDashExpr, rest(sexp))) :
  expectedDashError(new quote("parse-or-expr"), "or expression sexp", sexp);
});

var parseDashTimeDashExpr = (function (sexp) {
  return sexpDashIsDashTimeDashExprP(sexp) ? makeDashTimeDashExpr(parseDashExpr(second(sexp))) :
  expectedDashError(new quote("parse-time-expr"), "time expression sexp", sexp);
});

var parseDashQuotedDashExpr = (function (sexp) {
  return emptyP(sexp) ? makeDashCall(makeDashPrimop(new quote("list")), []) :
  consP(sexp) ? makeDashCall(makeDashPrimop(new quote("list")), map(parseDashQuotedDashExpr, sexp)) :
  numberP(sexp) ? makeDashNumberDashExpr(sexp) :
  stringP(sexp) ? makeDashStringDashExpr(sexp) :
  charP(sexp) ? makeDashCharDashExpr(string(sexp)) :
  symbolP(sexp) ? makeDashSymbolDashExpr(sexp) :
  expectedDashError(new quote("parse-quoted-expr"), "quoted sexp", sexp);
});

var parseDashQuasiDashQuotedDashExpr = (function (sexp, inlist) {
  return emptyP(sexp) ? makeDashQqDashList([]) :
  consP(sexp) ? parseDashQqDashList(sexp, inlist) :
  numberP(sexp) ? makeDashNumberDashExpr(sexp) :
  stringP(sexp) ? makeDashStringDashExpr(sexp) :
  charP(sexp) ? makeDashCharDashExpr(string(sexp)) :
  symbolP(sexp) ? makeDashSymbolDashExpr(sexp) :
  expectedDashError(new quote("parse-quoted-expr"), "quoted sexp", sexp);
});

var parseDashQqDashList = (function (sexp, inlist) {
  return symbolP(first(sexp)) ? symbolEqualSignP(first(sexp), new quote("unquote")) ? parseDashExpr(second(sexp)) :
  symbolEqualSignP(first(sexp), new quote("unquote-splicing")) ? inlist ? makeDashQqDashSplice(parseDashExpr(second(sexp))) :
  error(new quote("unquote-splicing"), "misuse of ,@ or `unquote-splicing' within a quasiquoting backquote") :
  makeDashQqDashList(map((function (x) {
  return parseDashQuasiDashQuotedDashExpr(x, true);
}), sexp)) :
  makeDashQqDashList(map((function (x) {
  return parseDashQuasiDashQuotedDashExpr(x, true);
}), sexp));
});

var parseDashExprDashSingleton = (function (sexp) {
  return stringP(sexp) ? makeDashStringDashExpr(sexp) :
  charP(sexp) ? makeDashCharDashExpr(string(sexp)) :
  numberP(sexp) ? makeDashNumberDashExpr(sexp) :
  symbolP(sexp) ? sexpDashIsDashPrimopP(sexp) ? makeDashPrimop(sexp) :
  symbolEqualSignP(new quote("empty"), sexp) ? makeDashCall(makeDashPrimop(new quote("list")), []) :
  ((symbolEqualSignP(new quote("true"), sexp)) || (symbolEqualSignP(new quote("false"), sexp))) ? makeDashBooleanDashExpr(sexp) :
  sexp :
  imageP(sexp) ? parseDashImage(sexp) :
  error(new quote("parse-expr-singleton"), stringDashAppend("SExp, ", sexpDashGreaterThanString(sexp), ", does not represent any atomic Scheme expression"));
});

var parseDashImage = (function (img) {
  return makeDashImageDashExpr(encodeDashImage(img), imageDashWidth(img), imageDashHeight(img), pinholeDashX(img), pinholeDashY(img));
});

var parseDashIdDashExpr = (function (sexp) {
  return sexpDashIsDashIdP(sexp) ? sexp :
  expectedDashError(new quote("parse-id-expr"), "ID", sexp);
});

var tupleSlashFirstP = (function (sexp, symbol, n) {
  return ((consP(sexp)) && (EqualSign(length(sexp), n)) && (symbolP(first(sexp))) && (symbolEqualSignP(first(sexp), symbol)));
});

var tuple3SlashFirstP = (function (sexp, symbol) {
  return tupleSlashFirstP(sexp, symbol, 3);
});

var tuple4SlashFirstP = (function (sexp, symbol) {
  return tupleSlashFirstP(sexp, symbol, 4);
});

var sexpDashIsDashLambdaP = (function (sexp) {
  return tuple3SlashFirstP(sexp, new quote("lambda"));
});

var sexpDashIsDashLocalP = (function (sexp) {
  return tuple3SlashFirstP(sexp, new quote("local"));
});

var sexpDashIsDashCoupleP = (function (sexp) {
  return ((consP(sexp)) && (EqualSign(length(sexp), 2)));
});

var sexpDashIsDashLetrecP = (function (sexp) {
  return tuple3SlashFirstP(sexp, new quote("letrec"));
});

var sexpDashIsDashLetP = (function (sexp) {
  return tuple3SlashFirstP(sexp, new quote("let"));
});

var sexpDashIsDashLetStarP = (function (sexp) {
  return tuple3SlashFirstP(sexp, new quote("let*"));
});

var sexpDashIsDashIfDashExprP = (function (sexp) {
  return tuple4SlashFirstP(sexp, new quote("if"));
});

var sexpDashIsDashAndDashExprP = (function (sexp) {
  return ((consP(sexp)) && (symbolP(first(sexp))) && (symbolEqualSignP(first(sexp), new quote("and"))));
});

var sexpDashIsDashOrDashExprP = (function (sexp) {
  return ((consP(sexp)) && (symbolP(first(sexp))) && (symbolEqualSignP(first(sexp), new quote("or"))));
});

var sexpDashIsDashTimeDashExprP = (function (sexp) {
  return tupleSlashFirstP(sexp, new quote("time"), 2);
});

var sexpDashIsDashPrimopP = (function (sexp) {
  return ((symbolP(sexp)) && (ormap((function (op) {
  return symbolEqualSignP(sexp, primDashName(op));
}), primDashTable)));
});

var sexpDashIsDashCondDashListP = (function (sexp) {
  return ((consP(sexp)) && (GreaterThanEqualSign(length(sexp), 2)) && (symbolP(first(sexp))) && (symbolEqualSignP(first(sexp), new quote("cond"))));
});

var sexpDashIsDashIdP = (function (sexp) {
  return symbolP(sexp);
});

var symDashTestDashCaseP = (function (sexp) {
  return ((consP(sexp)) && (symbolP(first(sexp))) && (((symbolEqualSignP(first(sexp), new quote("check-expect"))) || (symbolEqualSignP(first(sexp), new quote("check-within"))) || (symbolEqualSignP(first(sexp), new quote("check-error"))))));
});

var symDashCheckDashExpectP = (function (sexp) {
  return tuple3SlashFirstP(sexp, new quote("check-expect"));
});

var checkDashErrorP = (function (sexp) {
  return tuple3SlashFirstP(sexp, new quote("check-error"));
});

var checkDashWithinP = (function (sexp) {
  return tuple4SlashFirstP(sexp, new quote("check-within"));
});

var parseDashTestDashCase = (function (sexp) {
  return consP(sexp) ? symbolEqualSignP(first(sexp), new quote("check-expect")) ? parseDashCheckDashExpect(sexp) :
  symbolEqualSignP(first(sexp), new quote("check-error")) ? parseDashCheckDashError(sexp) :
  symbolEqualSignP(first(sexp), new quote("check-within")) ? parseDashCheckDashWithin(sexp) :
  error(new quote("parse-test-case"), stringDashAppend("Expected a test case but instead found: ", sexpDashGreaterThanString(sexp))) :
  expectedDashError(new quote("parse-test-case"), "test-case sexp", sexp);
});

var parseDashCheckDashExpect = (function (sexp) {
  return symDashCheckDashExpectP(sexp) ? makeDashChkDashExpect(parseDashExpr(second(sexp)), parseDashExpr(third(sexp)), sexp) :
  expectedDashError(new quote("parse-check-expect"), "check expect sexp", sexp);
});

var parseDashCheckDashError = (function (sexp) {
  return checkDashErrorP(sexp) ? makeDashChkDashError(parseDashExpr(second(sexp)), parseDashExpr(third(sexp)), sexp) :
  expectedDashError(new quote("parse-check-error"), "check error sexp", sexp);
});

var parseDashCheckDashWithin = (function (sexp) {
  return checkDashWithinP(sexp) ? makeDashChkDashWithin(parseDashExpr(second(sexp)), parseDashExpr(third(sexp)), parseDashExpr(fourth(sexp)), sexp) :
  expectedDashError(new quote("parse-check-within"), "check within sexp", sexp);
});

var symDashRequireP = (function (sexp) {
  return ((consP(sexp)) && ((function () { var fst = first(sexp);

return ((symbolP(fst)) && (symbolEqualSignP(fst, new quote("require"))));
 })()));
});

var parseDashRequire = (function (sexp) {
  return (function () { var uri = second(sexp);

return ((stringP(uri)) || (symbolP(uri))) ? makeDashReq(uri) :
  symbolEqualSignP(first(uri), new quote("lib")) ? makeDashReq(uri) :
  parseDashRequireDashPlanet(uri);
 })();
});

var parseDashRequireDashPlanet = (function (uri) {
  return makeDashReq(cons(new quote("planet"), cons(second(uri), [rest(third(uri))])));
});

var symDashProvideP = (function (sexp) {
  return ((consP(sexp)) && (symbolP(first(sexp))) && (symbolEqualSignP(first(sexp), new quote("provide"))));
});

var parseDashProvide = (function (sexp) {
  return makeDashProvideDashStatement(symbolP(second(sexp)) ? rest(sexp) :
  new quote("all-defined-out"));
});

var sexpDashGreaterThanString = (function (sexp) {
  return format("~a", sexp);
});

var expectedDashError = (function (id, expected, actual) {
  return error(id, stringDashAppend("Expected a ", expected, " but found: ", sexpDashGreaterThanString(actual)));
});

/////////////////////
/* Export Bindings */
/////////////////////

window.parse = parse;

})();