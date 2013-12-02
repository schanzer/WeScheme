/*
 - desugaring of structs, require, provide and local. proper handling of 'else' in cond
- preserve location information during desugaring
- add error messages to desugaring phase for eeeeeeeverything
- do test cases get desugared?
- Get plain error messages working, complete desugaring, write analyzer
*/

// COMMON FUNCTIONS AND STRUCTURES ////////////////////////////////////////
// used by multiple phases of the compiler

// isSymbolEqualTo : (types.symbol || symbolExpr) x 2 -> Boolean
// are these all symbols of the same value?
function isSymbolEqualTo(x, y) {
    x = (x instanceof symbolExpr)? x.val : x;
    y = (y instanceof symbolExpr)? y.val : y;
    return x.val === y.val;
  }

function cons(x, y) { return [x].concat(y);}
function isCons(x)  { return x instanceof Array && x.length>=1;}
function isEmpty(x) { return x instanceof Array && x.length===0;}
function first(ls)  { return ls[0]; }
function rest(ls)   { return ls.slice(1); }


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

// OBJECT HIERARCHY//////////////////////////////////////////
// Inheritance from pg 168: Javascript, the Definitive Guide.
var heir = function(p) {
  var f = function() {};
  f.prototype = p;
  return new f();
};

// all Programs, by default, print out their values and do not desugar
// anything that behaves differently must override these functions
var Program = function() {
  this.toString = function(){ return this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
};

// Function definition
function defFunc(name, args, body) {
  Program.call(this);
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
defFunc.prototype = heir(Program.prototype);


// Variable definition
function defVar(name, expr) {
  Program.call(this);
  this.name = name;
  this.expr = expr;
  this.toString = function(){
    return "(define "+this.name.toString()+" "+this.expr.toString()+")";
  };
  this.desugar = function(pinfo){
    return new defVar(this.name, this.expr.desugar());
  };
};
defVar.prototype = heir(Program.prototype);

// Variable**S** definition
// (not yet used)
function defVars(names, expr) {
  Program.call(this);
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
defVars.prototype = heir(Program.prototype);

// Structure definition
function defStruct(name, fields) {
  Program.call(this);
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
defStruct.prototype = heir(Program.prototype);

// Begin expression
function beginExpr(exprs) {
  Program.call(this);
  this.exprs = exprs;
  this.toString = function(){
    return "(begin "+this.exprs.join(" ")+")";
  };
  this.desugar = function(pinfo){
    return new beginExpr(desugarAll(this.exprs));
  };
};
beginExpr.prototype = heir(Program.prototype);

// Lambda expression
function lambdaExpr(args, body) {
  Program.call(this);
  this.args = args;
  this.body = body;
  this.toString = function(){
    return "(lambda ("+this.args.join(" ")+") ("+this.body.toString()+"))";
  };
  this.desugar = function(pinfo){
    return new lambdaExpr(this.args, this.body.desugar());
  };
};
lambdaExpr.prototype = heir(Program.prototype);

// Local expression TODO
function localExpr(defs, body) {
  Program.call(this);
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
localExpr.prototype = heir(Program.prototype);

// application expression
function callExpr(func, args) {
  Program.call(this);
  this.func = func;
  this.args = args;
  this.toString = function(){
    return "("+this.func.toString()+" "+this.args.join(" ")+")";
  };
  this.desugar = function(pinfo){
    return new callExpr(this.func.desugar(), desugarAll(this.args));
  };
};
callExpr.prototype = heir(Program.prototype);

// if expression
function ifExpr(predicate, consequence, alternative) {
  Program.call(this);
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
ifExpr.prototype = heir(Program.prototype);

// time expression TODO
function timeExpr(val) {
  Program.call(this);
  this.val = val;
};
timeExpr.prototype = heir(Program.prototype);

// symbol expression (ID)
function symbolExpr(val) {
  Program.call(this);
  this.val = val;
};
symbolExpr.prototype = heir(Program.prototype);

// number expression
function numberExpr(val) {
  Program.call(this);
  this.val = val;
};
numberExpr.prototype = heir(Program.prototype);

// string expression
function stringExpr(val) {
  Program.call(this);
  this.val = val;
  this.toString = function(){ return "\""+this.val.toString()+"\""; };
};
stringExpr.prototype = heir(Program.prototype);

// char expression
function charExpr(val) {
  Program.call(this);
  this.val = val;
  this.toString = function(){ return "#\\"+this.val.toString(); };
};
charExpr.prototype = heir(Program.prototype);

// list expression
function listExpr(val) {
  Program.call(this);
  this.val = val;
  this.toString = function(){ return "(list "+this.val.toString() + ")"; };
  this.desugar = function(pinfo){ return this.val.desugar(); };
};
listExpr.prototype = heir(Program.prototype);

// mtList expression TODO
function mtListExpr() {
  Program.call(this);
};
mtListExpr.prototype = heir(Program.prototype);

// boolean expression
function booleanExpr(sym) {
  Program.call(this);
  sym = (sym instanceof symbolExpr)? sym.val : sym;
  this.val = (sym.val === "true" || sym.val === "#t");
  this.toString = function(){ return this.val? "#t" : "#f";};
};
booleanExpr.prototype = heir(Program.prototype);

// quoted expression TODO
function quotedExpr(val) {
  Program.call(this);
  this.val = val;
  this.toString = function(){ return "'"+this.val.toString(); };
};
quotedExpr.prototype = heir(Program.prototype);

// quasiquoted expression TODO
function quasiquotedExpr(val) {
  Program.call(this);
  this.val = val;
  this.toString = function(){ return "`"+this.val.toString(); };
};
quasiquotedExpr.prototype = heir(Program.prototype);

// quasiquoted list expression TODO
function qqList(val) {
  Program.call(this);
  this.val = val;
  this.toString = function(){ return "`"+this.val.toString();};
};
qqList.prototype = heir(Program.prototype);

function qqSplice(val) {
  Program.call(this);
  this.val = val;
};
qqSplice.prototype = heir(Program.prototype);

// primop expression
function primop(val) {
  Program.call(this);
  this.val = val;
};
primop.prototype = heir(Program.prototype);

// require-url
function req(uri) {
  Program.call(this);
  this.uri = uri;
  this.toString = function(){ return "(require "+this.uri+")"; };
};
req.prototype = heir(Program.prototype);

// provide
function provideStatement(val) {
  Program.call(this);
  this.val = val;
  this.toString = function(){ return "(provide "+this.val+")" };
};
provideStatement.prototype = heir(Program.prototype);

function reqUri(x) {
  return x.uri;
};

function requireFileP(x) {
  return isReq(x) && isString(reqUri(x));
};

function isSymbolred(x) {
  return (function (y) {
          return isSymbolExpr(y) && isSymbolEqualTo(y, x);
         });
};

function isRequireType(x, type) {
  return isReq(x) && isCons(reqUri(x)) && isSymbolred(type)(first(reqUri(x)));
};

// lib TODO
function isRequireLib(x) {
  return isRequireType(x, types.symbol("lib"));
};
// planet TODO
function isRequirePlanet(x) {
  return isRequireType(x, types.symbol("planet"));
};

// desugarAll : Listof SExps -> Listof SExps
function desugarAll(programs){
  var desugared = [];
  for(var i=0; i<programs.length; i++) desugared.push(programs[i].desugar());
  return desugared;
}