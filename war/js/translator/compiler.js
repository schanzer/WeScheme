/*
 TODO
 - proper handling of 'else' in cond
 - gensym when desugaring and
*/
(function () {
 'use strict';

 // BINDING STRUCTS ///////////////////////////////////////////////////////
 function provideBindingId(stx){ this.stx = stx;}
 function provideBindingStructId(stx){ this.stx = stx;}
 
 // DESUGARING ////////////////////////////////////////////////////////////////
 
 // desugarProgram : Listof Programs null/pinfo -> [Listof Programs, pinfo]
 // desugar each program, appending those that desugar to multiple programs
 function desugarProgram(programs, pinfo){
      var acc = [ [], (pinfo || new compilerStructs.pinfo())];
      return programs.reduce((function(acc, p){
            var desugaredAndPinfo = p.desugar(acc[1]);
            if(desugaredAndPinfo[0].length){
              acc[0] = acc[0].concat(desugaredAndPinfo[0]);
            } else {
              acc[0].push(desugaredAndPinfo[0]);
            }
            return [acc[0], desugaredAndPinfo[1]];
        }), acc);
 }
 
 // Program.prototype.desugar: pinfo -> [Program, pinfo]
 Program.prototype.desugar = function(pinfo){ return [this, pinfo]; };
 defFunc.prototype.desugar = function(pinfo){
    var bodyAndPinfo = this.body.desugar(pinfo);
    return [new defFunc(this.name, this.args, bodyAndPinfo[0]), bodyAndPinfo[1]];
 };
 defVar.prototype.desugar = function(pinfo){
    var exprAndPinfo = this.expr.desugar(pinfo);
    return [new defVar(this.name, exprAndPinfo[0]), exprAndPinfo[1]];
 };
 defVars.prototype.desugar = function(pinfo){
    var exprAndPinfo = this.expr.desugar(pinfo);
    return [new defVars(this.names, exprAndPinfo[0]), exprAndPinfo[1]];
 };
 defStruct.prototype.desugar = function(pinfo){
    var name = this.name.toString(),
        fields = this.fields.map(function(f){return f.toString();}),
        mutatorIds = fields.map(function(field){return name+'-'+field+'-set!';}),
        ids = [name, 'make-'+name, name+'?', name+'-ref', , name+'-set!'].concat(mutatorIds),
        idSymbols = ids.map(function(id){return new symbolExpr(id);}),
        call = new callExpr(new primop(new symbolExpr('make-struct-type')),
                            [new symbolExpr(name),
                             new booleanExpr("false"),
                             new numberExpr(fields.length),
                             new numberExpr(0)]);
    var defineValuesStx = [new defVars(idSymbols, call)],
        selectorStx = [];
    // given a field, make a definition that binds struct-field to the result of
    // a make-struct-field accessor call in the runtime
    function makeAccessorDefn(f, i){
      var runtimeOp = new primop(new symbolExpr('make-struct-field-accessor')),
          runtimeArgs = [new symbolExpr(name+'-ref'), new numberExpr(i), new booleanExpr("false")],
          runtimeCall = new callExpr(runtimeOp, runtimeArgs),
          defineVar = new defVar(new symbolExpr(name+'-'+f), runtimeCall);
      selectorStx.push(defineVar);
    }
    fields.forEach(makeAccessorDefn);
    return [defineValuesStx.concat(selectorStx), pinfo];
 };
 beginExpr.prototype.desugar = function(pinfo){
    var exprsAndPinfo = desugarProgram(this.exprs, pinfo);
    return [new beginExpr(exprsAndPinfo[0]), exprsAndPinfo[1]];
 };
 lambdaExpr.prototype.desugar = function(pinfo){
    var bodyAndPinfo = this.body.desugar(pinfo);
    return [new lambdaExpr(this.args, bodyAndPinfo[0]), bodyAndPinfo[1]];
 };
 localExpr.prototype.desugar = function(pinfo){
    var defnsAndPinfo = desugarProgram(this.defs, pinfo);
    var exprAndPinfo = this.body.desugar(defnsAndPinfo[1]);
    return [new localExpr(defnsAndPinfo[0], exprAndPinfo[0]), exprAndPinfo[1]];
 };
 callExpr.prototype.desugar = function(pinfo){
    var exprsAndPinfo = desugarProgram([this.func].concat(this.args), pinfo);
    return [new callExpr(exprsAndPinfo[0][0], exprsAndPinfo[0].slice(1)),
            exprsAndPinfo[1]];
 };
 ifExpr.prototype.desugar = function(pinfo){
    var exprsAndPinfo = desugarProgram([this.predicate,
                                        this.consequence,
                                        this.alternative],
                                       pinfo);
    return [new ifExpr(exprsAndPinfo[0][0], exprsAndPinfo[0][1], exprsAndPinfo[0][2]),
            exprsAndPinfo[1]];
 };

 // letrecs become locals
 letrecExpr.prototype.desugar = function(pinfo){
    function bindingToDefn(b){return new defVar(b.first, b.second);};
    return new localExpr(this.bindings.map(bindingToDefn), this.body).desugar(pinfo);
 };
 // lets become calls
 letExpr.prototype.desugar = function(pinfo){
    var ids   = this.bindings.map(coupleFirst),
        exprs = this.bindings.map(coupleSecond);
    return new callExpr(new lambdaExpr(ids, this.body), exprs).desugar(pinfo);
 };
 // let*s become nested lets
 letStarExpr.prototype.desugar = function(pinfo){
    var body = this.body;
    for(var i=0; i<this.bindings.length; i++){
      body = new letExpr([this.bindings[i]], body);
    }
    return body.desugar(pinfo);
 };
 // conds become nested ifs
 condExpr.prototype.desugar = function(pinfo){
    var expr = this.clauses[this.clauses.length-1].second;
    for(var i=this.clauses.length-2; i>-1; i--){
      expr = new ifExpr(this.clauses[i].first,
                        this.clauses[i].second,
                        expr);
    }
    return expr.desugar(pinfo);
 };
 // ands become nested ifs
 andExpr.prototype.desugar = function(pinfo){
    var expr = this.exprs[this.exprs.length-1]; // ASSUME length >=2!!!
    for(var i=this.exprs.length-2; i>-1; i--){
      expr = new ifExpr(this.exprs[i], expr, new booleanExpr(new symbolExpr("false")));
    }
    return expr.desugar(pinfo);
 };
 // ors become nested
 orExpr.prototype.desugar = function(pinfo){
    // grab the last expr, and remove it from the list and desugar
    var expr = this.exprs.pop();
 
    // given a desugared chain, add this expr to the chain
    // we optimize the predicate/consequence by binding the expression to a temp symbol
    function convertToNestedIf(restAndPinfo, expr){
 console.log('converting '+expr.toString());
      var pinfoAndTempSym = pinfo.gensym('tmp'),
          tmpSym = pinfoAndTempSym[1],  // create a temp symbol 's'
          tmpBinding = new couple(tmpSym, expr); // (let ((s expr)) (if s s (...))
      tmpBinding.location = expr.location;
      var let_exp = new letExpr([tmpBinding], new ifExpr(tmpSym, tmpSym, restAndPinfo[0]));
      let_exp.location = expr.location;
      var let_expAndPinfo = let_exp.desugar(pinfoAndTempSym[0])
      return [let_expAndPinfo[0], restAndPinfo[1]];
    }
    var exprsAndPinfo = this.exprs.reduceRight(convertToNestedIf, [expr, pinfo]);
    return [exprsAndPinfo[0], exprsAndPinfo[1]];
 };
 
 // extend the Program class to collect definitions
 // Program.collectDefnitions: pinfo -> pinfo
 Program.prototype.collectDefinitions = function(pinfo){ return pinfo; };

 // bf: symbol path number boolean string -> binding:function
 // Helper function.
 function bf(name, modulePath, arity, vararity, loc){
    return new bindingFunction(name, modulePath, arity, vararity, [], false, loc);
 }
 defFunc.prototype.collectDefinitions = function(pinfo){
    var binding = bf(this.name.val, false, this.args.length, false, this.location);
    return pinfo.accumulateDefinedBinding(binding, pinfo, this.location);
 };
 defVar.prototype.collectDefinitions = function(pinfo){
    var binding = new bindingConstant(this.name.val, false, [],this.location)
    return pinfo.accumulateDefinedBinding(binding, pinfo, this.location);
 };
 defVars.prototype.collectDefinitions = function(pinfo){
    var that = this;
    return this.names.reduce(function(pinfo, id){
      var binding = new bindingConstant(id.val, false, [], id.location);
      return pinfo.accumulateDefinedBinding(binding, pinfo, that.location);
    }, pinfo);
 };
 defStruct.prototype.collectDefinitions = function(pinfo){
    var id = this.id.toString(),
        fields = this.fields.map(function(f){return f.toString();}),
        loc = id.location,
        // build all the struct IDs
        constructorId = 'make-'+id,
        predicateId = id+'?',
        selectorIds = fields.map(function(f){return id+'-'+f;}),
        mutatorIds  = fields.map(function(f){return id+'-'+f+'-set!';}),
        // build all the bindings
        constructor = bf(constructorId, false, fields.length, false, loc),
        predicate = bf(predicateId, false, 1, false, loc),
        selectors = selectorIds.map(function(id){return bf(id, false, 1, false, loc);}),
        mutators  = mutatorIds.map(function(id){return bf(id, false, 2, false, loc);}),
        structure = new bindingStructure(id, false, fields, constructorId,
                                                predicateId, selectorIds, mutatorIds, loc),
        bindings = [structure, constructor, predicate].concat(selectors, mutators);
    return pinfo.accumulateDefinedBindings(bindings, pinfo, this.location);
 };
 req.prototype.collectDefinitions = function(pinfo){
 }
 
 // extend the Program class to collect provides
 // Program.collectProvides: pinfo -> pinfo
 Program.prototype.collectProvides = function(pinfo){
    return pinfo;
 };
 provideStatement.prototype.collectProvides = function(pinfo){
    // collectProvidesFromClause : clause pinfo -> pinfo
    function collectProvidesFromClause(clause, pinfo){
      // if it's a symbol, make sure it's defined (otherwise error)
      if (clause instanceof symbolExpr){
        if(pinfo.definedNames.containsKey(clause.val)){
          pinfo.updateProvidedNames(pinfo.providedNames.put(clause.val, makeProvideBindingId(clause)));
        } else {
          throwError(types.Message([new ColoredPart(clause.val, clause.location),
                                    ": provided name not defined"]));
        }
      // if it's a struct provide and the format is valid, make sure it's defined (otherwise error)
      } else if(clause[0] === "struct-out" && clause.length === 2 && clause[1] instanceof symbolExpr){
          if(pinfo.definedNames.containsKey(clause[1].val) &&
             isBindingStructure(pinfo.definedNames.containsKey(clause[1].val))){
              var b = makeProvideBindingStructId(clause[1]);
              pinfo.updateProvidedNames(pinfo.providedNames.put(clause.val, b));
          } else {
              throwError(types.Message([new ColoredPart(clause.val, clause[1].location),
                                        ": provided struct not defined"]));
          }
      // anything with a different format throws an error
      } else {
        throwError(types.Message(["provide doesn't recognize the syntax of the clause: ",
                                  new ColoredPart(clause.val, clause.location)]));
      }
    }
    return this.clauses.reduce(collectProvidesFromClause, pinfo);
  };
 
 
 // extend the Program class to analyzing uses
 // Program.analyzeUses: pinfo -> pinfo
 Program.prototype.analyzeUses = function(pinfo, env){
    return pinfo;
 };
 defFunc.prototype.analyzeUses = function(pinfo, env){
    // extend the environment with the function, then analyze as a lambda
    pinfo.env.extend(bf(this.name.val, false, this.args.length, false, this.location));
    var lambda = new lambdaExpr(this.args, this.body);
    return lambda.analyzeUses(pinfo);
 };
 defVar.prototype.analyzeUses = function(pinfo, env){
    return this.expr.analyzeUses(pinfo, pinfo.env);
 };
 defVars.prototype.analyzeUses = function(pinfo, env){
    return this.expr.analyzeUses(pinfo, pinfo.env);
 };
 beginExpr.prototype.analyzeUses = function(pinfo, env){
    return this.exprs.reduce(function(p, expr){return expr.analyzeUses(p, env);}, pinfo);
 };
 lambdaExpr.prototype.analyzeUses = function(pinfo, env){
    var env1 = pinfo.env,
        env2 = this.args.reduce(function(env, arg){
          return env.extend(new bindingConstant(arg.val, false, [], arg.location));
        }, env1);
    return this.body.analyzeUses(pinfo, env2);
 };
 localExpr.prototype.analyzeUses = function(pinfo, env){
    var nestedPinfo = this.defs.reduce(function(p, d){return d.analyzeUses(p);}, pinfo),
        body_pinfo = this.body.analyzeUses(nestedPinfo, nestedPinfo.env);
    body_pinfo.env = pinfo.env;
    return body_pinfo;
 };
 callExpr.prototype.analyzeUses = function(pinfo, env){
    return [this.func].concat(this.args).reduce(function(p, arg){
                            return arg.analyzeUses(p, env);
                            }, pinfo);
 }
 ifExpr.prototype.analyzeUses = function(pinfo, env){
    var exps = [this.predicate, this.consequence, this.alternative];
    return exps.reduce(function(p, exp){
                            return exp.analyzeUses(p,env);
                            }, pinfo);
 };
 symbolExpr.prototype.analyzeUses = function(pinfo, env){
    if(env.lookup_context(this.val)){
      return pinfo.accumulateBindingUse(env.lookup_context(this.val), pinfo);
    } else {
      return pinfo.accumulateFreeVariableUse(this.val, pinfo);
    }
 };

 
 // extend the Program class to include compilation
 // compile: pinfo -> [bytecode, pinfo]
 Program.prototype.compile = function(pinfo){
    return [this.val, pinfo];
 };
 
 // override these functions for Programs that require it
 defFunc.prototype.compile = function(env, pinfo){
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
 
 defVar.prototype.compile = function(env, pinfo){
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

 defVars.prototype.compile = function(env, pinfo){
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
 
 beginExpr.prototype.compile = function(env, pinfo){
    throw "not implemented";
  /*    var compiledExpressionsAndPinfo = compileExpressions(this.exprs, env, pinfo),
          compiledExpressions = compiledExpressionsAndPinfo[0],
          pinfo1 = compiledExpressionsAndPinfo[1];
      var bytecode = bcode:make-seq(compiledExpressions);
      return [bytecode, pinfo1];
   */
 };
 
 // Compile a lambda expression.  The lambda must close its free variables over the
 // environment.
 lambdaExpr.prototype.compile = function(env, pinfo){
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
                                    ,lambdaArgs.map((function(){return new symbolExpr("val");}))
                                    ,false
                                    ,closureVector
                                    ,closureArgs.map((function(){return new symbolExpr("val/ref");}))
                                    ,0
                                    ,compiledBody);
   */
    return [bytecode, pinfo];
 };
 
 localExpr.prototype.compile = function(env, pinfo){
    throw "compiling locals is not implemented";
 };
 
 callExpr.prototype.compile = function(env, pinfo){
    throw "compiling calls is not implemented";
 };
 
 ifExpr.prototype.compile = function(env, pinfo){
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
 
 symbolExpr.prototype.compile = function(env, pinfo){
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
 
 listExpr.prototype.compile = function(env, pinfo){}
 quotedExpr.prototype.compile = function(env, pinfo){}
 qqList.prototype.compile = function(env, pinfo){}
 primop.prototype.compile = function(env, pinfo){}
 quasiquotedExpr.prototype.compile = function(env, pinfo){}
 req.prototype.compile = function(pinfo){};
 provideStatement.prototype.compile = function(env, pinfo){};
 defStruct.prototype.compile = function(env, pinfo){ throw "IMPOSSIBLE: define-struct should have been desugared"; };
 letStarExpr.prototype.compile = function(env, pinfo){ throw "IMPOSSIBLE: letrec should have been desugared"; };
 letExpr.prototype.compile = function(env, pinfo){ throw "IMPOSSIBLE: let should have been desugared"; };
 letStarExpr.prototype.compile = function(env, pinfo){ throw "IMPOSSIBLE: let* should have been desugared"; };
 letStarExpr.prototype.compile = function(env, pinfo){ throw "IMPOSSIBLE: cond should have been desugared"; };
 andExpr.prototype.compile = function(env, pinfo){ throw "IMPOSSIBLE: and should have been desugared" };
 orExpr.prototype.compile = function(env, pinfo){ throw "IMPOSSIBLE: or should have been desugared"; };

/////////////////////////////////////////////////////////////
 function analyze(programs){
    return programAnalyzeWithPinfo(programs, compilerStructs.getBasePinfo("base"));
 }
 
 // programAnalyzerWithPinfo : [listof Programs], pinfo -> pinfo
 // build up pinfo by looking at definitions, provides and uses
 function programAnalyzeWithPinfo(programs, pinfo){
   // collectDefinitions: [listof Programs] pinfo -> pinfo
   // Collects the definitions either imported or defined by this program.
   function collectDefinitions(programs, pinfo){
     // FIXME: this does not yet say anything if a definition is introduced twice
     // in the same lexical scope.  We must do this error check!
     return programs.reduce((function(pinfo, p){
                             return p.collectDefinitions(pinfo);
                             })
                            , pinfo);
   }
   // collectProvides: [listof Programs] pinfo -> pinfo
   // Walk through the program and collect all the provide statements.
   function collectProvides(programs, pinfo){
      return programs.reduce((function(pinfo, p){
                                return p.collectProvides(pinfo)
                              })
                             , pinfo);
   }
   // analyzeUses: [listof Programs] pinfo -> pinfo
   // Collects the uses of bindings that this program uses.
    function analyzeUses(programs, pinfo){
      return programs.reduce((function(pinfo, p){
                                return p.analyzeUses(pinfo, pinfo.env);
                              })
                             , pinfo);
    }
    console.log("collecting definitions");
    var pinfo1 = collectDefinitions(programs, pinfo);
    console.log("collecting provides");
    var pinfo2 = collectProvides(programs, pinfo1);
    console.log("analyzing uses");
    return analyzeUses(programs, pinfo2);
 }
 
 // compile-compilation-top: program pinfo -> bytecode
 function compile(program, pinfo){
    // desugaring pass
    var programAndPinfo = desugar(program, pinfo),
        program = programAndPinfo[0],
        pinfo = programAndPinfo[1];
    // analysis pass
    var pinfo = programAnalyzeWithPinfo(program, pinfo);

    // The toplevel is going to include all of the defined identifiers in the pinfo
    // The environment will refer to elements in the toplevel.
    var toplevelPrefixAndEnv = makeModulePrefixAndEnv(pinfo),
      toplevelPrefix = toplevelPrefixAndEnv[0],
      env = toplevelPrefixAndEnv[1];
   
    // pull out separate program components for ordered compilation
    var defns    = program.filter(isDefinition),
        requires = program.filter((function(p){return (p instanceof req);})),
        provides = program.filter((function(p){return (p instanceof provideStatement);})),
        exprs    = program.filter(isExpression);
 
    // Program [bytecodes, pinfo, env?] -> [bytecodes, pinfo]
    // compile the program, then add the bytecodes and pinfo information to the acc
    function compileAndCollect(acc, p){
      var compiledProgramAndPinfo = p.compile(acc[1]),
          compiledProgram = compiledProgramAndPinfo[0],
          pinfo = compiledProgramAndPinfo[1];
      return [[compiledProgram].concat(acc[0]), pinfo];
    }
 
    var compiledRequiresAndPinfo = requires.reduce(compileAndCollect, [[], pinfo]),
        compiledRequires = compiledRequiresAndPinfo[0],
        pinfo = compiledRequiresAndPinfo[1];
    var compiledDefinitionsAndPinfo = defns.reduce(compileAndCollect, [[], pinfo]),
        compiledDefinitions = compiledDefinitionsAndPinfo[0],
        pinfo = compiledDefinitionsAndPinfo[1];
    var compiledExpressionsAndPinfo = exprs.reduce(compileAndCollect, [[], pinfo]),
        compiledExpressions = compiledExpressionsAndPinfo[0],
        pinfo = compiledExpressionsAndPinfo[1];
 
    // generate the bytecode for the program and return it, along with the program info
    var bytecode = bcode-make-seq(compiled-requires.concat(compiledDefinitions, compiledExpressions));
    return [bcode-make-compilation-top(0, toplevel-prefix, bytecode), pinfo];
 }
 /////////////////////
 /* Export Bindings */
 /////////////////////
 window.analyze = analyze;
 window.compile = compile;
 window.desugar = desugarProgram;
})();