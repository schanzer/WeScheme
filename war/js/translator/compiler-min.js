(function(){function h(a,b){var c=[[],b||new compilerStructs.pinfo];return a.reduce(function(a,b){var c=b.desugar(a[1]);c[0].length?a[0]=a[0].concat(c[0]):a[0].push(c[0]);return[a[0],c[1]]},c)}function i(a,b,c,d,e){return new bindingFunction(a,b,c,d,[],!1,e)}function j(a,b){console.log("collecting definitions");var c=function(a,b){return a.reduce(function(a,b){return b.collectDefinitions(a)},b)}(a,b);console.log("collecting provides");c=function(a,b){return a.reduce(function(a,b){return b.collectProvides(a)},
b)}(a,c);console.log("analyzing uses");return function(a,b){return a.reduce(function(a,b){return b.analyzeUses(a,a.env)},b)}(a,c)}Program.prototype.desugar=function(a){return[this,a]};defFunc.prototype.desugar=function(a){a=this.body.desugar(a);return[new defFunc(this.name,this.args,a[0]),a[1]]};defVar.prototype.desugar=function(a){a=this.expr.desugar(a);return[new defVar(this.name,a[0]),a[1]]};defVars.prototype.desugar=function(a){a=this.expr.desugar(a);return[new defVars(this.names,a[0]),a[1]]};
defStruct.prototype.desugar=function(a){var b=this.name.toString(),c=this.fields.map(function(a){return a.toString()}),d=c.map(function(a){return b+"-"+a+"-set!"}),d=[b,"make-"+b,b+"?",b+"-ref",,b+"-set!"].concat(d).map(function(a){return new symbolExpr(a)}),e=new callExpr(new primop(new symbolExpr("make-struct-type")),[new symbolExpr(b),new booleanExpr("false"),new numberExpr(c.length),new numberExpr(0)]),d=[new defVars(d,e)],f=[];c.forEach(function(a,c){var d=new primop(new symbolExpr("make-struct-field-accessor")),
e=[new symbolExpr(b+"-ref"),new numberExpr(c),new booleanExpr("false")],d=new callExpr(d,e),d=new defVar(new symbolExpr(b+"-"+a),d);f.push(d)});return[d.concat(f),a]};beginExpr.prototype.desugar=function(a){a=h(this.exprs,a);return[new beginExpr(a[0]),a[1]]};lambdaExpr.prototype.desugar=function(a){a=this.body.desugar(a);return[new lambdaExpr(this.args,a[0]),a[1]]};localExpr.prototype.desugar=function(a){var a=h(this.defs,a),b=this.body.desugar(a[1]);return[new localExpr(a[0],b[0]),b[1]]};callExpr.prototype.desugar=
function(a){a=h([this.func].concat(this.args),a);return[new callExpr(a[0][0],a[0].slice(1)),a[1]]};ifExpr.prototype.desugar=function(a){a=h([this.predicate,this.consequence,this.alternative],a);return[new ifExpr(a[0][0],a[0][1],a[0][2]),a[1]]};letrecExpr.prototype.desugar=function(a){return(new localExpr(this.bindings.map(function(a){return new defVar(a.first,a.second)}),this.body)).desugar(a)};letExpr.prototype.desugar=function(a){var b=this.bindings.map(coupleFirst),c=this.bindings.map(coupleSecond);
return(new callExpr(new lambdaExpr(b,this.body),c)).desugar(a)};letStarExpr.prototype.desugar=function(a){for(var b=this.body,c=0;c<this.bindings.length;c++)b=new letExpr([this.bindings[c]],b);return b.desugar(a)};condExpr.prototype.desugar=function(a){for(var b=this.clauses[this.clauses.length-1].second,c=this.clauses.length-2;-1<c;c--)b=new ifExpr(this.clauses[c].first,this.clauses[c].second,b);return b.desugar(a)};andExpr.prototype.desugar=function(a){for(var b=this.exprs[this.exprs.length-1],
c=this.exprs.length-2;-1<c;c--)b=new ifExpr(this.exprs[c],b,new booleanExpr(new symbolExpr("false")));return b.desugar(a)};orExpr.prototype.desugar=function(a){var b=this.exprs.reduceRight(function(b,d){var e=a.gensym("tmp"),f=e[1],g=new couple(f,d);g.location=d.location;f=new letExpr([g],new ifExpr(f,f,b[0]));f.location=d.location;return[f.desugar(e[0])[0],b[1]]},[this.exprs.pop(),a]);return[b[0],b[1]]};Program.prototype.collectDefinitions=function(a){return a};defFunc.prototype.collectDefinitions=
function(a){var b=i(this.name.val,!1,this.args.length,!1,this.location);return a.accumulateDefinedBinding(b,a,this.location)};defVar.prototype.collectDefinitions=function(a){var b=new bindingConstant(this.name.val,!1,[],this.location);return a.accumulateDefinedBinding(b,a,this.location)};defVars.prototype.collectDefinitions=function(a){var b=this;return this.names.reduce(function(a,d){var e=new bindingConstant(d.val,!1,[],d.location);return a.accumulateDefinedBinding(e,a,b.location)},a)};defStruct.prototype.collectDefinitions=
function(a){var b=this.id.toString(),c=this.fields.map(function(a){return a.toString()}),d=b.location,e="make-"+b,f=b+"?",g=c.map(function(a){return b+"-"+a}),k=c.map(function(a){return b+"-"+a+"-set!"}),h=i(e,!1,c.length,!1,d),l=i(f,!1,1,!1,d),m=g.map(function(a){return i(a,!1,1,!1,d)}),j=k.map(function(a){return i(a,!1,2,!1,d)}),c=[new bindingStructure(b,!1,c,e,f,g,k,d),h,l].concat(m,j);return a.accumulateDefinedBindings(c,a,this.location)};req.prototype.collectDefinitions=function(){};Program.prototype.collectProvides=
function(a){return a};provideStatement.prototype.collectProvides=function(a){return this.clauses.reduce(function(a,c){if(a instanceof symbolExpr)c.definedNames.containsKey(a.val)?c.updateProvidedNames(c.providedNames.put(a.val,makeProvideBindingId(a))):throwError(types.Message([new ColoredPart(a.val,a.location),": provided name not defined"]));else if("struct-out"===a[0]&&2===a.length&&a[1]instanceof symbolExpr)if(c.definedNames.containsKey(a[1].val)&&isBindingStructure(c.definedNames.containsKey(a[1].val))){var d=
makeProvideBindingStructId(a[1]);c.updateProvidedNames(c.providedNames.put(a.val,d))}else throwError(types.Message([new ColoredPart(a.val,a[1].location),": provided struct not defined"]));else throwError(types.Message(["provide doesn't recognize the syntax of the clause: ",new ColoredPart(a.val,a.location)]))},a)};Program.prototype.analyzeUses=function(a){return a};defFunc.prototype.analyzeUses=function(a){a.env.extend(i(this.name.val,!1,this.args.length,!1,this.location));return(new lambdaExpr(this.args,
this.body)).analyzeUses(a)};defVar.prototype.analyzeUses=function(a){return this.expr.analyzeUses(a,a.env)};defVars.prototype.analyzeUses=function(a){return this.expr.analyzeUses(a,a.env)};beginExpr.prototype.analyzeUses=function(a,b){return this.exprs.reduce(function(a,d){return d.analyzeUses(a,b)},a)};lambdaExpr.prototype.analyzeUses=function(a){var b=this.args.reduce(function(a,b){return a.extend(new bindingConstant(b.val,!1,[],b.location))},a.env);return this.body.analyzeUses(a,b)};localExpr.prototype.analyzeUses=
function(a){var b=this.defs.reduce(function(a,b){return b.analyzeUses(a)},a),b=this.body.analyzeUses(b,b.env);b.env=a.env;return b};callExpr.prototype.analyzeUses=function(a,b){return[this.func].concat(this.args).reduce(function(a,d){return d.analyzeUses(a,b)},a)};ifExpr.prototype.analyzeUses=function(a,b){return[this.predicate,this.consequence,this.alternative].reduce(function(a,d){return d.analyzeUses(a,b)},a)};symbolExpr.prototype.analyzeUses=function(a,b){return b.lookup_context(this.val)?a.accumulateBindingUse(b.lookup_context(this.val),
a):a.accumulateFreeVariableUse(this.val,a)};Program.prototype.compile=function(a){return[this.val,a]};defFunc.prototype.compile=function(){throw"not implemented";};defVar.prototype.compile=function(){throw"not implemented";};defVars.prototype.compile=function(){throw"not implemented";};beginExpr.prototype.compile=function(){throw"not implemented";};lambdaExpr.prototype.compile=function(){throw"not implemented";};localExpr.prototype.compile=function(){throw"compiling locals is not implemented";};callExpr.prototype.compile=
function(){throw"compiling calls is not implemented";};ifExpr.prototype.compile=function(){throw"not implemented";};symbolExpr.prototype.compile=function(){throw"not implemented";};listExpr.prototype.compile=function(){};quotedExpr.prototype.compile=function(){};qqList.prototype.compile=function(){};primop.prototype.compile=function(){};quasiquotedExpr.prototype.compile=function(){};req.prototype.compile=function(){};provideStatement.prototype.compile=function(){};defStruct.prototype.compile=function(){throw"IMPOSSIBLE: define-struct should have been desugared";
};letStarExpr.prototype.compile=function(){throw"IMPOSSIBLE: letrec should have been desugared";};letExpr.prototype.compile=function(){throw"IMPOSSIBLE: let should have been desugared";};letStarExpr.prototype.compile=function(){throw"IMPOSSIBLE: let* should have been desugared";};letStarExpr.prototype.compile=function(){throw"IMPOSSIBLE: cond should have been desugared";};andExpr.prototype.compile=function(){throw"IMPOSSIBLE: and should have been desugared";};orExpr.prototype.compile=function(){throw"IMPOSSIBLE: or should have been desugared";
};window.analyze=function(a){return j(a,compilerStructs.getBasePinfo("base"))};window.compile=function(a,b){function c(a,b){var c=b.compile(a[1]),d=c[1];return[[c[0]].concat(a[0]),d]}var d=desugar(a,b),a=d[0],b=d[1],b=j(a,b);makeModulePrefixAndEnv(b);var e=a.filter(isDefinition),d=a.filter(function(a){return a instanceof req});a.filter(function(a){return a instanceof provideStatement});var f=a.filter(isExpression),b=d.reduce(c,[[],b])[1],g=e.reduce(c,[[],b]),e=g[0],b=g[1],f=f.reduce(c,[[],b]),g=f[0],
b=f[1],d=bcode-make-seq(compiled-d.concat(e,g));return[bcode-make-compilation-top(0,toplevel-prefix,d),b]};window.desugar=h})();
