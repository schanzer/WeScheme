/*
 - getrid of DefName, defBindings?
 - desugaring of structs, require, provide and local. proper handling of 'else' in cond
- preserve location information during desugaring
- add error messages to desugaring phase for eeeeeeeverything
- do test cases get desugared?
- Get plain error messages working, complete desugaring, write analyzer
*/

// COMMON STRUCTURES ////////////////////////////////////////
// everything here is used by multiple phases of the compiler

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
  
  this.compile = function(env, pinfo){
    throw "not implemented";
/*    var compiledNameAndPinfo = compileExpression(this.name, env, pinfo),
        compiledName = compiledNameAndPinfo[0],
        pinfo = compiledNameAndPinfo[1];
    var compiledLambdaAndPinfo = compileLambda(this.name, this.args, this.body, env, pinfo),
        compiledLambda = compiledLambdaAndPinfo[0],
        pinfo = compiledLambdaAndPinfo[1];
    var bytecode = bcode:make-def-values([compiledName], compiledLambda);
    return [bytecode, pinfo];
 */
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
  this.compile = function(env, pinfo){
    throw "not implemented";
/*    var compiledIdAndPinfo = compileExpression(this.name, env, pinfo),
      compiledId = compiledExpressionAndPinfo[0],
      pinfo = compiledExpressionAndPinfo[1];
    var compiledBodyAndPinfo = this.body.compile(env, pinfo),
        compiledBody = compiledBodyAndPinfo[0],
        pinfo = compiledBodyAndPinfo[1];
    var bytecode = bcode:make-def-values([compiledId], compiled-body);
    return [bytecode, pinfo];
 */
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
  this.compile = function(env, pinfo){
    throw "not implemented";
/*    var compiledIdsAndPinfo = compileExpression(this.names, env, pinfo),
        compiledIds = compiledIdsAndPinfo[0],
        pinfo = compiledIdsAndPinfo[1];
    var compiledBodyAndPinfo = this.body.compile(env, pinfo),
        compiledBody = compiledBodyAndPinfo[0],
        pinfo = compiledBodyAndPinfo[1];
    var bytecode = bcode:make-def-values(compiledIds, compiled-body);
    return [bytecode, pinfo];
 */
  };
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
  this.compile = function(env, pinfo){
    throw "not implemented";
/*    var compiledExpressionsAndPinfo = compileExpressions(this.exprs, env, pinfo),
        compiledExpressions = compiledExpressionsAndPinfo[0],
        pinfo1 = compiledExpressionsAndPinfo[1];
    var bytecode = bcode:make-seq(compiledExpressions);
    return [bytecode, pinfo1];
 */
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
  // Compile a lambda expression.  The lambda must close its free variables over the
  // environment.
  this.compile = function(env, pinfo){
    throw "not implemented";
/*    var freeVars = freeVariables(this.body,
                             foldl( (function(variable env){return env.push(variable)})
                                   , emptyEnv
                                   lambdaExpr.args));
    var closureVectorAndEnv = getClosureVectorAndEnv(this.args, freeVars, env),
        closureVector = closureVectorAndEnv[0],
        extendedEnv = closureVectorAndEnv[1];
    var compiledBodyAndPinfo = compileExpressionAndPinfo(this.body, extendedEnv, pinfo),
        compiledBody = compiledBodyAndPinfo[0],
        pinfo = compiledBodyAndPinfo[1];
    var lambdaArgs = new Array(this.args.length),
        closureArgs = new Array(closureVector.length);
    var bytecode = bcode:make-lam(null, [], lambdaExpr.args.length
                                  ,lambdaArgs.map((function(){return types.symbol("val");}))
                                  ,false
                                  ,closureVector
                                  ,closureArgs.map((function(){return types.symbol("val/ref");}))
                                  ,0
                                  ,compiledBody);
 */
    return [bytecode, pinfo];

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
  this.compile = function(env, pinfo){
    throw "not implemented";
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
  this.compile = function(env, pinfo){
    throw "not implemented";
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
  this.compile = function(env, pinfo){
    throw "not implemented";
/*    var compiledPredicateAndPinfo = this.predicate.compile(env, pinfo),
        compiledPredicate = compiledPredicateAndPinfo[0],
        pinfo = compiledPredicateAndPinfo[1];
    var compiledConsequenceAndPinfo = this.consequence.compile(env, pinfo),
        compiledConsequence = compiledConsequenceAndPinfo[0],
        pinfo = compiledConsequenceAndPinfo[1];
    var compiledAlternateAndPinfo = this.alternative.comppile(env), pinfo),
        compiledAlternate = compiledAlternateAndPinfo[0],
        pinfo = compiledAlternateAndPinfo[1];
    var bytecode = bcode:make-branch(compiledPredicate, compiledConsequence, compiledAlternate);
    return [bytecode, pinfo];
 */
  };
};

// time expression TODO
function timeExpr(val) {
  this.val = val;
  this.toString = function(){ return this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    return [this.val, pinfo];
  };
};

// symbol expression (ID)
function symbolExpr(val) {
  this.val = val;
  this.toString = function(){ return this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    throw "not implemented";
/*    var stackReference = envLookup(env, expr.val), bytecode;
    if(stackReference instanceof localStackRef){
      bytecode = bcode:make-localref(localStackRef.boxed, localStackRef.depth, false, false, false);
    } else if(stackReference instanceof globalStackRef){
      bytecode = bcode:make-toplevel(globalStackRef.depth, globalStackRef.pos, false, false);
    } else if(stackReference instanceof unboundStackRef){
      throw "Couldn't find "+expr.val+" in the environment";
    }
    return [bytecode, pinfo];
 */
  };
};

// number expression
function numberExpr(val) {
  this.val = val;
  this.toString = function(){ return this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    return [this.val, pinfo];
  };
};

// string expression
function stringExpr(val) {
  this.val = val;
  this.toString = function(){ return "\""+this.val.toString()+"\""; };
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    return [this.val, pinfo];
  };
};

// char expression
function charExpr(val) {
  this.val = val;
  this.toString = function(){ return "#\\"+this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    return [this.val, pinfo];
  };
};

// list expression
function listExpr(val) {
  this.val = val;
  this.toString = function(){ return "(list "+this.val.toString() + ")"; };
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    throw "not implemented";
  };
};

// mtList expression TODO
function mtListExpr() {
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    throw "not implemented";
  };
};

// boolean expression
function booleanExpr(sym) {
  sym = (sym instanceof symbolExpr)? sym.val : sym;
  this.val = (sym.val === "true" || sym.val === "#t");
  this.toString = function(){ return this.val? "#t" : "#f";};
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    return [this.val, pinfo];
  };
};

// quoted expression TODO
function quotedExpr(val) {
  this.val = val;
  this.toString = function(){ return "'"+this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    throw "not implemented";
    return [this.val, pinfo];
  };
};

// quasiquoted expression TODO
function quasiquotedExpr(val) {
  this.val = val;
  this.toString = function(){ return "`"+this.val.toString(); };
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    return [this.val, pinfo];
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
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    return [this.val, pinfo];
  };
};

// quasiquoted list expression TODO
function qqList(val) {
  this.val = val;
  this.toString = function(){ return "`"+this.val.toString();};
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    return [this.val, pinfo];
  };
};

function qqSplice(val) {
  this.val = val;
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    return [this.val, pinfo];
  };
};


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
  this.compile = function(env, pinfo){
    throw "not implemented";
  };
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
  this.compile = function(env, pinfo){
    throw "not implemented";
  };
};
function reqUri(x) {
  return x.uri;
};

function requireFileP(x) {
  return isReq(x) && isString(reqUri(x));
};

function isisSymbolred(x) {
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

////////////////////////////////// PROVIDE /////////////////////////////
function provideStatement(val) {
  this.val = val;
  this.toString = function(){ return "(provide "+this.val+")" };
  this.desugar = function(pinfo){ return this; };
  this.compile = function(env, pinfo){
    throw "not implemented";
  };
};
