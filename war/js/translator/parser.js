/* TODO
 - JSLint
 - desugaring of structs, require, provide and local. proper handling of 'else' in cond
 - preserve location information during desugaring
 - add error messages to desugaring phase for eeeeeeeverything
 - do test cases get desugared?
 - Get plain error messages working, complete desugaring, write analyzer
 */

// consecCmp : (Any Any -> Boolean) [ListOf Any] -> Boolean
function consecCmp(proc, ls) {
  var res = true;
  for(var i=1; i < ls.length; i++) {
    var x = ls[i-1];
    var y = ls[i];
    res = proc(x,y);
  }
  
  return res;
}


function isSymbol(x) {return x instanceof symbolExpr;}

// isSymbolEqualTo : Any ... -> Boolean
// are these all symbols of the same value?
function isSymbolEqualTo() {
  function proc(x,y){
    x = (x instanceof symbolExpr)? x.val : x;
    y = (y instanceof symbolExpr)? y.val : y;
    return x.val === y.val && types.isSymbol(x) && types.isSymbol(y);
  }
  return consecCmp(proc, arguments);
}

function cons(x, y) { return [x].concat(y);}
function isCons(x) { return x instanceof Array && x.length>=1;}
function isEmpty(x) { return x instanceof Array && x.length===0;}
function rest(ls)    { return ls.slice(1); }


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

// encode the msg and location as a JSON error
function throwError(msg, loc) {
  loc.source = loc.source || "definitions"; // FIXME -- we should have the source populated
  
  var json = {"type": "moby-failure"
    , "dom-message": ["span"
                      ,[["class", "Error"]]
                      ,["span"
                        , [["class", "Message"]].concat(msg)]
                      ,["br", [], ""]
                      ,["span"
                        , [["class", "Error.location"]]
                        , ["span"
                           , [["class", "location-reference"]
                              , ["style", "display:none"]]
                           , ["span", [["class", "location-offset"]], loc.offset]
                           , ["span", [["class", "location-line"]]  , loc.sLine]
                           , ["span", [["class", "location-column"]], loc.sCol]
                           , ["span", [["class", "location-span"]]  , loc.span]
                           , ["span", [["class", "location-id"]]    , loc.source]
                           ]
                        ]
                      ]
    , "structured-error": '{"message": "'+msg+'", "location": {"line": "'+loc.sLine+'", "span": "'+loc.span+'", "offset": "'+loc.offset+'", "column": "'+loc.sCol+'", "id": "'+loc.source+'"}}'
  };
  console.log(json);
  throw JSON.stringify(json);
}

//////////////////////////////////// INSTANCE CHECKING WRAPPERS //////////////////////////////
function isString(x) { return (x instanceof Constant && types.isString(x.val));}
function isNumber(x) {return (x instanceof Constant && types.isNumber(x.val));}
var isChar = types.isChar;
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
var isRequire = isReq;
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
  this.desugar = function(pinfo){
    return new defFunc(this.name, this.args, this.body.desugar());
  };
};


// Variable definition
function defVar(name, expr) {
  this.name = name;
  this.expr = expr;
  this.toString = function(){
    return "(define "+this.name.toString()+" "+this.expr.toString()+")";
  };
  this.desugar = function(pinfo){
    return new defVar(this.name, this.expr.desugar());
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
  this.desugar = function(pinfo){
    console.log("desugaring defVars is not yet implemented");
    return this;
  };
};

// Structure definition
function defStruct(name, fields) {
  this.name = name;
  this.fields = fields;
  this.toString = function(){
    return "(define-struct "+this.name.toString()+" ("+this.fields.toString()+"))";
  };
  this.desugar = function(pinfo){
    console.log("desugaring defStruct is not yet implemented");
    return this;
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
function beginExpr(exprs) {
  this.exprs = exprs;
  this.toString = function(){
    return "(begin "+this.exprs.join(" ")+")";
  };
  this.desugar = function(pinfo){
    return new beginExpr(desugarAll(this.exprs));
  };
};


// Lambda expression
function lambdaExpr(args, body) {
  this.args = args;
  this.body = body;
  this.toString = function(){
    return "(lambda ("+this.args.join(" ")+") ("+this.body.toString()+"))";
  };
  this.desugar = function(pinfo){
    return new lambdaExpr(this.args, this.body.desugar());
  };
};

// Local expression TODO
function localExpr(defs, body) {
  this.defs = defs;
  this.body = body;
  this.toString = function(){
    return "(local ("+this.defs.toString()+") ("+this.body.toString()+"))";
  };
  this.desugar = function(pinfo){
    console.log("desugaring local is not yet implemented");
    return new localExpr(desugarAll(this.defs), this.body.desugar());
  };
};

// Letrec expression
function letrecExpr(bindings, body) {
  this.bindings = bindings;
  this.body = body;
  this.toString = function(){
    return "(letrec ("+this.bindings.toString()+") ("+this.body.toString()+"))";
  };
  this.desugar = function(pinfo){
    function bindingToDefn(b){return new defVar(b.first, b.second.desugar());};
    return new localExpr(this.bindings.map(bindingToDefn), this.body.desugar());
  };
};

// Let expression
function letExpr(bindings, body) {
  this.bindings = bindings;
  this.body = body;
  this.toString = function(){
    return "(let ("+this.bindings.toString()+") ("+this.body.toString()+"))";
  };
  this.desugar = function(pinfo){
    var ids   = this.bindings.map(coupleFirst),
        exprs = desugarAll(this.bindings.map(coupleSecond));
    return new call(new lambdaExpr(ids, this.body.desugar()), exprs);
  };
};

// Let* expressions
function letStarExpr(bindings, body) {
  this.bindings = bindings;
  this.body = body;
  this.toString = function(){
    return "(let* ("+this.bindings.toString()+") ("+this.body.toString()+"))";
  };
  this.desugar = function(pinfo){
    var ids   = this.bindings.map(coupleFirst),
        exprs = desugarAll(this.bindings.map(coupleSecond)),
        desugared = this.body.desugar();
    for(var i=0; i<this.bindings.length; i++){
      desugared = new letExpr([new couple(ids[i], exprs[i])], desugared);
    }
    return desugared;
  };
};

// application expression
function call(func, args) {
  this.func = func;
  this.args = args;
  this.toString = function(){
    return "("+this.func.toString()+" "+this.args.join(" ")+")";
  };
  this.desugar = function(pinfo){
    return new call(this.func.desugar(), desugarAll(this.args));
  };
};

// cond expression
function condExpr(clauses) {
  this.clauses = clauses;
  this.toString = function(){
    return "(cond\n    "+this.clauses.join("\n    ")+")";
  };
  this.desugar = function(pinfo){
    var desugared = this.clauses[this.clauses.length-1].second;
    for(var i=this.clauses.length-2; i>-1; i--){
      desugared = new ifExpr(this.clauses[i].first.desugar(),
                             this.clauses[i].second.desugar(),
                             desugared);
    }
    return desugared;
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
  this.desugar = function(pinfo){
    return new ifExpr(this.predicate.desugar()
                    ,this.consequence.desugar()
                    ,this.alternative.desugar());
  };
};

// and expression
function andExpr(exprs) {
  this.exprs = exprs;
  this.toString = function(){ return "(and "+this.exprs.join(" ")+")"; };
  this.desugar = function(pinfo){
    var exprs = desugarAll(this.exprs),
    desugared = exprs[exprs.length-1]; // ASSUME length >=2!!!
    for(i=exprs.length-2; i>-1; i--){
      desugared = new ifExpr(exprs[i], desugared, new booleanExpr(types.symbol("false")));
    }
    return desugared;
  };
};

// or expression
function orExpr(exprs) {
  this.exprs = exprs;
  this.toString = function(){ return "(or "+this.exprs.toString()+")"; };
  this.desugar = function(pinfo){
    var exprs = desugarAll(this.exprs),
    desugared = exprs[exprs.length-1]; // ASSUME length >=2!!!
    for(i=exprs.length-2; i>-1; i--){
      desugared = new ifExpr(exprs[i], new booleanExpr(types.symbol("true")), desugared);
    }
    return desugared;
  };
};

// time expression TODO
function timeExpr(val) {
  this.val = val;
  this.toString = function(){ return this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
};

// symbol expression
function symbolExpr(val) {
  this.val = val;
  this.toString = function(){ return this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
};

// number expression
function numberExpr(val) {
  this.val = val;
  this.toString = function(){ return this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
};

// string expression
function stringExpr(val) {
  this.val = val;
  this.toString = function(){ return "\""+this.val.toString()+"\""; };
  this.desugar = function(pinfo){ return this; };
};

// char expression
function charExpr(val) {
  this.val = val;
  this.toString = function(){ return "#\\"+this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
};

// list expression
function listExpr(val) {
  this.val = val;
  this.toString = function(){ return "(list "+this.val.toString() + ")"; };
  this.desugar = function(pinfo){ return this; };
};

// mtList expression TODO
function mtListExpr() {
  this.desugar = function(pinfo){ return this; };
};

// boolean expression
function booleanExpr(sym) {
  sym = (sym instanceof symbolExpr)? sym.val : sym;
  this.val = (sym.val === "true" || sym.val === "#t");
  this.toString = function(){ return this.val? "#t" : "#f";};
  this.desugar = function(pinfo){ return this; };
};

// quoted expression TODO
function quotedExpr(val) {
  this.val = val;
  this.toString = function(){ return "'"+this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
};

// quasiquoted expression TODO
function quasiquotedExpr(val) {
  this.val = val;
  this.toString = function(){ return "`"+this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
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
  this.desugar = function(pinfo){ return this; };
};

// quasiquoted list expression TODO
function qqList(val) {
  this.val = val;
  this.toString = function(){ return "`"+this.val.toString();};
  this.desugar = function(pinfo){ return this; };
};
function qqSplice(val) {
  this.val = val;
  this.desugar = function(pinfo){ return this; };
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
// couples = pair
function couple(first, second) {
  this.first = first;
  this.second = second;
  this.toString = function(){
    return "("+this.first.toString() +" "+this.second.toString()+")";
  };
};
function coupleFirst(x) { return x.first; };
function coupleSecond(x) { return x.second; };

// primop expression
function primop(val) {
  this.val = val;
  this.toString = function(){ return this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
};

// desugarAll : Listof SExps -> Listof SExps
function desugarAll(programs){
  var desugared = [];
  for(var i=0; i<programs.length; i++) desugared.push(programs[i].desugar());
  return desugared;
}

////////////////////// CHECK-EXPECTS ////////////////////////
// check-expect TODO
function chkExpect(actual, expected, sexp) {
  this.actual = actual;
  this.expected = expected;
  this.sexp = sexp;
  this.toString = function(){
    return "(check-expect "+this.sexp.toString() +" "+this.expected+")";
  };
  this.desugar = function(pinfo){ return this; };
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
  this.desugar = function(pinfo){ return this; };
};

// check-error
function chkError(actual, error, sexp) {
  this.actual = actual;
  this.error = error;
  this.sexp = sexp;
  this.toString = function(){
    return "(check-error "+this.sexp.toString() +" "+this.error+")";
  };
  this.desugar = function(pinfo){ return this; };
};


///////////////////////////////// REQUIRE ///////////////////////////
// require-url
function req(uri) {
  this.uri = uri;
  this.toString = function(){ return "(require "+this.uri+")"; };
  this.desugar = function(pinfo){ return this; };
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
  this.toString = function(){ return "(provide "+this.val+")" };
  this.desugar = function(pinfo){ return this; };
};

//////////////////////////////////////////////////////////////////////////////
///////////////////////////////// PARSER OBJECT //////////////////////////////
//////////////////////////////////////////////////////////////////////////////
(function () {
 'use strict';

// parse : sexp -> AST
var parse = (function (sexp) {
  return isEmpty(sexp) ? [] :
  (!isCons(sexp)) ? error(types.symbol("parse"), "The sexp is not a list of definitions or expressions: ", sexpGreaterThanString(sexp)) :
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
  return sexps.map(parseSExp);
};


//////////////////////////////////////// DEFINITION PARSING ////////////////////////////////
var isDefinition = function (sexp) {
  return ((isStructDefinition(sexp)) || (isFunctionDefinition(sexp)) || (isVariableDefinition(sexp)));
};

// if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define-struct'
var isStructDefinition = function (sexp) {
  return ((isCons(sexp))
          && (sexp.length === 3)
          && (isSymbol(sexp[0]))
          && (isSymbolEqualTo(types.symbol("define-struct"), sexp[0])));
};

// if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define' and rest is a Cons
var isFunctionDefinition = function (sexp) {
  return ((isCons(sexp))
          && (sexp.length === 3)
          && (isSymbol(sexp[0]))
          && (isSymbolEqualTo(types.symbol("define"), sexp[0]))
          && (isCons(sexp[1])));
};

// if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define' and rest is NOT a Cons
var isVariableDefinition = function (sexp) {
  return ((isCons(sexp))
          && (sexp.length === 3)
          && (isSymbol(sexp[0]))
          && (isSymbolEqualTo(types.symbol("define"), sexp[0]))
          && (!(isCons(sexp[1]))));
};

// : parseDefinition : SExp -> AST (definition)
var parseDefinition = function (sexp) {
  function parseDefStruct(sexp) {
    return new defStruct(parseIdExpr(sexp[1]), sexp[2].map(parseIdExpr));
  };
  function parseDefFunc(sexp) {
    return (rest(sexp[1]).length > 0) ? new defFunc(parseIdExpr(first(sexp[1])), rest(sexp[1]).map(parseIdExpr), parseExpr(sexp[2])) :
        error(types.symbol("parse-def-func"), stringAppend("expected at least one argument name after the", " function name, but found none."));
  };
  function parseDef(sexp) {
    return new defVar(parseIdExpr(sexp[1]), parseExpr(sexp[2]));
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
  return ((!(isDefinition(sexp))) && (!(isTestCase(sexp))) && (!(isRequire(sexp))) && (!(isProvide(sexp))));
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
    return ((isCons(sexp)) && (isSymbol(sexp[0])) && (isSymbolEqualTo(sexp[0], types.symbol("begin"))));
  };
  function isAnd(sexp) {
    return ((isCons(sexp)) && (isSymbol(sexp[0])) && (isSymbolEqualTo(sexp[0], types.symbol("and"))));
  };
  function isOr(sexp) {
    return ((isCons(sexp)) && (isSymbol(sexp[0])) && (isSymbolEqualTo(sexp[0], types.symbol("or"))));
  };
  function isTime(sexp) {
    return isTupleStartingWithOfLength(sexp, types.symbol("time"), 2);
  };
  function parseFuncCall(sexp) {
    return isCons(sexp)? new call(parseExpr(sexp[0]), rest(sexp).map(parseExpr)) :
                        expectedError(types.symbol("parse-func-call"), "function call sexp", sexp);
  };
  function parseLambdaExpr(sexp) {
    return isLambda(sexp) ? (sexp[1].length > -1) ? new lambdaExpr(sexp[1].map(parseIdExpr), parseExpr(sexp[2])) :
    error(types.symbol("parse-lambda-expr"), stringAppend("expected at least one argument name in the ", "sequence after `lambda', but found none")) :
    expectedError(types.symbol("parse-lambda-expt"), "lambda function sexp", sexp);
  };
  function parseLocalExpr(sexp) {
    return isLocal(sexp) ? new localExpr(sexp[1].map(parseDefinition), parseExpr(sexp[2])) :
    expectedError(types.symbol("parse-local-expr"), "local expression sexp", sexp);
  };
  function parseLetrecExpr(sexp) {
    return isLetrec(sexp) ? new letrecExpr(sexp[1].map(parseLetCouple), parseExpr(sexp[2])) :
    expectedError(types.symbol("parse-letrec-expr"), "letrec expression sexp", sexp);
  };

  function parseLetExpr(sexp) {
    return isLet(sexp) ? new letExpr(sexp[1].map(parseLetCouple), parseExpr(sexp[2])) :
    expectedError(types.symbol("parse-let-expr"), "let expression sexp", sexp);
  };
  function parseLetStarExpr(sexp) {
    return isLetStar(sexp) ? new letStarExpr(sexp[1].map(parseLetCouple), parseExpr(sexp[2])) :
    expectedError(types.symbol("parse-let*-expr"), "let* expression sexp", sexp);
  };
  function parseIfExpr(sexp) {
    return isIf(sexp) ? new ifExpr(parseExpr(sexp[1]), parseExpr(sexp[2]), parseExpr(sexp[3])) :
    expectedError(types.symbol("parse-if-expr"), "if expression sexp", sexp);
  };
  function parseBeginExpr(sexp) {
    return isBegin(sexp) ? new beginExpr(rest(sexp).map(parseExpr)) :
    expectedError(types.symbol("parse-begin-expr"), "begin expression sexp", sexp);
  };
  function parseAndExpr(sexp) {
    return isAnd(sexp) ? new andExpr(rest(sexp).map(parseExpr)) :
    expectedError(types.symbol("parse-and-expr"), "and expression sexp", sexp);
  };
  function parseOrExpr(sexp) {
    return isOr(sexp) ? new orExpr(rest(sexp).map(parseExpr)) :
    expectedError(types.symbol("parse-or-expr"), "or expression sexp", sexp);
  };
  function parseTimeExpr(sexp) {
    return isTime(sexp) ? new timeExpr(parseExpr(sexp[1])) :
    expectedError(types.symbol("parse-time-expr"), "time expression sexp", sexp);
  };
  function parseQuotedExpr(sexp) {
    return new quotedExpr(isEmpty(sexp) ?   new call(new primop(types.symbol("list")), []) :
                          isCons(sexp) ?    new call(new primop(types.symbol("list")), map(parseQuotedExpr, sexp)) :
                          isNumber(sexp) ?  new numberExpr(sexp) :
                          isString(sexp) ?  new stringExpr(sexp) :
                          isChar(sexp) ?    new charExpr(sexp.val) :
                          isSymbol(sexp) ?  new symbolExpr(sexp) :
                          expectedError(types.symbol("parse-quoted-expr"), "quoted sexp", sexp));
  };
  return (function () {
      var peek = sexp[0];
      var expr = !(isSymbol(peek)) ? parseFuncCall(sexp) :
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
                  isSymbolEqualTo(types.symbol("quote"), peek)   ? parseQuotedExpr(sexp[1]) :
                  isSymbolEqualTo(types.symbol("quasiquote"), peek) ? parseQuasiQuotedExpr(sexp[1], false) :
                  parseFuncCall(sexp);
        expr.location = sexp.location;
        return expr;
 })();
};

var parseCondExpr = function (sexp) {
 if(sexpIsCondListP(sexp)){
    return new condExpr(rest(sexp).reduceRight((function (rst, couple) {
                               if((isSymbol(first(couple))) && (isSymbolEqualTo(first(couple), types.symbol("else"))) && (!(isEmpty(rst)))){
                               return error(types.symbol("parse-cond-expr"),
                                            stringAppend("found an `else' clause", " that isn't the last", " clause in its `cond'", " expression"));
                               } else {
                                 return cons(parseCondCouple(couple), rst);
                               }
                               }), []));
 } else {
  expectedError(types.symbol("parse-cond-expr"), "cond expression sexp", sexp);
 }
};

var parseCondCouple = function (sexp) {
 if(sexpIsisCouple(sexp)){
    var cpl = new couple(parseExpr(sexp[0]), parseExpr(sexp[1]));
    cpl.location = sexp.location;
    return cpl;
 } else {
    return expectedError(types.symbol("parse-cond-couple"), "couple of expressions sexp", sexp);
 }
};

var parseLetCouple = function (sexp) {
  return sexpIsisCouple(sexp) ? new couple(parseIdExpr(sexp[0]), parseExpr(sexp[1])) :
  expectedError(types.symbol("parse-let-couple"), "couple of an id and an expression sexp", sexp);
};

var parseQuasiQuotedExpr = function (sexp, inlist) {
  return isEmpty(sexp) ? new qqList([]) :
  isCons(sexp) ? parseQqList(sexp, inlist) :
  isNumber(sexp) ? new numberExpr(sexp) :
  isString(sexp) ? new stringExpr(sexp) :
  isChar(sexp) ? new charExpr(sexp.val) :
  isSymbol(sexp) ? new symbolExpr(sexp) :
  expectedError(types.symbol("parse-quoted-expr"), "quoted sexp", sexp);
};

var parseQqList = function (sexp, inlist) {
  return isSymbol(sexp[0]) ? isSymbolEqualTo(sexp[0], types.symbol("unquote")) ? parseExpr(sexp[1]) :
  isSymbolEqualTo(sexp[0], types.symbol("unquote-splicing")) ? inlist ? new qqSplice(parseExpr(sexp[1])) :
  error(types.symbol("unquote-splicing"), "misuse of ,@ or `unquote-splicing' within a quasiquoting backquote") :
  new qqList(sexp.map((function (x) {
  return parseQuasiQuotedExpr(x, true);
}))) :
  new qqList(sexp.map((function (x) {
                  return parseQuasiQuotedExpr(x, true);
                  })));
};

var parseExprSingleton = function (sexp) {
  function parseImage(img) {
    return new imageExpr(encodeImage(img), imageWidth(img), imageHeight(img), pinholeX(img), pinholeY(img));
  };
  var singleton = isString(sexp) ? new stringExpr(sexp) :
                  isNumber(sexp) ? new numberExpr(sexp) :
                  isSymbolEqualTo(types.symbol("quote"), sexp) ? new quotedExpr(sexp) :
                  isChar(sexp) ? new charExpr(sexp.val) :
                  ((isSymbolEqualTo(types.symbol("true"), sexp)) || (isSymbolEqualTo(types.symbol("false"), sexp))) ? new booleanExpr(sexp) :
                  isSymbolEqualTo(types.symbol("empty"), sexp) ? new call(new primop(types.symbol("list")), []) :
                  isSymbol(sexp) ? sexpIsisPrimop(sexp) ? new primop(sexp) : sexp :
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
  return ((isCons(sexp)) && (sexp.length === n) && (isSymbol(sexp[0])) && (isSymbolEqualTo(sexp[0], symbol)));
};

var isTripleWithFirstEqualTo = function (sexp, symbol) {
  return isTupleStartingWithOfLength(sexp, symbol, 3);
};

var isQuadWithFirstEqualTo = function (sexp, symbol) {
  return isTupleStartingWithOfLength(sexp, symbol, 4);
};

var sexpIsisCouple = function (sexp) {
  return ((isCons(sexp)) && ((sexp.length === 2)));
};

var sexpIsisPrimop = function (sexp) {
     return primitive.getPrimitive(sexp);
};

var sexpIsCondListP = function (sexp) {
  return ((isCons(sexp)) && (sexp.length >= 2) && (isSymbol(sexp[0])) && (isSymbolEqualTo(sexp[0], types.symbol("cond"))));
};

var isId = function (sexp) {
  return isSymbol(sexp);
};

//////////////////////////////////////// TEST-CASE PARSING ////////////////////////////////
var isTestCase = function (sexp) {
  return ((isCons(sexp)) &&
          (isSymbol(sexp[0])) &&
          (((isSymbolEqualTo(sexp[0], types.symbol("check-expect"))) ||
            (isSymbolEqualTo(sexp[0], types.symbol("check-within"))) ||
            (isSymbolEqualTo(sexp[0], types.symbol("EXAMPLE"))) ||
            (isSymbolEqualTo(sexp[0], types.symbol("check-error")))
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
    return isCheckExpect(sexp) ? new chkExpect(parseExpr(sexp[1]), parseExpr(sexp[2]), sexp) :
    expectedError(types.symbol("parse-check-expect"), "check expect sexp", sexp);
  };
  function parseCheckError(sexp) {
    return isCheckError(sexp) ? new chkError(parseExpr(sexp[1]), parseExpr(sexp[2]), sexp) :
    expectedError(types.symbol("parse-check-error"), "check error sexp", sexp);
  };
  function parseCheckWithin(sexp) {
    return isCheckWithin(sexp) ? new chkWithin(parseExpr(sexp[1]), parseExpr(sexp[2]), parseExpr(sexp[3]), sexp) :
    expectedError(types.symbol("parse-check-within"), "check within sexp", sexp);
  };

  var testCase = isCons(sexp) ? isSymbolEqualTo(sexp[0], types.symbol("check-expect")) ? parseCheckExpect(sexp) :
      isSymbolEqualTo(sexp[0], types.symbol("EXAMPLE")) ? parseCheckExpect(sexp) :
      isSymbolEqualTo(sexp[0], types.symbol("check-error")) ? parseCheckError(sexp) :
      isSymbolEqualTo(sexp[0], types.symbol("check-within")) ? parseCheckWithin(sexp) :
      error(types.symbol("parse-test-case"), stringAppend("Expected a test case but instead found: ", sexpGreaterThanString(sexp))) :
      expectedError(types.symbol("parse-test-case"), "test-case sexp", sexp);
  testCase.location = sexp.location;
  return testCase;
};

//////////////////////////////////////// REQUIRE PARSING ////////////////////////////////
var isRequire = function (sexp) {
  return ((isCons(sexp)) && ((function () { var fst = sexp[0];

return ((isSymbol(fst)) && (isSymbolEqualTo(fst, types.symbol("require"))));
 })()));
};

var parseRequire = function (sexp) {
  return (function () { var uri = sexp[1];
    var req = ((isString(uri)) || (isSymbol(uri))) ? new req(uri) :
      isSymbolEqualTo(first(uri), types.symbol("lib")) ? new req(uri) :
      new req(cons(types.symbol("planet"), cons(second(uri), [rest(third(uri))])));
    req.location = sexp.location;
    return req;
 })();
};

//////////////////////////////////////// PROVIDE PARSING ////////////////////////////////
var isProvide = function (sexp) {
  return ((isCons(sexp)) && (isSymbol(sexp[0])) && (isSymbolEqualTo(sexp[0], types.symbol("provide"))));
};

var parseProvide = function (sexp) {
  var provide = new provide(isSymbol(sexp[1]) ? rest(sexp) : types.symbol("all-defined-out"));
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
 window.desugarAll = desugarAll;
 window.parse = parse;
})();