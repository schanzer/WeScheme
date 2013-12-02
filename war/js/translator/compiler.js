/*
 Functions that every Expr should have:
 - export programAnalyze and programAnalyzeWithPinfo
*/
(function () {
 'use strict';
 
 // extend the Program class to collect definitions
 // Program.collectDefnitions: pinfo -> pinfo
 Program.prototype.collectDefinitions = function(pinfo){
    return pinfo;
 };
 defFunc.prototype.collectDefinitions = function(pinfo){
 };
 defVar.prototype.collectDefinitions = function(pinfo){
 };
 defVars.prototype.collectDefinitions = function(pinfo){
 };
 req.prototype.collectDefinitions = function(pinfo){
 }
 
 
 // extend the Program class to analyzing uses
 // Program.analyzeUses: pinfo -> pinfo
 Program.prototype.analyzeUses = function(pinfo){
    return pinfo;
 };
 defFunc.prototype.analyzeUses = function(pinfo){
 };
 defVar.prototype.analyzeUses = function(pinfo){
 };
 defVars.prototype.analyzeUses = function(pinfo){
 };
 beginExpr.prototype.analyzeUses = function(pinfo){
 };
 lambdaExpr.prototype.analyzeUses = function(pinfo){
 };
 localExpr.prototype.analyzeUses = function(pinfo){
 };
 callExpr.prototype.analyzeUses = function(pinfo){
 }
 ifExpr.prototype.analyzeUses = function(pinfo){
 };
 symbolExpr.prototype.analyzeUses = function(pinfo){
 };
 listExpr.prototype.analyzeUses = function(pinfo){
 }
 quasiquotedExpr.prototype.analyzeUses = function(pinfo){
 }
 qqList.prototype.analyzeUses = function(pinfo){
 }
 primop.prototype.analyzeUses = function(pinfo){
 }

 
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
 
 defStruct.prototype.collectDefinitions = function(pinfo){
 };
 defStruct.prototype.analyzeUses = function(pinfo){
 };
 defStruct.prototype.compile = function(env, pinfo){
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
                                    ,lambdaArgs.map((function(){return types.symbol("val");}))
                                    ,false
                                    ,closureVector
                                    ,closureArgs.map((function(){return types.symbol("val/ref");}))
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
 
 listExpr.prototype.compile = function(env, pinfo){
 }
 quotedExpr.prototype.compile = function(env, pinfo){
 }
 qqList.prototype.compile = function(env, pinfo){
 }
 primop.prototype.compile = function(env, pinfo){
 }
 quasiquotedExpr.prototype.compile = function(env, pinfo){
 }
 req.prototype.compile = function(pinfo){
 };
 provideStatement.prototype.compile = function(env, pinfo){
 };

/////////////////////////////////////////////////////////////
 function analyze(programs){
    programAnalyzeWithPinfo(programs, getBasePinfo("base"));
 }
 
 // programAnalyzerWithPinfo : [listof Programs], pinfo -> pinfo
 // build up pinfo by looking at definitions, provides and uses
 function programAnalyzerWithPinfo(programs, pinfo){

  // collectDefinitions: [listof Programs] pinfo -> pinfo
   // Collects the definitions either imported or defined by this program.
   function collectDefinitions(programs, pinfo){
     // FIXME: this does not yet say anything if a definition is introduced twice
     // in the same lexical scope.  We must do this error check!
     return programs.reduce((function(p, pinfo){
                             return p.collectDefinitions(pinfo);
                             })
                            , pinfo);
   }
   // collectProvides: [listof Programs] pinfo -> pinfo
   // Walk through the program and collect all the provide statements.
   function collectProvides(programs, pinfo){
      function collectProvide(p, pinfo){
        return pinfo;
      }
      return programs.reduce((function(p, pinfo){
                                return (p instanceof provideStatement)?
                                  collectProvide(p, pinfo) : pinfo;
                              })
                             , pinfo);
   }
   // analyzeUses: [listof Programs] pinfo -> pinfo
   // Collects the uses of bindings that this program uses.
    function analyzeUses(programs, pinfo){
      return programs.reduce((function(p, pinfo){
                                return p.analyzeUses(pinfo);
                              })
                             , pinfo);
    }

    var pinfo1 = collectDefinitions(programs, pinfo),
        pinfo2 = collectProvides(programs, pinfo1);
    return analyzeUses(programs, pinfo2);
 }
 
 // compile-compilation-top: program pinfo -> bytecode
 function compile(program, pinfo){
    // desugaring pass
    var programAndPinfo = desugarAll(program, pinfo),
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
    function compileAndCollect(p, acc){
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
})();