/* TODO
 - JSLint
 */

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
function makeIfExpr(predicate, consequence, alternative) { return new ifExpr(predicate, consequence, alternative); };
function makeBeginExpr(exprs) { return new beginExpr(exprs); };
function makeAndExpr(exprs) { return new andExpr(exprs); };
function makeOrExpr(exprs) { return new orExpr(exprs); };
function makeTimeExpr(val) { return new timeExpr(val); };
function makeSymbolExpr(val) { return new symbolExpr(val); };
function makeNumberExpr(val) { return new numberExpr(val); };
function makeStringExpr(val) { return new stringExpr(val); };
function makeCharExpr(char) { return new charExpr(char.val); };
function makeListExpr(val) { return new listExpr(val); };
function makeMtListExpr() { return new mtListExpr(); };
function makeBooleanExpr(val) { return new booleanExpr(val); };
function makeQuotedExpr(val) { return types.symbolExpr(val); };
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
function isDefFunc(x) { return x instanceof defFunc; };
function isDefVar(x) { return x instanceof defVar; };
function isDefStruct(x) { return x instanceof defStruct; };
function isLambdaExpr(x) { return x instanceof lambdaExpr; };
function isLocalExpr(x) { return x instanceof localExpr; };
function isLetrecExpr(x) { return x instanceof letrecExpr; };
function isLetExpr(x) { return x instanceof letExpr; };
function isLetStarExpr(x) { return x instanceof letStarExpr; };
function isCall(x) { return x instanceof call; };
function isCondExpr(x) { return x instanceof condExpr; };
function isIfExpr(x) { return x instanceof ifExpr; };
function isAndExpr(x) { return x instanceof andExpr; };
function isOrExpr(x) { return x instanceof orExpr; };
function isTimeExpr(x) { return x instanceof timeExpr; };
function isSymbolExpr(x) { return x instanceof symbolExpr; };
function isNumberExpr(x) { return x instanceof numberExpr; };
function isStringExpr(x) { return x instanceof stringExpr; };
function isCharExpr(x) { return x instanceof charExpr; };
function isListExpr(x) { return x instanceof listExpr; };
function isMTListExpr(x) { return x instanceof mtListExpr; };
function isBooleanExpr(x) { return x instanceof booleanExpr; };
function isQuotedExpr(x) { return x instanceof quotedExpr; };
function isQuasiQuotedExpr(x) { return x instanceof quasiquotedExpr; };
function isImageExpr(x) { return x instanceof imageExpr; };
function isQQList(x) { return x instanceof qqList; };
function isQQSplice(x) { return x instanceof qqSplice; };
function isCouple(x) { return x instanceof couple; };
function isPrimop(x) { return x instanceof primop; };
function isChkExpect(x) { return x instanceof chkExpect; };
function isChkWithin(x) { return x instanceof chkWithin; };
function isChkError(x) { return x instanceof chkError; };
function isReq(x) { return x instanceof req; };
function isProvideStatement(x) { return x instanceof provideStatement; };
var isRequire = isReq
var isProvide = isProvideStatement;
// a definition is a function, variable or struct
var isDefinition = function (x) {
                   return ((isDefFunc(x)) || (isDefVar(x)) || (isDefStruct(x)));
                   };
// an expression is a lambda, local, letrec, let, let*, call, cond, if, and, or, time, symbol, primop,
// number, string, char, list, boolean, image, quote or quasiquote
var isExpr = function (x) {
             return ((isLambdaExpr(x)) || (isLocalExpr(x)) || (isLetrecExpr(x)) || (isLetExpr(x)) || (isLetStarExpr(x)) || (isCall(x)) || (isCondExpr(x)) || (isIfExpr(x)) || (isBeginExpr(x))|| (isAndExpr(x)) || (isOrExpr(x)) || (isTimeExpr(x)) || (isSymbol(x)) || (isPrimop(x)) || (isSymbolExpr(x)) || (isNumberExpr(x)) || (isStringExpr(x)) || (isCharExpr(x)) || (isListExpr(x)) || (isMTListExpr(x)) || (isBooleanExpr(x)) || (isQuotedExpr(x)) || (isQuasiQuotedExpr(x)) || (isImageExpr(x)));
             };
// a test case is a check-expect, check-within or check-error
var isTestCase = function (x) {
                     return ((isChkExpect(x)) || (isChkWithin(x)) || (isChkError(x)));
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

// Variable**S** definition
// (not yet used)
function defVars(names, expr) {
  this.names = names;
  this.expr = expr;
  this.toString = function(){
    return "(define ("+this.names.join(" ")+") "+this.expr.toString()+")";
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

function definitionName(def) {
  return isDefFunc(def) ? def.name :
         isDefVar(def) ? def.name :
         isDefStruct(def) ? def.name :
         err("cond", "all questions false");
  };

///////////////////////////////////EXPRESSIONS//////////////////////////////
// Begin expression
// (not yet used)
function beginExpr(exprs) {
  this.exprs = exprs;
  this.toString = function(){
    return "(begin "+this.exprs.join(" ")+")";
  };
};


// Lambda expression
function lambdaExpr(args, body) {
  this.args = args;
  this.body = body;
  this.toString = function(){
    return "(lambda ("+this.args.join(" ")+") ("+this.body.toString()+"))";
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
    return "(let ("+this.bindings.toString()+") ("+this.body.toString()+"))";
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
function ifExpr(predicate, consequence, alternative) {
  this.predicate = predicate;
  this.consequence = consequence;
  this.alternative = alternative;
  this.toString = function(){
    return "(if "+this.predicate.toString()+" "+this.consequence.toString()+" "+this.alternative.toString()+")";
  };
};

// and expression
function andExpr(exprs) {
  this.exprs = exprs;
  this.toString = function(){ return "(and "+this.exprs.join(" ")+")"; };
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
  this.toString = function(){ return "#\\"+this.val.str.toString(); };
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
                                        return isLetrecExpr(x) ? letrecExprBindings(x) :
                                        isLetExpr(x) ? x.bindings:
                                        isLetStarExpr(x) ? x.bindings :
                                        err("cond", "all questions false");
                                        });

var letSlashStarSlashRecBody = (function (x) {
                                    return isLetrecExpr(x) ? x.body :
                                    isLetExpr(x) ? x.body :
                                    isLetStarExpr(x) ? x.body :
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
                        return ((isReq(x)) && (isString(reqUri(x))));
                        });

var isisSymbolred = (function (x) {
                            return (function (y) {
                                    return ((isSymbol(y)) && (isSymbolEqualTo(y, x)));
                                    });
                            });

var requireTypeP = (function (x, type) {
                        return ((isReq(x)) && (isCons(reqUri(x))) && (isisSymbolred(type)(first(reqUri(x)))));
                        });

// lib TODO
var requireLibP = (function (x) {
                       return requireTypeP(x, types.symbol("lib"));
                       });
// planet TODO
var isRequirelanetP = (function (x) {
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
  not(isCons(sexp)) ? error(types.symbol("parse"), "The sexp is not a list of definitions or expressions: ", sexpGreaterThanString(sexp)) :
  parseStar(sexp);
});

// parse* : sexp list -> AST
var parseStar = function (sexps) {
 var parseSExp = function (sexp) {
   return isDefinition(sexp) ? parseDefinition(sexp) :
   isExpr(sexp) ? parseExpr(sexp) :
   isTestCase(sexp) ? parseTestCase(sexp) :
   isRequire(sexp) ? parseRequire(sexp) :
   isProvide(sexp) ? parseProvide(sexp) :
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
  return ((isCons(sexp))
          && (EqualSign(length(sexp), 3))
          && (isSymbol(first(sexp)))
          && (isSymbolEqualTo(types.symbol("define-struct"), first(sexp))));
};

// if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define' and rest is a Cons
var isFunctionDefinition = function (sexp) {
  return ((isCons(sexp))
          && (EqualSign(length(sexp), 3))
          && (isSymbol(first(sexp)))
          && (isSymbolEqualTo(types.symbol("define"), first(sexp)))
          && (isCons(second(sexp))));
};

// if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define' and rest is NOT a Cons
var isVariableDefinition = function (sexp) {
  return ((isCons(sexp))
          && (EqualSign(length(sexp), 3))
          && (isSymbol(first(sexp)))
          && (isSymbolEqualTo(types.symbol("define"), first(sexp)))
          && (not(isCons(second(sexp)))));
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
  return ((not(isDefinition(sexp))) && (not(isTestCase(sexp))) && (not(isRequire(sexp))) && (not(isProvide(sexp))));
};

var parseExpr = function (sexp) {
  return isCons(sexp) ? parseExprList(sexp) :
  parseExprSingleton(sexp);
};

// parseExprList : SExp -> AST
// predicates and parsers for call, lambda, local, letrec, let, let*, if, and, or, time, quote and quasiquote exprs
var parseExprList = function (sexp) {
  function isLambda(sexp) {
    return isTripleWithFirstEqualTo(sexp, types.symbol("lambda"));
  };
  function isLocal(sexp) {
    return isTripleWithFirstEqualTo(sexp, types.symbol("local"));
  };
  function isLetrec(sexp) {
    return isTripleWithFirstEqualTo(sexp, types.symbol("letrec"));
  };
  function isLet(sexp) {
    return isTripleWithFirstEqualTo(sexp, types.symbol("let"));
  };
  function isLetStar(sexp) {
    return isTripleWithFirstEqualTo(sexp, types.symbol("let*"));
  };
  function isIf(sexp) {
    return isQuadWithFirstEqualTo(sexp, types.symbol("if"));
  };
  function isBegin(sexp) {
    return ((isCons(sexp)) && (isSymbol(first(sexp))) && (isSymbolEqualTo(first(sexp), types.symbol("begin"))));
  };
  function isAnd(sexp) {
    return ((isCons(sexp)) && (isSymbol(first(sexp))) && (isSymbolEqualTo(first(sexp), types.symbol("and"))));
  };
  function isOr(sexp) {
    return ((isCons(sexp)) && (isSymbol(first(sexp))) && (isSymbolEqualTo(first(sexp), types.symbol("or"))));
  };
  function isTime(sexp) {
    return isTupleStartingWithOfLength(sexp, types.symbol("time"), 2);
  };
  function parseFuncCall(sexp) {
    return isCons(sexp)? makeCall(parseExpr(first(sexp)), map(parseExpr, rest(sexp))) :
                        expectedError(types.symbol("parse-func-call"), "function call sexp", sexp);
  };
  function parseLambdaExpr(sexp) {
    return isLambda(sexp) ? GreaterThan(length(second(sexp)), -1) ? makeLambdaExpr(map(parseIdExpr, second(sexp)), parseExpr(third(sexp))) :
    error(types.symbol("parse-lambda-expr"), stringAppend("expected at least one argument name in the ", "sequence after `lambda', but found none")) :
    expectedError(types.symbol("parse-lambda-expt"), "lambda function sexp", sexp);
  };
  function parseLocalExpr(sexp) {
    return isLocal(sexp) ? makeLocalExpr(map(parseDefinition, second(sexp)), parseExpr(third(sexp))) :
    expectedError(types.symbol("parse-local-expr"), "local expression sexp", sexp);
  };
  function parseLetrecExpr(sexp) {
    return isLetrec(sexp) ? makeLetrecExpr(map(parseLetCouple, second(sexp)), parseExpr(third(sexp))) :
    expectedError(types.symbol("parse-letrec-expr"), "letrec expression sexp", sexp);
  };

  function parseLetExpr(sexp) {
    return isLet(sexp) ? makeLetExpr(map(parseLetCouple, second(sexp)), parseExpr(third(sexp))) :
    expectedError(types.symbol("parse-let-expr"), "let expression sexp", sexp);
  };
  function parseLetStarExpr(sexp) {
    return isLetStar(sexp) ? makeLetStarExpr(map(parseLetCouple, second(sexp)), parseExpr(third(sexp))) :
    expectedError(types.symbol("parse-let*-expr"), "let* expression sexp", sexp);
  };
  function parseIfExpr(sexp) {
    return isIf(sexp) ? makeIfExpr(parseExpr(second(sexp)), parseExpr(third(sexp)), parseExpr(fourth(sexp))) :
    expectedError(types.symbol("parse-if-expr"), "if expression sexp", sexp);
  };
  function parseBeginExpr(sexp) {
    return isBegin(sexp) ? makeBeginExpr(map(parseExpr, rest(sexp))) :
    expectedError(types.symbol("parse-begin-expr"), "begin expression sexp", sexp);
  };
  function parseAndExpr(sexp) {
    return isAnd(sexp) ? makeAndExpr(map(parseExpr, rest(sexp))) :
    expectedError(types.symbol("parse-and-expr"), "and expression sexp", sexp);
  };
  function parseOrExpr(sexp) {
    return isOr(sexp) ? makeOrExpr(map(parseExpr, rest(sexp))) :
    expectedError(types.symbol("parse-or-expr"), "or expression sexp", sexp);
  };
  function parseTimeExpr(sexp) {
    return isTime(sexp) ? makeTimeExpr(parseExpr(second(sexp))) :
    expectedError(types.symbol("parse-time-expr"), "time expression sexp", sexp);
  };
  function parseQuotedExpr(sexp) {
    return emptyP(sexp) ? makeCall(makePrimop(types.symbol("list")), []) :
    isCons(sexp) ? makeCall(makePrimop(types.symbol("list")), map(parseQuotedExpr, sexp)) :
    isNumber(sexp) ? makeNumberExpr(sexp) :
    isString(sexp) ? makeStringExpr(sexp) :
    isChar(sexp) ? makeCharExpr(string(sexp.val.str)) :
    isSymbol(sexp) ? makeSymbolExpr(sexp) :
    expectedError(types.symbol("parse-quoted-expr"), "quoted sexp", sexp);
  };

  return (function () {
      var peek = first(sexp);
      var expr = not(isSymbol(peek)) ? parseFuncCall(sexp) :
                  isSymbolEqualTo(types.symbol("lambda"), peek)  ? parseLambdaExpr(sexp) :
                  isSymbolEqualTo(types.symbol("local"), peek)   ? parseLocalExpr(sexp) :
                  isSymbolEqualTo(types.symbol("letrec"), peek)  ? parseLetrecExpr(sexp) :
                  isSymbolEqualTo(types.symbol("let"), peek)     ? parseLetExpr(sexp) :
                  isSymbolEqualTo(types.symbol("let*"), peek)    ? parseLetStarExpr(sexp) :
                  isSymbolEqualTo(types.symbol("cond"), peek)    ? parseCondExpr(sexp) :
                  isSymbolEqualTo(types.symbol("if"), peek)      ? parseIfExpr(sexp) :
                  isSymbolEqualTo(types.symbol("begin"), peek)   ? parseBeginExpr(sexp) :
                  isSymbolEqualTo(types.symbol("and"), peek)     ? parseAndExpr(sexp) :
                  isSymbolEqualTo(types.symbol("or"), peek)      ? parseOrExpr(sexp) :
                  isSymbolEqualTo(types.symbol("time"), peek)    ? parseTimeExpr(sexp) :
                  isSymbolEqualTo(types.symbol("quote"), peek)   ? parseQuotedExpr(second(sexp)) :
                  isSymbolEqualTo(types.symbol("quasiquote"), peek) ? parseQuasiQuotedExpr(second(sexp), false) :
                  parseFuncCall(sexp);
        expr.location = sexp.location;
        return expr;
 })();
};

var parseCondExpr = function (sexp) {
  return sexpIsCondListP(sexp) ? makeCondExpr(foldr((function (couple, rst) {
  return ((isSymbol(first(couple))) && (isSymbolEqualTo(first(couple), types.symbol("else"))) && (not(emptyP(rst)))) ? error(types.symbol("parse-cond-expr"), stringAppend("found an `else' clause", " that isn't the last", " clause in its `cond'", " expression")) :
  cons(parseCondCouple(couple), rst);
}), [], rest(sexp))) :
  expectedError(types.symbol("parse-cond-expr"), "cond expression sexp", sexp);
};

var parseCondCouple = function (sexp) {
  return sexpIsisCouple(sexp) ? makeCouple(parseExpr(first(sexp)), parseExpr(second(sexp))) :
  expectedError(types.symbol("parse-cond-couple"), "couple of expressions sexp", sexp);
};

var parseLetCouple = function (sexp) {
  return sexpIsisCouple(sexp) ? makeCouple(parseIdExpr(first(sexp)), parseExpr(second(sexp))) :
  expectedError(types.symbol("parse-let-couple"), "couple of an id and an expression sexp", sexp);
};

var parseQuasiQuotedExpr = function (sexp, inlist) {
  return emptyP(sexp) ? makeQqList([]) :
  isCons(sexp) ? parseQqList(sexp, inlist) :
  isNumber(sexp) ? makeNumberExpr(sexp) :
  isString(sexp) ? makeStringExpr(sexp) :
  isChar(sexp) ? makeCharExpr(sexp) :
  isSymbol(sexp) ? makeSymbolExpr(sexp) :
  expectedError(types.symbol("parse-quoted-expr"), "quoted sexp", sexp);
};

var parseQqList = function (sexp, inlist) {
  return isSymbol(first(sexp)) ? isSymbolEqualTo(first(sexp), types.symbol("unquote")) ? parseExpr(second(sexp)) :
  isSymbolEqualTo(first(sexp), types.symbol("unquote-splicing")) ? inlist ? makeQqSplice(parseExpr(second(sexp))) :
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
  var singleton = isString(sexp) ? makeStringExpr(sexp) :
    isChar(sexp) ? makeCharExpr(sexp) :
    isNumber(sexp) ? makeNumberExpr(sexp) :
    isSymbol(sexp) ? sexpIsisPrimop(sexp) ? makePrimop(sexp) :
    isSymbolEqualTo(types.symbol("empty"), sexp) ? makeCall(makePrimop(types.symbol("list")), []) :
    ((isSymbolEqualTo(types.symbol("true"), sexp)) || (isSymbolEqualTo(types.symbol("false"), sexp))) ? makeBooleanExpr(sexp) :
    sexp :
    imageP(sexp) ? parseImage(sexp) :
    error(types.symbol("parse-expr-singleton"), stringAppend("( ): ", sexpGreaterThanString(sexp), "expected a function, but nothing's there"));
 singleton.location = sexp.location;
 return singleton;
};


var parseIdExpr = function (sexp) {
  return isId(sexp) ? sexp :
  expectedError(types.symbol("parse-id-expr"), "ID", sexp);
};

var isTupleStartingWithOfLength = function (sexp, symbol, n) {
  return ((isCons(sexp)) && (EqualSign(length(sexp), n)) && (isSymbol(first(sexp))) && (isSymbolEqualTo(first(sexp), symbol)));
};

var isTripleWithFirstEqualTo = function (sexp, symbol) {
  return isTupleStartingWithOfLength(sexp, symbol, 3);
};

var isQuadWithFirstEqualTo = function (sexp, symbol) {
  return isTupleStartingWithOfLength(sexp, symbol, 4);
};

var sexpIsisCouple = function (sexp) {
  return ((isCons(sexp)) && (EqualSign(length(sexp), 2)));
};


var sexpIsisPrimop = function (sexp) {
     return primitive.getPrimitive(sexp);
};

var sexpIsCondListP = function (sexp) {
  return ((isCons(sexp)) && (GreaterThanEqualSign(length(sexp), 2)) && (isSymbol(first(sexp))) && (isSymbolEqualTo(first(sexp), types.symbol("cond"))));
};

var isId = function (sexp) {
  return isSymbol(sexp);
};

//////////////////////////////////////// TEST-CASE PARSING ////////////////////////////////
var isTestCase = function (sexp) {
  return ((isCons(sexp)) &&
          (isSymbol(first(sexp))) &&
          (((isSymbolEqualTo(first(sexp), types.symbol("check-expect"))) ||
            (isSymbolEqualTo(first(sexp), types.symbol("check-within"))) ||
            (isSymbolEqualTo(first(sexp), types.symbol("EXAMPLE"))) ||
            (isSymbolEqualTo(first(sexp), types.symbol("check-error")))
                                                       )));
};

var isCheckExpect = function (sexp) {
  return isTripleWithFirstEqualTo(sexp, types.symbol("check-expect")) ||
         isTripleWithFirstEqualTo(sexp, types.symbol("EXAMPLE"));
};

var isCheckError = function (sexp) {
  return isTripleWithFirstEqualTo(sexp, types.symbol("check-error"));
};

var isCheckWithin = function (sexp) {
  return isQuadWithFirstEqualTo(sexp, types.symbol("check-within"));
};

// parseTestCase : SExp -> AST
var parseTestCase = function (sexp) {
  function parseCheckExpect(sexp) {
    return isCheckExpect(sexp) ? makeChkExpect(parseExpr(second(sexp)), parseExpr(third(sexp)), sexp) :
    expectedError(types.symbol("parse-check-expect"), "check expect sexp", sexp);
  };
  function parseCheckError(sexp) {
    return isCheckError(sexp) ? makeChkError(parseExpr(second(sexp)), parseExpr(third(sexp)), sexp) :
    expectedError(types.symbol("parse-check-error"), "check error sexp", sexp);
  };
  function parseCheckWithin(sexp) {
    return isCheckWithin(sexp) ? makeChkWithin(parseExpr(second(sexp)), parseExpr(third(sexp)), parseExpr(fourth(sexp)), sexp) :
    expectedError(types.symbol("parse-check-within"), "check within sexp", sexp);
  };

  var testCase = isCons(sexp) ? isSymbolEqualTo(first(sexp), types.symbol("check-expect")) ? parseCheckExpect(sexp) :
      isSymbolEqualTo(first(sexp), types.symbol("EXAMPLE")) ? parseCheckExpect(sexp) :
      isSymbolEqualTo(first(sexp), types.symbol("check-error")) ? parseCheckError(sexp) :
      isSymbolEqualTo(first(sexp), types.symbol("check-within")) ? parseCheckWithin(sexp) :
      error(types.symbol("parse-test-case"), stringAppend("Expected a test case but instead found: ", sexpGreaterThanString(sexp))) :
      expectedError(types.symbol("parse-test-case"), "test-case sexp", sexp);
  testCase.location = sexp.location;
  return testCase;
};

//////////////////////////////////////// REQUIRE PARSING ////////////////////////////////
var isRequire = function (sexp) {
  return ((isCons(sexp)) && ((function () { var fst = first(sexp);

return ((isSymbol(fst)) && (isSymbolEqualTo(fst, types.symbol("require"))));
 })()));
};

var parseRequire = function (sexp) {
  return (function () { var uri = second(sexp);
    var req = ((isString(uri)) || (isSymbol(uri))) ? makeReq(uri) :
      isSymbolEqualTo(first(uri), types.symbol("lib")) ? makeReq(uri) :
      makeReq(cons(types.symbol("planet"), cons(second(uri), [rest(third(uri))])));
    req.location = sexp.location;
    return req;
 })();
};

//////////////////////////////////////// PROVIDE PARSING ////////////////////////////////
var isProvide = function (sexp) {
  return ((isCons(sexp)) && (isSymbol(first(sexp))) && (isSymbolEqualTo(first(sexp), types.symbol("provide"))));
};

var parseProvide = function (sexp) {
  var provide = makeProvideStatement(isSymbol(second(sexp)) ? rest(sexp) : types.symbol("all-defined-out"));
  provide.location = sexp.location;
  return provide;
};

var sexpGreaterThanString = function (sexp) {
  return format("~a", sexp);
};

var expectedError = function (id, expected, actual) {
  return error(id, stringAppend("Expected a ", expected, " but found: ", sexpGreaterThanString(actual)));
};
 
///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// DESUGARING /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// desugarProgram : (listof program) -> (listof program)
function desugarProgram(program){
 function desugar(p){
    if(p instanceof defFunc){
      return makeDefFunc(p.name, p.args, desugar(p.body));
    } else if(p instanceof defVar) {
      return makeDefVar(p.name, desugar(p.expr));
    } else if(p instanceof defStruct){
      return p;
    } else if(p instanceof lambdaExpr){
      return makeLambdaExpr(p.args, desugar(p.body));
    } else if(p instanceof localExpr){
      return p;
    } else if(p instanceof letrecExpr){
      return p;
    } else if(p instanceof letExpr){
      var ids   = p.bindings.map(coupleFirst),
          exprs = p.bindings.map(coupleSecond).map(desugar);
      return makeCall(makeLambdaExpr(ids, desugar(p.body)), exprs);
    } else if(p instanceof letStarExpr){
      var ids   = p.bindings.map(coupleFirst),
          exprs = p.bindings.map(coupleSecond).map(desugar),
          desugared = desugar(p.body);
      for(i=p.bindings.length-1; i>-1; i--){
        desugared = makeLetExpr([makeCouple(ids[i], exprs[i])], desugared);
      }
      return desugared;
     } else if(p instanceof call){
      return makeCall(desugar(p.func), p.args.map(desugar));
     } else if(p instanceof condExpr){
      var desugared = second(p.clauses[p.clauses.length-1]);
      for(i=p.clauses.length-1; i>-1; i--){
        desugared = makeIfExpr(p.clauses[i].first, p.clauses[i].second, desugared);
      }
      return desugared;
    } else if(p instanceof ifExpr){
      return makeIfExpr(desugar(p.predicate)
                      , desugar(p.consequence)
                      , desugar(p.alternate));
    } else if(p instanceof beginExpr){
      return makeBeginExpr(p.exprs.map(desugar));
    } else if(p instanceof andExpr){
      return makeAndExpr(p.exprs.map(desugar));
    } else if(p instanceof orExpr){
      return makeOrExpr(p.exprs.map(desugar));
    } else {
       return p;
    }
  }
 return program.map(desugar);
}

/////////////////////
/* Export Bindings */
/////////////////////
window.desugarProgram = desugarProgram;
window.parse = parse;
})();