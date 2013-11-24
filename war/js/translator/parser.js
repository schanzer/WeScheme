////////////////////////////////////// ERROR MESSAGES ////////////////

// the location struct
var Location = function(sCol, sLine, offset, span, source){
  this.sCol   = sCol;   // starting index into the line
  this.sLine  = sLine;  // starting line # (1-index)
  this.offset = offset; // ch index of lexeme start, from beginning
  this.span   = span;   // num chrs between lexeme start and end
  this.source = source; // [OPTIONAL] id of the containing DOM element
  this.toString = function(){
    return "start ("+this.sCol+", "+this.sLine+"), end ("+this.eCol+","+this.eLine+") index "+this.i;
  };
}
// the constant struct
var Constant = function(val, loc){
  this.val = val;
  this.location = loc;
  this.toString = function(){return this.val.toString();};
}

///////////////////////////////////////// Constructor Wrappers ////////////////////////
function makeDefFunc(name, args, body) { return new defFunc(name, args, body); };
function makeDefVar(name, expr) { return new defVar(name, expr); };
function makeDefStruct(name, fields) { return new defStruct(name, fields); };
function makeLambdaExpr(args, body) { return new lambdaExpr(args, body); };
function makeLocalExpr(defs, body) { return new localExpr(defs, body); };
function makeLetrecExpr(bindings, body) { return new letrecExpr(bindings, body); };
function makeLetExpr(bindings, body) { return new letExpr(bindings, body); };
function makeLetStarExpr(bindings, body) { return new letStarExpr(bindings, body); };
function makeCall(func, args) { return new call(func, args); };
function makeCondExpr(clauses) { return new condExpr(clauses); };
function makeIfExpr(predicate, then, els) { return new ifExpr(predicate, then, els); };
function makeAndExpr(exprs) { return new andExpr(exprs); };
function makeOrExpr(exprs) { return new orExpr(exprs); };
function makeTimeExpr(val) { return new timeExpr(val); };
function makeSymbolExpr(val) { return new symbolExpr(val); };
function makeNumberExpr(val) { return new numberExpr(val); };
function makeStringExpr(val) { return new stringExpr(val); };
function makeCharExpr(val) { return new charExpr(val); };
function makeListExpr(val) { return new listExpr(val); };
function makeMtListExpr() { return new mtListExpr(); };
function makeBooleanExpr(val) { return new booleanExpr(val); };
function makeQuotedExpr(val) { return types.symboldExpr(val); };
function makeQuasiquotedExpr(val) { return new quasiquotedExpr(val); };
function makeImageExpr(val, width, height, x, y) { return new imageExpr(val, width, height, x, y); };
function makeQqList(val) { return new qqList(val); };
function makeQqSplice(val) { return new qqSplice(val); };
function makeCouple(first, second) { return new couple(first, second); };
//function makePrimop(sym) { return primitive.getPrimitive(sym); };
function makePrimop(sym) { return new primop(sym.val); };
function makeChkExpect(actual, expected, sexp) { return new chkExpect(actual, expected, sexp); };
function makeChkWithin(actual, expected, range, sexp) { return new chkWithin(actual, expected, range, sexp); };
function makeChkError(actual, error, sexp) { return new chkError(actual, error, sexp); };
function makeReq(uri) { return new req(uri); };
function makeProvideStatement(val) { return new provideStatement(val); };

//////////////////////////////////// INSTANCE CHECKING WRAPPERS //////////////////////////////
function defFuncP(x) { return x instanceof defFunc; };
function defVarP(x) { return x instanceof defVar; };
function defStructP(x) { return x instanceof defStruct; };
function lambdaExprP(x) { return x instanceof lambdaExpr; };
function localExprP(x) { return x instanceof localExpr; };
function letrecExprP(x) { return x instanceof letrecExpr; };
function letExprP(x) { return x instanceof letExpr; };
function letStarExprP(x) { return x instanceof letStarExpr; };
function callP(x) { return x instanceof call; };
function condExprP(x) { return x instanceof condExpr; };
function ifExprP(x) { return x instanceof ifExpr; };
function andExprP(x) { return x instanceof andExpr; };
function orExprP(x) { return x instanceof orExpr; };
function timeExprP(x) { return x instanceof timeExpr; };
function symbolExprP(x) { return x instanceof symbolExpr; };
function numberExprP(x) { return x instanceof numberExpr; };
function stringExprP(x) { return x instanceof stringExpr; };
function charExprP(x) { return x instanceof charExpr; };
function listExprP(x) { return x instanceof listExpr; };
function mtListExprP(x) { return x instanceof mtListExpr; };
function booleanExprP(x) { return x instanceof booleanExpr; };
function quotedExprP(x) { return x instanceof quotedExpr; };
function quasiquotedExprP(x) { return x instanceof quasiquotedExpr; };
function imageExprP(x) { return x instanceof imageExpr; };
function qqListP(x) { return x instanceof qqList; };
function qqSpliceP(x) { return x instanceof qqSplice; };
function coupleP(x) { return x instanceof couple; };
function primopP(x) { return x instanceof primop; };
function chkExpectP(x) { return x instanceof chkExpect; };
function chkWithinP(x) { return x instanceof chkWithin; };
function chkErrorP(x) { return x instanceof chkError; };
function reqP(x) { return x instanceof req; };
function provideStatementP(x) { return x instanceof provideStatement; };
var requireP = reqP
var provideP = provideStatementP;
// a definition is a function, variable or struct
var definitionP = function (x) {
                   return ((defFuncP(x)) || (defVarP(x)) || (defStructP(x)));
                   };
// an expression is a lambda, local, letrec, let, let*, call, cond, if, and, or, time, symbol, primop,
// number, string, char, list, boolean, image, quote or quasiquote
var exprP = function (x) {
             return ((lambdaExprP(x)) || (localExprP(x)) || (letrecExprP(x)) || (letExprP(x)) || (letStarExprP(x)) || (callP(x)) || (condExprP(x)) || (ifExprP(x)) || (andExprP(x)) || (orExprP(x)) || (timeExprP(x)) || (symbolP(x)) || (primopP(x)) || (symbolExprP(x)) || (numberExprP(x)) || (stringExprP(x)) || (charExprP(x)) || (listExprP(x)) || (mtListExprP(x)) || (booleanExprP(x)) || (quotedExprP(x)) || (quasiquotedExprP(x)) || (imageExprP(x)));
             };
// a test case is a check-expect, check-within or check-error
var testCaseP = function (x) {
                     return ((chkExpectP(x)) || (chkWithinP(x)) || (chkErrorP(x)));
                     };



///////////////////////////////////////// DEFINITIONS /////////////////////////////////
// Function definition
function defFunc(name, args, body) {
  this.name = name;
  this.args = args;
  this.body = body;
  this.toString = function(){
    return "(define ("+this.name.toString()+" "+this.args.join(" ")+")\n    "+this.body.toString()+")";
  };
};


// Variable definition
function defVar(name, expr) {
  this.name = name;
  this.expr = expr;
  this.toString = function(){
    return "(define "+this.name.toString()+" "+this.expr.toString()+")";
  };
};

// Structure definition
function defStruct(name, fields) {
  this.name = name;
  this.fields = fields;
  this.toString = function(){
    return "(define-struct "+this.name.toString()+" ("+this.fields.toString()+"))";
  };
};

var definitionName = (function (def) {
                          return defFuncP(def) ? def.name :
                          defVarP(def) ? def.name :
                          defStructP(def) ? def.name :
                          err("cond", "all questions false");
                          });

///////////////////////////////////EXPRESSIONS//////////////////////////////
// Lambda expression
function lambdaExpr(args, body) {
  this.args = args;
  this.body = body;
  this.toString = function(){
    return "(lambda ("+this.args.toString()+") ("+this.body.toString()+"))";
  };
};

// Local expression TODO
function localExpr(defs, body) {
  this.defs = defs;
  this.body = body;
  this.toString = function(){
    return "(local ("+this.defs.toString()+") ("+this.body.toString()+"))";
  };
};

// Letrec expression
function letrecExpr(bindings, body) {
  this.bindings = bindings;
  this.body = body;
  this.toString = function(){
    return "(letrec ("+this.bindings.toString()+") ("+this.body.toString()+"))";
  };
};

// Let expression
function letExpr(bindings, body) {
  this.bindings = bindings;
  this.body = body;
  this.toString = function(){
    return "(letrec ("+this.bindings.toString()+") ("+this.body.toString()+"))";
  };
};

// Let* expressions
function letStarExpr(bindings, body) {
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
function condExpr(clauses) {
  this.clauses = clauses;
  this.toString = function(){
    return "(cond\n    "+this.clauses.join("\n    ")+")";
  };
};

// if expression
function ifExpr(predicate, then, els) {
  this.predicate = predicate;
  this.then = then;
  this.els = els;
  this.toString = function(){
    return "(if "+this.predicate.toString()+" "+this.then.toString()+" "+this.els.toString()+")";
  };
};

// and expression
function andExpr(exprs) {
  this.exprs = exprs;
  this.toString = function(){ return "(and "+this.exprs.toString()+")"; };
};

// or expression
function orExpr(exprs) {
  this.exprs = exprs;
  this.toString = function(){ return "(or "+this.exprs.toString()+")"; };
};

// time expression TODO
function timeExpr(val) {
  this.val = val;
};

// symbol expression
function symbolExpr(val) {
  this.val = val;
  this.toString = function(){
    return this.val.toString();
  };
};

// number expression
function numberExpr(val) {
  this.val = val;
  this.toString = function(){ return this.val.toString(); };
};

// string expression
function stringExpr(val) {
  this.val = val;
  this.toString = function(){ return "\""+this.val.toString()+"\""; };
};

// char expression
function charExpr(val) {
  this.val = val;
  this.toString = function(){ return "#\\"+this.val.toString(); };
};

// list expression TODO
function listExpr(val) {
  this.val = val;
  this.toString = function(){ return "(list "+this.val.toString() + ")"; };
};

// mtList expression TODO
function mtListExpr() {};

// boolean expression
function booleanExpr(val) {
  this.val = val;
  this.toString = function(){
    return this.val? "#t" : "#f";
  };
};

// quoted expression TODO
function quotedExpr(val) {
  this.val = val;
  this.toString = function(){
    return "'"+this.val.toString();
  };
};

// quasiquoted expression TODO
function quasiquotedExpr(val) {
  this.val = val;
  this.toString = function(){
    return "`"+this.val.toString();
  };
};

// image expression
function imageExpr(val, width, height, x, y) {
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
function qqList(val) {
  this.val = val;
  this.toString = function(){
    return "`"+this.val.toString();
  };
};
function qqSplice(val) {
  this.val = val;
};

var letSlashStarSlashRecBindings = (function (x) {
                                        return letrecExprP(x) ? letrecExprBindings(x) :
                                        letExprP(x) ? x.bindings:
                                        letStarExprP(x) ? x.bindings :
                                        err("cond", "all questions false");
                                        });

var letSlashStarSlashRecBody = (function (x) {
                                    return letrecExprP(x) ? x.body :
                                    letExprP(x) ? x.body :
                                    letStarExprP(x) ? x.body :
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
function coupleFirst(x) { return x.first; };
function coupleSecond(x) { return x.second; };

// primop expression
function primop(val) {
  this.val = val;
  this.toString = function(){
    return this.val.toString();
  };
};
////////////////////// CHECK-EXPECTS ////////////////////////
// check-expect TODO
function chkExpect(actual, expected, sexp) {
  this.actual = actual;
  this.expected = expected;
  this.sexp = sexp;
  this.toString = function(){
    return "(check-expect "+this.sexp.toString() +" "+this.expected+")";
  };
};

// check-within TODO
function chkWithin(actual, expected, range, sexp) {
  this.actual = actual;
  this.expected = expected;
  this.range = range;
  this.sexp = sexp;
  this.toString = function(){
    return "(check-within "+this.sexp.toString() +" "+this.expected+")";
  };
};

// check-error
function chkError(actual, error, sexp) {
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
  this.toString = function(){ return "(require "+this.uri+")"; };
};
function reqUri(x) {
  return x.uri;
};

var requireFileP = (function (x) {
                        return ((reqP(x)) && (stringP(reqUri(x))));
                        });

var isSymbolPred = (function (x) {
                            return (function (y) {
                                    return ((symbolP(y)) && (symbolEqualSignP(y, x)));
                                    });
                            });

var requireTypeP = (function (x, type) {
                        return ((reqP(x)) && (consP(reqUri(x))) && (isSymbolPred(type)(first(reqUri(x)))));
                        });

// lib TODO
var requireLibP = (function (x) {
                       return requireTypeP(x, types.symbol("lib"));
                       });
// planet TODO
var requirePlanetP = (function (x) {
                          return requireTypeP(x, types.symbol("planet"));
                          });

////////////////////////////////// PROVIDE /////////////////////////////
function provideStatement(val) {
  this.val = val;
  this.toString = function(){
    return "(provide "+this.val+")"
  };
};

//////////////////////////////////////////////////////////////////////////////
///////////////////////////////// PARSER OBJECT //////////////////////////////
//////////////////////////////////////////////////////////////////////////////
(function () {

// parse : sexp -> AST
var parse = (function (sexp) {
  return emptyP(sexp) ? [] :
  not(consP(sexp)) ? error(types.symbol("parse"), "The sexp is not a list of definitions or expressions: ", sexpGreaterThanString(sexp)) :
  parseStar(sexp);
});

// parse* : sexp list -> AST
var parseStar = function (sexps) {
 var parseSExp = function (sexp) {
   return isDefinition(sexp) ? parseDefinition(sexp) :
   isExpr(sexp) ? parseExpr(sexp) :
   symTestCaseP(sexp) ? parseTestCase(sexp) :
   symRequireP(sexp) ? parseRequire(sexp) :
   symProvideP(sexp) ? parseProvide(sexp) :
   error(types.symbol("parse"), "Not a Definition, Expression, Test Case, Library Require, or Provide");
 };
  return map(parseSExp, sexps);
};


//////////////////////////////////////// DEFINITION PARSING ////////////////////////////////
var isDefinition = function (sexp) {
  return ((isStructDefinition(sexp)) || (isFunctionDefinition(sexp)) || (isVariableDefinition(sexp)));
};

// if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define-struct'
var isStructDefinition = function (sexp) {
  return ((consP(sexp))
          && (EqualSign(length(sexp), 3))
          && (symbolP(first(sexp)))
          && (symbolEqualSignP(types.symbol("define-struct"), first(sexp))));
};

// if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define' and rest is a Cons
var isFunctionDefinition = function (sexp) {
  return ((consP(sexp))
          && (EqualSign(length(sexp), 3))
          && (symbolP(first(sexp)))
          && (symbolEqualSignP(types.symbol("define"), first(sexp)))
          && (consP(second(sexp))));
};

// if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define' and rest is NOT a Cons
var isVariableDefinition = function (sexp) {
  return ((consP(sexp))
          && (EqualSign(length(sexp), 3))
          && (symbolP(first(sexp)))
          && (symbolEqualSignP(types.symbol("define"), first(sexp)))
          && (not(consP(second(sexp)))));
};

// : parseDefinition : SExp -> AST (definition)
var parseDefinition = function (sexp) {
  function parseDefStruct(sexp) {
    return makeDefStruct(parseIdExpr(second(sexp)), map(parseIdExpr, third(sexp)));
  };
  function parseDefFunc(sexp) {
    return GreaterThan(length(rest(second(sexp))), 0) ? makeDefFunc(parseIdExpr(first(second(sexp))), map(parseIdExpr, rest(second(sexp))), parseExpr(third(sexp))) :
        error(types.symbol("parse-def-func"), stringAppend("expected at least one argument name after the", " function name, but found none."));
  };
  function parseDef(sexp) {
    return makeDefVar(parseIdExpr(second(sexp)), parseExpr(third(sexp)));
  };
 
  var def = isStructDefinition(sexp) ? parseDefStruct(sexp) :
            isFunctionDefinition(sexp) ? parseDefFunc(sexp) :
            isVariableDefinition(sexp) ? parseDef(sexp) :
            error(types.symbol("parse-definition"), stringAppend("Expected to find a definition, but found: ", sexpGreaterThanString(sexp)));
  def.location = sexp.location;
 return def;
};


//////////////////////////////////////// EXPRESSION PARSING ////////////////////////////////
var isExpr = function (sexp) {
  return ((not(isDefinition(sexp))) && (not(symTestCaseP(sexp))) && (not(symRequireP(sexp))) && (not(symProvideP(sexp))));
};

var parseExpr = function (sexp) {
  return consP(sexp) ? parseExprList(sexp) :
  parseExprSingleton(sexp);
};

// parseExprList : SExp -> AST
// predicates and parsers for call, lambda, local, letrec, let, let*, if, and, or, time, quote and quasiquote exprs
var parseExprList = function (sexp) {
  function sexpIsLambdaP(sexp) {
    return tuple3SlashFirstP(sexp, types.symbol("lambda"));
  };
  function sexpIsLocalP(sexp) {
    return tuple3SlashFirstP(sexp, types.symbol("local"));
  };
  function sexpIsLetrecP(sexp) {
    return tuple3SlashFirstP(sexp, types.symbol("letrec"));
  };
  function sexpIsLetP(sexp) {
    return tuple3SlashFirstP(sexp, types.symbol("let"));
  };
  function sexpIsLetStarP(sexp) {
    return tuple3SlashFirstP(sexp, types.symbol("let*"));
  };
  function sexpIsIfExprP(sexp) {
    return tuple4SlashFirstP(sexp, types.symbol("if"));
  };
  function sexpIsAndExprP(sexp) {
    return ((consP(sexp)) && (symbolP(first(sexp))) && (symbolEqualSignP(first(sexp), types.symbol("and"))));
  };
  function sexpIsOrExprP(sexp) {
    return ((consP(sexp)) && (symbolP(first(sexp))) && (symbolEqualSignP(first(sexp), types.symbol("or"))));
  };
  function sexpIsTimeExprP(sexp) {
    return tupleSlashFirstP(sexp, types.symbol("time"), 2);
  };
  function parseFuncCall(sexp) {
    return consP(sexp)? makeCall(parseExpr(first(sexp)), map(parseExpr, rest(sexp))) :
                        expectedError(types.symbol("parse-func-call"), "function call sexp", sexp);
  };
  function parseLambdaExpr(sexp) {
    return sexpIsLambdaP(sexp) ? GreaterThan(length(second(sexp)), -1) ? makeLambdaExpr(map(parseIdExpr, second(sexp)), parseExpr(third(sexp))) :
    error(types.symbol("parse-lambda-expr"), stringAppend("expected at least one argument name in the ", "sequence after `lambda', but found none")) :
    expectedError(types.symbol("parse-lambda-expt"), "lambda function sexp", sexp);
  };
  function parseLocalExpr(sexp) {
    return sexpIsLocalP(sexp) ? makeLocalExpr(map(parseDefinition, second(sexp)), parseExpr(third(sexp))) :
    expectedError(types.symbol("parse-local-expr"), "local expression sexp", sexp);
  };
  function parseLetrecExpr(sexp) {
    return sexpIsLetrecP(sexp) ? makeLetrecExpr(map(parseLetCouple, second(sexp)), parseExpr(third(sexp))) :
    expectedError(types.symbol("parse-letrec-expr"), "letrec expression sexp", sexp);
  };

  function parseLetExpr(sexp) {
    return sexpIsLetP(sexp) ? makeLetExpr(map(parseLetCouple, second(sexp)), parseExpr(third(sexp))) :
    expectedError(types.symbol("parse-let-expr"), "let expression sexp", sexp);
  };
  function parseLetStarExpr(sexp) {
    return sexpIsLetStarP(sexp) ? makeLetStarExpr(map(parseLetCouple, second(sexp)), parseExpr(third(sexp))) :
    expectedError(types.symbol("parse-let*-expr"), "let* expression sexp", sexp);
  };
  function parseIfExpr(sexp) {
    return sexpIsIfExprP(sexp) ? makeIfExpr(parseExpr(second(sexp)), parseExpr(third(sexp)), parseExpr(fourth(sexp))) :
    expectedError(types.symbol("parse-if-expr"), "if expression sexp", sexp);
  };
  function parseAndExpr(sexp) {
    return sexpIsAndExprP(sexp) ? makeAndExpr(map(parseExpr, rest(sexp))) :
    expectedError(types.symbol("parse-and-expr"), "and expression sexp", sexp);
  };
  function parseOrExpr(sexp) {
    return sexpIsOrExprP(sexp) ? makeOrExpr(map(parseExpr, rest(sexp))) :
    expectedError(types.symbol("parse-or-expr"), "or expression sexp", sexp);
  };
  function parseTimeExpr(sexp) {
    return sexpIsTimeExprP(sexp) ? makeTimeExpr(parseExpr(second(sexp))) :
    expectedError(types.symbol("parse-time-expr"), "time expression sexp", sexp);
  };
  function parseQuotedExpr(sexp) {
    return emptyP(sexp) ? makeCall(makePrimop(types.symbol("list")), []) :
    consP(sexp) ? makeCall(makePrimop(types.symbol("list")), map(parseQuotedExpr, sexp)) :
    numberP(sexp) ? makeNumberExpr(sexp) :
    stringP(sexp) ? makeStringExpr(sexp) :
    charP(sexp) ? makeCharExpr(string(sexp)) :
    symbolP(sexp) ? makeSymbolExpr(sexp) :
    expectedError(types.symbol("parse-quoted-expr"), "quoted sexp", sexp);
  };

  return (function () {
      var peek = first(sexp);
      var expr = not(symbolP(peek)) ? parseFuncCall(sexp) :
                  symbolEqualSignP(types.symbol("lambda"), peek)  ? parseLambdaExpr(sexp) :
                  symbolEqualSignP(types.symbol("local"), peek)   ? parseLocalExpr(sexp) :
                  symbolEqualSignP(types.symbol("letrec"), peek)  ? parseLetrecExpr(sexp) :
                  symbolEqualSignP(types.symbol("let"), peek)     ? parseLetExpr(sexp) :
                  symbolEqualSignP(types.symbol("let*"), peek)    ? parseLetStarExpr(sexp) :
                  symbolEqualSignP(types.symbol("cond"), peek)    ? parseCondExpr(sexp) :
                  symbolEqualSignP(types.symbol("if"), peek)      ? parseIfExpr(sexp) :
                  symbolEqualSignP(types.symbol("and"), peek)     ? parseAndExpr(sexp) :
                  symbolEqualSignP(types.symbol("or"), peek)      ? parseOrExpr(sexp) :
                  symbolEqualSignP(types.symbol("time"), peek)    ? parseTimeExpr(sexp) :
                  symbolEqualSignP(types.symbol("quote"), peek)   ? parseQuotedExpr(second(sexp)) :
                  symbolEqualSignP(types.symbol("quasiquote"), peek) ? parseQuasiQuotedExpr(second(sexp), false) :
                  parseFuncCall(sexp);
        expr.location = sexp.location;
        return expr;
 })();
};

var parseCondExpr = function (sexp) {
  return sexpIsCondListP(sexp) ? makeCondExpr(foldr((function (couple, rst) {
  return ((symbolP(first(couple))) && (symbolEqualSignP(first(couple), types.symbol("else"))) && (not(emptyP(rst)))) ? error(types.symbol("parse-cond-expr"), stringAppend("found an `else' clause", " that isn't the last", " clause in its `cond'", " expression")) :
  cons(parseCondCouple(couple), rst);
}), [], rest(sexp))) :
  expectedError(types.symbol("parse-cond-expr"), "cond expression sexp", sexp);
};

var parseCondCouple = function (sexp) {
  return sexpIsCoupleP(sexp) ? makeCouple(parseExpr(first(sexp)), parseExpr(second(sexp))) :
  expectedError(types.symbol("parse-cond-couple"), "couple of expressions sexp", sexp);
};

var parseLetCouple = function (sexp) {
  return sexpIsCoupleP(sexp) ? makeCouple(parseIdExpr(first(sexp)), parseExpr(second(sexp))) :
  expectedError(types.symbol("parse-let-couple"), "couple of an id and an expression sexp", sexp);
};

var parseQuasiQuotedExpr = function (sexp, inlist) {
  return emptyP(sexp) ? makeQqList([]) :
  consP(sexp) ? parseQqList(sexp, inlist) :
  numberP(sexp) ? makeNumberExpr(sexp) :
  stringP(sexp) ? makeStringExpr(sexp) :
  charP(sexp) ? makeCharExpr(string(sexp)) :
  symbolP(sexp) ? makeSymbolExpr(sexp) :
  expectedError(types.symbol("parse-quoted-expr"), "quoted sexp", sexp);
};

var parseQqList = function (sexp, inlist) {
  return symbolP(first(sexp)) ? symbolEqualSignP(first(sexp), types.symbol("unquote")) ? parseExpr(second(sexp)) :
  symbolEqualSignP(first(sexp), types.symbol("unquote-splicing")) ? inlist ? makeQqSplice(parseExpr(second(sexp))) :
  error(types.symbol("unquote-splicing"), "misuse of ,@ or `unquote-splicing' within a quasiquoting backquote") :
  makeQqList(map((function (x) {
  return parseQuasiQuotedExpr(x, true);
}), sexp)) :
  makeQqList(map((function (x) {
  return parseQuasiQuotedExpr(x, true);
}), sexp));
};

var parseExprSingleton = function (sexp) {
  function parseImage(img) {
    return makeImageExpr(encodeImage(img), imageWidth(img), imageHeight(img), pinholeX(img), pinholeY(img));
  };
  var singleton = stringP(sexp) ? makeStringExpr(sexp) :
    charP(sexp) ? makeCharExpr(string(sexp)) :
    numberP(sexp) ? makeNumberExpr(sexp) :
    symbolP(sexp) ? sexpIsPrimopP(sexp) ? makePrimop(sexp) :
    symbolEqualSignP(types.symbol("empty"), sexp) ? makeCall(makePrimop(types.symbol("list")), []) :
    ((symbolEqualSignP(types.symbol("true"), sexp)) || (symbolEqualSignP(types.symbol("false"), sexp))) ? makeBooleanExpr(sexp) :
    sexp :
    imageP(sexp) ? parseImage(sexp) :
    error(types.symbol("parse-expr-singleton"), stringAppend("( ): ", sexpGreaterThanString(sexp), "expected a function, but nothing's there"));
 singleton.location = sexp.location;
 return singleton;
};


var parseIdExpr = function (sexp) {
  return sexpIsIdP(sexp) ? sexp :
  expectedError(types.symbol("parse-id-expr"), "ID", sexp);
};

var tupleSlashFirstP = function (sexp, symbol, n) {
  return ((consP(sexp)) && (EqualSign(length(sexp), n)) && (symbolP(first(sexp))) && (symbolEqualSignP(first(sexp), symbol)));
};

var tuple3SlashFirstP = function (sexp, symbol) {
  return tupleSlashFirstP(sexp, symbol, 3);
};

var tuple4SlashFirstP = function (sexp, symbol) {
  return tupleSlashFirstP(sexp, symbol, 4);
};

var sexpIsCoupleP = function (sexp) {
  return ((consP(sexp)) && (EqualSign(length(sexp), 2)));
};


var sexpIsPrimopP = function (sexp) {
     return primitive.getPrimitive(sexp);
};

var sexpIsCondListP = function (sexp) {
  return ((consP(sexp)) && (GreaterThanEqualSign(length(sexp), 2)) && (symbolP(first(sexp))) && (symbolEqualSignP(first(sexp), types.symbol("cond"))));
};

var sexpIsIdP = function (sexp) {
  return symbolP(sexp);
};

//////////////////////////////////////// TEST-CASE PARSING ////////////////////////////////
var symTestCaseP = function (sexp) {
  return ((consP(sexp)) &&
          (symbolP(first(sexp))) &&
          (((symbolEqualSignP(first(sexp), types.symbol("check-expect"))) ||
            (symbolEqualSignP(first(sexp), types.symbol("check-within"))) ||
            (symbolEqualSignP(first(sexp), types.symbol("EXAMPLE"))) ||
            (symbolEqualSignP(first(sexp), types.symbol("check-error")))
                                                       )));
};

var symCheckExpectP = function (sexp) {
  return tuple3SlashFirstP(sexp, types.symbol("check-expect")) ||
         tuple3SlashFirstP(sexp, types.symbol("EXAMPLE"));
};

var checkErrorP = function (sexp) {
  return tuple3SlashFirstP(sexp, types.symbol("check-error"));
};

var checkWithinP = function (sexp) {
  return tuple4SlashFirstP(sexp, types.symbol("check-within"));
};

// parseTestCase : SExp -> AST
var parseTestCase = function (sexp) {
  function parseCheckExpect(sexp) {
    return symCheckExpectP(sexp) ? makeChkExpect(parseExpr(second(sexp)), parseExpr(third(sexp)), sexp) :
    expectedError(types.symbol("parse-check-expect"), "check expect sexp", sexp);
  };
  function parseCheckError(sexp) {
    return checkErrorP(sexp) ? makeChkError(parseExpr(second(sexp)), parseExpr(third(sexp)), sexp) :
    expectedError(types.symbol("parse-check-error"), "check error sexp", sexp);
  };
  function parseCheckWithin(sexp) {
    return checkWithinP(sexp) ? makeChkWithin(parseExpr(second(sexp)), parseExpr(third(sexp)), parseExpr(fourth(sexp)), sexp) :
    expectedError(types.symbol("parse-check-within"), "check within sexp", sexp);
  };

  var testCase = consP(sexp) ? symbolEqualSignP(first(sexp), types.symbol("check-expect")) ? parseCheckExpect(sexp) :
      symbolEqualSignP(first(sexp), types.symbol("EXAMPLE")) ? parseCheckExpect(sexp) :
      symbolEqualSignP(first(sexp), types.symbol("check-error")) ? parseCheckError(sexp) :
      symbolEqualSignP(first(sexp), types.symbol("check-within")) ? parseCheckWithin(sexp) :
      error(types.symbol("parse-test-case"), stringAppend("Expected a test case but instead found: ", sexpGreaterThanString(sexp))) :
      expectedError(types.symbol("parse-test-case"), "test-case sexp", sexp);
  testCase.location = sexp.location;
  return testCase;
};

//////////////////////////////////////// REQUIRE PARSING ////////////////////////////////
var symRequireP = function (sexp) {
  return ((consP(sexp)) && ((function () { var fst = first(sexp);

return ((symbolP(fst)) && (symbolEqualSignP(fst, types.symbol("require"))));
 })()));
};

var parseRequire = function (sexp) {
  return (function () { var uri = second(sexp);
    var req = ((stringP(uri)) || (symbolP(uri))) ? makeReq(uri) :
      symbolEqualSignP(first(uri), types.symbol("lib")) ? makeReq(uri) :
      makeReq(cons(types.symbol("planet"), cons(second(uri), [rest(third(uri))])));
    req.location = sexp.location;
    return req;
 })();
};

//////////////////////////////////////// PROVIDE PARSING ////////////////////////////////
var symProvideP = function (sexp) {
  return ((consP(sexp)) && (symbolP(first(sexp))) && (symbolEqualSignP(first(sexp), types.symbol("provide"))));
};

var parseProvide = function (sexp) {
  var provide = makeProvideStatement(symbolP(second(sexp)) ? rest(sexp) : types.symbol("all-defined-out"));
  provide.location = sexp.location;
  return provide;
};

var sexpGreaterThanString = function (sexp) {
  return format("~a", sexp);
};

var expectedError = function (id, expected, actual) {
  return error(id, stringAppend("Expected a ", expected, " but found: ", sexpGreaterThanString(actual)));
};

/////////////////////
/* Export Bindings */
/////////////////////

window.parse = parse;

})();