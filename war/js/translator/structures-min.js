function isSymbolEqualTo(a,b){a=a instanceof symbolExpr?a.val:a;b=b instanceof symbolExpr?b.val:b;return a.val===b.val}function cons(a,b){return[a].concat(b)}function isCons(a){return a instanceof Array&&1<=a.length}function isEmpty(a){return a instanceof Array&&0===a.length}function first(a){return a[0]}function rest(a){return a.slice(1)}function uniqueSymbols(){for(var a=list.sort(),b=0;b<arr.length-1;b++)if(a[b+1]==a[b])return!1;return!0}
var Location=function(a,b,c,d,e){this.sCol=a;this.sLine=b;this.offset=c;this.span=d;this.source=e;this.toString=function(){return"start ("+this.sCol+", "+this.sLine+"), end ("+this.eCol+","+this.eLine+") index "+this.i};this.toVector=function(){new types.vector(this.source,this.offset,this.sLine,this.sCol,this.sp)}};function couple(a,b){this.first=a;this.second=b;this.toString=function(){return"("+this.first.toString()+" "+this.second.toString()+")"}}function coupleFirst(a){return a.first}
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
function listExpr(a){Program.call(this);this.val=a;this.toString=function(){return"(list "+this.val.toString()+")"}}listExpr.prototype=heir(Program.prototype);function mtListExpr(){Program.call(this)}mtListExpr.prototype=heir(Program.prototype);function booleanExpr(a){Program.call(this);a=a instanceof symbolExpr?a.val:a;this.val="true"===a.val||"#t"===a.val;this.toString=function(){return this.val?"#t":"#f"}}booleanExpr.prototype=heir(Program.prototype);
function quotedExpr(a){Program.call(this);this.val=a;this.toString=function(){return"'"+this.val.toString()}}quotedExpr.prototype=heir(Program.prototype);function quasiquotedExpr(a){Program.call(this);this.val=a;this.toString=function(){return"`"+this.val.toString()}}quasiquotedExpr.prototype=heir(Program.prototype);function qqList(a){Program.call(this);this.val=a;this.toString=function(){return"`"+this.val.toString()}}qqList.prototype=heir(Program.prototype);
function qqSplice(a){Program.call(this);this.val=a}qqSplice.prototype=heir(Program.prototype);function primop(a){Program.call(this);this.val=a}primop.prototype=heir(Program.prototype);function req(a){Program.call(this);this.uri=a;this.toString=function(){return"(require "+this.uri+")"}}req.prototype=heir(Program.prototype);function provideStatement(a){Program.call(this);this.val=a;this.toString=function(){return"(provide "+this.val+")"}}provideStatement.prototype=heir(Program.prototype);
