function isSymbolEqualTo(a,b){a=a instanceof symbolExpr?a.val:a;b=b instanceof symbolExpr?b.val:b;return a===b}function cons(a,b){return[a].concat(b)}function isCons(a){return a instanceof Array&&1<=a.length}function isEmpty(a){return a instanceof Array&&0===a.length}function first(a){return a[0]}function rest(a){return a.slice(1)}function uniqueSymbols(){for(var a=list.sort(),b=0;b<arr.length-1;b++)if(a[b+1]==a[b])return!1;return!0}
var Location=function(a,b,c,f,i){this.sCol=a;this.sLine=b;this.offset=c;this.span=f;this.source=i;this.toString=function(){return"start ("+this.sCol+", "+this.sLine+"), end ("+this.eCol+","+this.eLine+") index "+this.i};this.toVector=function(){new types.vector(this.source,this.offset,this.sLine,this.sCol,this.sp)}};function couple(a,b){this.first=a;this.second=b;this.toString=function(){return"("+this.first.toString()+" "+this.second.toString()+")"}}function coupleFirst(a){return a.first}
function coupleSecond(a){return a.second}var Constant=function(a,b){this.val=a;this.location=b;this.toString=function(){return this.val.toString()}};
function throwError(a,b){b.source=b.source||"definitions";var c={type:"moby-failure","dom-message":["span",[["class","Error"]],["span",[["class","Message"]].concat(a)],["br",[],""],["span",[["class","Error.location"]],["span",[["class","location-reference"],["style","display:none"]],["span",[["class","location-offset"]],b.offset],["span",[["class","location-line"]],b.sLine],["span",[["class","location-column"]],b.sCol],["span",[["class","location-span"]],b.span],["span",[["class","location-id"]],
b.source]]]],"structured-error":'{"message": "'+a+'", "location": {"line": "'+b.sLine+'", "span": "'+b.span+'", "offset": "'+b.offset+'", "column": "'+b.sCol+'", "id": "'+b.source+'"}}'};console.log(c);throw JSON.stringify(c);}var heir=function(a){var b=function(){};b.prototype=a;return new b},Program=function(){this.toString=function(){return this.val.toString()}};
function defFunc(a,b,c){Program.call(this);this.name=a;this.args=b;this.body=c;this.toString=function(){return"(define ("+this.name.toString()+" "+this.args.join(" ")+")\n    "+this.body.toString()+")"}}defFunc.prototype=heir(Program.prototype);function defVar(a,b){Program.call(this);this.name=a;this.expr=b;this.toString=function(){return"(define "+this.name.toString()+" "+this.expr.toString()+")"}}defVar.prototype=heir(Program.prototype);
function defVars(a,b){Program.call(this);this.names=a;this.expr=b;this.toString=function(){return"(define ("+this.names.join(" ")+") "+this.expr.toString()+")"}}defVars.prototype=heir(Program.prototype);function defStruct(a,b){Program.call(this);this.name=a;this.fields=b;this.toString=function(){return"(define-struct "+this.name.toString()+" ("+this.fields.toString()+"))"}}defStruct.prototype=heir(Program.prototype);
function beginExpr(a){Program.call(this);this.exprs=a;this.toString=function(){return"(begin "+this.exprs.join(" ")+")"}}beginExpr.prototype=heir(Program.prototype);function lambdaExpr(a,b){Program.call(this);this.args=a;this.body=b;this.toString=function(){return"(lambda ("+this.args.join(" ")+") ("+this.body.toString()+"))"}}lambdaExpr.prototype=heir(Program.prototype);
function localExpr(a,b){Program.call(this);this.defs=a;this.body=b;this.toString=function(){return"(local ("+this.defs.toString()+") ("+this.body.toString()+"))"}}localExpr.prototype=heir(Program.prototype);function letrecExpr(a,b){this.bindings=a;this.body=b;this.toString=function(){return"(letrec ("+this.bindings.toString()+") ("+this.body.toString()+"))"}}
function letExpr(a,b){this.bindings=a;this.body=b;this.toString=function(){return"(let ("+this.bindings.toString()+") ("+this.body.toString()+"))"}}function letStarExpr(a,b){this.bindings=a;this.body=b;this.toString=function(){return"(let* ("+this.bindings.toString()+") ("+this.body.toString()+"))"}}function condExpr(a){this.clauses=a;this.toString=function(){return"(cond\n    "+this.clauses.join("\n    ")+")"}}
function andExpr(a){this.exprs=a;this.toString=function(){return"(and "+this.exprs.join(" ")+")"}}function orExpr(a){this.exprs=a;this.toString=function(){return"(or "+this.exprs.toString()+")"}}function callExpr(a,b){Program.call(this);this.func=a;this.args=b;this.toString=function(){return"("+this.func.toString()+" "+this.args.join(" ")+")"}}callExpr.prototype=heir(Program.prototype);
function ifExpr(a,b,c){Program.call(this);this.predicate=a;this.consequence=b;this.alternative=c;this.toString=function(){return"(if "+this.predicate.toString()+" "+this.consequence.toString()+" "+this.alternative.toString()+")"}}ifExpr.prototype=heir(Program.prototype);function timeExpr(a){Program.call(this);this.val=a}timeExpr.prototype=heir(Program.prototype);function symbolExpr(a){Program.call(this);this.val=a}symbolExpr.prototype=heir(Program.prototype);
function numberExpr(a){Program.call(this);this.val=a}numberExpr.prototype=heir(Program.prototype);function stringExpr(a){Program.call(this);this.val=a;this.toString=function(){return'"'+this.val.toString()+'"'}}stringExpr.prototype=heir(Program.prototype);function charExpr(a){Program.call(this);this.val=a;this.toString=function(){return"#\\"+this.val.toString()}}charExpr.prototype=heir(Program.prototype);
function listExpr(a){Program.call(this);this.val=a;this.toString=function(){return"(list "+this.val.toString()+")"}}listExpr.prototype=heir(Program.prototype);function mtListExpr(){Program.call(this)}mtListExpr.prototype=heir(Program.prototype);function booleanExpr(a){Program.call(this);a=a instanceof symbolExpr?a.val:a;this.val="true"===a||"#t"===a;this.toString=function(){return this.val?"#t":"#f"}}booleanExpr.prototype=heir(Program.prototype);
function quotedExpr(a){Program.call(this);this.val=a;this.toString=function(){return"'"+this.val.toString()}}quotedExpr.prototype=heir(Program.prototype);function quasiquotedExpr(a){Program.call(this);this.val=a;this.toString=function(){return"`"+this.val.toString()}}quasiquotedExpr.prototype=heir(Program.prototype);function qqList(a){Program.call(this);this.val=a;this.toString=function(){return"`"+this.val.toString()}}qqList.prototype=heir(Program.prototype);
function qqSplice(a){Program.call(this);this.val=a}qqSplice.prototype=heir(Program.prototype);function primop(a){Program.call(this);this.val=a}primop.prototype=heir(Program.prototype);function req(a){Program.call(this);this.uri=a;this.toString=function(){return"(require "+this.uri+")"}}req.prototype=heir(Program.prototype);function provideStatement(a){Program.call(this);this.val=a;this.toString=function(){return"(provide "+this.val+")"}}provideStatement.prototype=heir(Program.prototype);
function bindingConstant(a,b,c,f){this.name=a;this.moduleSource=b;this.permissions=c;this.loc=f;this.toString=function(){return this.name};return this}function bindingFunction(a,b,c,f,i,d,g){this.name=a;this.moduleSource=b;this.minArity=c;this.isVarArity=f;this.permissions=i;this.isCps=d;this.loc=g;this.toString=function(){return this.name};return this}
function bindingStructure(a,b,c,f,i,d,g,j,k){this.name=a;this.moduleSource=b;this.fields=c;this.constructor=f;this.predicate=i;this.accessors=d;this.mutators=g;this.permissions=j;this.loc=k;this.toString=function(){return this.name};return this}
function getTopLevelEnv(){return[["<",2,!0],["<=",2,!0],["=",2,!0],[">",2,!0],[">=",2,!0],["=~",3],["number->string",1],["even?",1],["odd?",1],["positive?",1],["negative?",1],["number?",1],["rational?",1],["quotient",2],["remainder",2],["numerator",1],["denominator",1],["integer?",1],["real?",1],["abs",1],["acos",1],["add1",1],["angle",1],["asin",1],["atan",1,!0],["ceiling",1],["complex?",1],["conjugate",1],["cos",1],["cosh",1],["denominator",1],["even?",1],["exact->inexact",1],["exact?",1],["exp",
1],["expt",2],["floor",1],["gcd",1,!0],["imag-part",1],["inexact->exact",1],["inexact?",1],["integer->char",1],["integer-sqrt",1],["integer?",1],["lcm",1,!0],["log",1],["magnitude",1],["make-polar",2],["make-rectangular",2],["max",1,!0],["min",1,!0],["modulo",2],["negative?",1],["number?",1],["numerator",1],["odd?",1],["positive?",1],["random",1],["rational?",1],["real-part",1],["real?",1],["round",1],["sgn",1],["sin",1],["sinh",1],["sqr",1],["sqrt",1],["sub1",1],["tan",1],["zero?",1],["+",0,!0],
["-",1,!0],["*",0,!0],["/",1,!0],["not",1],["false?",1],["boolean?",1],["boolean=?",2],["symbol->string",1],["symbol=?",2],["symbol?",1],["append",0,!0],["assq",2],["assv",2],["assoc",2],["caaar",1],["caadr",1],["caar",1],["cadar",1],["cadddr",1],["caddr",1],["cadr",1],["car",1],["cddar",1],["cdddr",1],["cddr",1],["cdr",1],["cdaar",1],["cdadr",1],["cdar",1],["cons?",1],["list?",1],["cons",2],["empty?",1],["length",1],["list",0,!0],["list*",1,!0],["list-ref",2],["remove",2],["member",2],["member?",
2],["memq",2],["memv",2],["null?",1],["pair?",1],["rest",1],["reverse",1],["first",1],["second",1],["third",1],["fourth",1],["fifth",1],["sixth",1],["seventh",1],["eighth",1],["box",1],["unbox",1],["set-box!",2],["box?",1],["make-posn",2],["posn-x",1],["posn-y",1],["posn?",1],["char->integer",1],["char-alphabetic?",1],["char-ci<=?",2,!0],["char-ci<?",2,!0],["char-ci=?",2,!0],["char-ci>=?",2,!0],["char-ci>?",2,!0],["char-downcase",1],["char-lower-case?",1],["char-numeric?",1],["char-upcase",1],["char-upper-case?",
1],["char-whitespace?",1],["char<=?",2,!0],["char<?",2,!0],["char=?",2,!0],["char>=?",2,!0],["char>?",2,!0],["char?",1],["format",1,!0],["list->string",1],["make-string",2],["replicate",2],["string",0,!0],["string->list",1],["string->number",1],["string->symbol",1],["string-alphabetic?",1],["string-append",0,!0],["string-ci<=?",2,!0],["string-ci<?",2,!0],["string-ci=?",2,!0],["string-ci>=?",2,!0],["string-ci>?",2,!0],["string-copy",1],["string-length",1],["string-lower-case?",1],["string-numeric?",
1],["string-ref",2],["string-upper-case?",1],["string-whitespace?",1],["string<=?",2,!0],["string<?",2,!0],["string=?",2,!0],["string>=?",2,!0],["string>?",2,!0],["string?",1],["substring",3],["string-ith",2],["int->string",1],["string->int",1],["explode",1],["implode",1],["eof-object?",1],["=~",3],["eq?",2],["equal?",2],["equal~?",3],["eqv?",2],["error",2],["identity",1],["struct?",1],["current-seconds",0],["andmap",1,!0],["apply",2,!0],["argmax",2],["argmin",2],["build-list",2],["build-string",
2],["compose",0,!0],["filter",2],["foldl",2,!0],["foldr",2,!0],["map",1,!0],["for-each",1,!0],["memf",2],["ormap",1,!0],["procedure?",1],["quicksort",2],["sort",2],["void",0,!0],["xml->s-exp",1],["build-vector",2],["make-vector",1,!0],["vector",0,!0],["vector-length",1],["vector-ref",2],["vector-set!",3],["vector->list",1],["list->vector",1],["vector?",1],["printf",1,!0],["display",1],["write",1],["newline",0],["call/cc",1],["procedure-arity",1],["check-expect",2],["EXAMPLE",2],["check-within",3],
["check-error",2],["make-hasheq",0],["make-hash",0],["hash-set!",3],["hash-ref",3],["hash-remove!",2],["hash-map",2],["hash-for-each",2],["hash?",1],["raise",1],["undefined?",1],["values",0,!0],["make-struct-type",4,!0],["make-struct-field-accessor",2,!0],["make-struct-field-mutator",2,!0],["current-continuation-marks",0,!1],["continuation-mark-set->list",2,!1],["scheme->prim-js",1,!1],["prim-js->scheme",1,!1],["procedure->cps-js-fun",1,!1],["procedure->void-js-fun",1,!1],["js-===",2,!1],["js-get-named-object",
1,!1],["js-get-field",2,!0],["js-set-field!",3,!1],["js-typeof",1,!1],["js-instanceof",2,!1],["js-call",2,!0],["js-new",1,!0],["js-make-hash",0,!0],["make-world-config",2,!0],["make-bb-info",2,!1],["bb-info?",1,!1],["bb-info-change-world",1,!1],["bb-info-toplevel-node",1,!1],["make-effect-type",4,!0],["effect?",1,!1],["world-with-effects",2,!1],["make-render-effect-type",4,!0],["render-effect-type?",1],["render-effect?",1],["make-render-effect-type",4,!0],["values",0,!0],["sleep",0,!0],["current-inexact-milliseconds",
0,!1],["make-exn",2,!1],["exn-message",1,!1],["exn-continuation-marks",1,!1]].reduce(function(a,b){if(2===b.length)return a.extendFunction(b[0],"moby/toplevel",b[1],!1,!1);if(3===b.length)return a.extendFunction(b[0],"moby/toplevel",b[1],b[3],!1)},["null","empty","true",,"false","eof","pi","e","js-undefined","js-null"].reduce(function(a,b){return a.extendConstant(b.toString(),"moby/toplevel",!1)},compilerStructs.emptyEnv()))}
(function(){function a(b){this.bindings=b;this.lookup=function(a){return this.bindings.containsKey(a)?this.bindings.get(a):!1};this.contains=function(a){return!1!==this.lookup(a)};this.keys=this.bindings.keys;this.extend=function(b){this.bindings.put(b.name,b);return new a(this.bindings)};this.extendFunction=function(a,b,c,j,d){return this.extend(new bindingFunction(a,b,c,j,[],!1,d))};this.extendConstant=function(a,b,c){return this.extend(new bindingConstant(a,b,[],c))};this.lookup_context=function(b){return b.context instanceof
a?b.context.contains(b)?b.context.lookup(b):!1:this.contains(b)?this.lookup(b):!1};this.toString=function(){return this.bindings.values().reduce(function(a,b){return a+"\n  |---"+b.name},"")}}function b(){return new a(types.makeLowLevelEqHash())}function c(){}function f(a,b){return-1<b.indexOf(a)?b.indexOf(a):!1}function i(){}var d={},g=types.makeLowLevelEqHash;d.keywords="cond,else,let,case,let*,letrec,quote,quasiquote,unquote,unquote-splicing,local,begin,if,or,and,when,unless,lambda,\u03bb,define,define-struct,define-values".split(",");
d.env=a;(function(a,b,c){this.name=a;this.isBoxed=b;this.depth=c}).prototype=heir(c.prototype);(function(a,b,c){this.name=a;this.pos=c;this.depth=b}).prototype=heir(c.prototype);(function(a){this.name=a}).prototype=heir(c.prototype);d.emptyEnv=b;d.getBasePinfo=function(a){var b=new d.pinfo;"moby"===a?b.env=extendEnv_ModuleBinding(getTopLevelEnv(a),mobyModuleBinding):"base"===a&&(b.env=getTopLevelEnv(a));return b};d.pinfo=function(a,c,l,m,n,o,p,q,r,s,t,u,v,w){this.env=a||new b;this.modules=c||[];this.usedBindingsHash=
l||g();this.freeVariables=m||[];this.gensymCounter=n||0;this.providedNames=o||g();this.definedNames=p||g();this.sharedExpressions=q||g();this.withLocationEmits=r||!0;this.allowRedefinition=s||!0;this.moduleResolver=t||new i;this.modulePathResolver=u||void 0;this.currentModulePath=v||"";this.declaredPermissions=w||[];this.isRedefinition=function(a){return this.env.lookup(a)};this.usedBindings=this.usedBindingsHash.values;this.accumulateDeclaredPermission=function(a){this.declaredPermissions=[[a,f]].concat(this.declaredPermissions);
return this};this.accumulateSharedExpression=function(a,b){this.sharedExpressions.put(makeLabeledTranslation(this.gensymCounter,b),a);return this};this.accumulateDefinedBinding=function(a,b){if(-1<d.keywords.indexOf(a.id))throwError(types.Message([new ColoredPart(a.id,b),": this is a reserved keyword and cannot be usedas a variable or function name"]));else if(!this.allowRedefinition&&isRedefinition(a.id)){var c=this.env.lookup(a.id);a.loc?throwError(types.Message([new ColoredPart(a.id,a.loc),": this name has a ",
new ColoredPart("previous definition",c.loc)," and cannot be re-defined"])):throwError(types.Message([new ColoredPart(a.id,a.loc),": this name has a ","previous definition"," and cannot be re-defined"]))}else return this.env.extend(a),this.definedNames.put(a.name,a),this};this.accumulateDefinedBindings=function(a,b){a.forEach(function(a){this.accumulateDefinedBinding(a,b)});return this};this.accumulateModuleBindings=function(a){a.forEach(function(){this.env.extend(binding)});return this};this.accumulateModule=
function(a){this.modules=[a].concat(this.modules);return this};this.accumulateBindingUse=function(a){this.usedBindingsHash.put(a.name,a);return this};this.accumulateFreeVariableUse=function(a){this.freeVariables=-1<this.freeVariables.indexOf(a)?this.freeVariables:[a].concat(this.freeVariables);return this};this.gensym=function(a){this.gensymCounter++;return[this,new symbolExpr(a+this.gensymCounter)]};this.permissions=function(){function a(b){return 0===b.length?b:-1<b.slice(1).indexOf(b[0])?a.slice(1):
[b[0]].concat(a.slice(1))}return a(this.usedBindings().reduce(function(a,b){if(b.isFunction)return b.functionPermissions.concat(a);if(b.isConstant)return b.constantPermissions.concat(a)},[]))};this.getExposedBindings=function(){function a(b){function d(a){return this.definedNames.get(a)}var h;this.definedNames.containsKey(b.stx)?h=c(h,this.definedNames.get(b.stx)):throwError(types.Message(["provided-name-not-defined: ",b.stx]));if(b instanceof structId)[h,d(h.structureConstructor),d(h.structurePredicate)].concat(h.structureAccessors.map(d),
h.structureMutators.map(d));else return[h]}function b(a){var c=this.declaredPermissions.filter(function(b){return b[0]===a.id});a.updatePermissions(c.map(function(a){return a[1]}));return a}function c(a,b){if(a instanceof structureId){if(b instanceof structure)return b;throwError(types.Message(["provided-structure-not-structure: ",b.stx]))}else return b}return this.providedNames.values.reduce(function(c,d){c.concat(b(a(d)))},[])};this.toString=function(){var a;a="pinfo-------------\n**env****: "+
this.env.toString();a+="\n**modules**: "+this.modules.join(",");a+="\n**used bindings**: "+this.usedBindings();a+="\n**free variables**: "+this.freeVariables.join(",");a+="\n**gensym counter**: "+this.gensymCounter;a+="\n**provided names**: "+this.providedNames.values();return a+="\n**defined names**: "+this.definedNames.values()}};window.compilerStructs=d})();
