/*
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
