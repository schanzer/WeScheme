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

// uniqueSymbols : [listof SymbolExprs] -> Boolean
// sort the array, and return true unless a duplicate is found
function uniqueSymbols(lst){
  var sorted_arr = list.sort(); // You can define the comparing function here.
  var results = [];
  for (var i = 0; i < arr.length - 1; i++) {
    if (sorted_arr[i + 1] == sorted_arr[i]) {
      return false;
    }
  }
  return true;
}
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
  this.toVector = function(){new types.vector(this.source, this.offset, this.sLine, this.sCol, this.sp)};
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
  // -> String
  this.toString = function(){ return this.val.toString(); };
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
};
defStruct.prototype = heir(Program.prototype);

// Begin expression
function beginExpr(exprs) {
  Program.call(this);
  this.exprs = exprs;
  this.toString = function(){
    return "(begin "+this.exprs.join(" ")+")";
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
};
localExpr.prototype = heir(Program.prototype);

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

// cond expression
function condExpr(clauses) {
  this.clauses = clauses;
  this.toString = function(){
    return "(cond\n    "+this.clauses.join("\n    ")+")";
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

// application expression
function callExpr(func, args) {
  Program.call(this);
  this.func = func;
  this.args = args;
  this.toString = function(){
    return "("+this.func.toString()+" "+this.args.join(" ")+")";
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