////////////////   COMPILER  OBJECT ////////////////////
// A transliterated copy of https://github.com/dyoo/moby-scheme/blob/wescheme/src/compiler/mzscheme-vm/mzscheme-vm.ss
/* TODO 
 - finish translation
 - JSlint the whole thing
 - implement byecode and env functionality
 - look up the for(k in A) syntax, replace for() loops
 */
(function () { 
/*
// compile-compilation-top-module: program pinfo -> [bytecode pinfo]
function compileCompilationTop(program, basePinfo, name){
 var programPinfo = desugarProgram(program basePinfo),
     program = programPinfo[0],
     pinfo = programAnalyzePinfo(program, programPinfo[1]);
    
    // The toplevel is going to include all of the defined identifiers in the pinfo
    // The environment will refer to elements in the toplevel.
 var toplevelPrefixAndEnv = makeModulePrefixAndEnv(pinfo),
     toplevelPrefix = toplevelPrefixAndEnv[0],
     env = toplevelPrefixAndEnv[1];
 
 var defns    = program.filter(isDefinition),
     requires = program.filter(isRequire),
     provides = provide.filter(isProvide),
     expressions=program.filter((function (x){return isTestCase(x)||isExpr(x);});

 // compile requires, definitions and then expressions
 // rewrite pinfo at each phase
 var compiledRequiresAndpinfo = compileRequires(requires pinfo)),
     compiledFequires = compiledRequiresAndpinfo[0],
     pinfo = compiledRequiresAndpinfo[1],
     compiledDefinitionsAndpinfo = compileDefinitions(defns, env, pinfo),
     compiledDefinitions = compiledDefinitionsAndpinfo[0],
     pinfo = compiledDefinitionsAndpinfo[1],
     compiledExpressionsAndpinfo = compileExpressions(defns, env, pinfo),
     compiledExpressions = compiledExpressionsAndpinfo[0],
     pinfo = compiledExpressionsAndpinfo[1];
 
 var bytecode = bcode:make-compilation-top(0
                                        ,toplevelPrefix
                                        ,(bcode:make-seq
                                               compiledRequires.concat(compiledDefinitions
                                                                       ,compiledExprs)));
 return [bytecode, pinfo];
}
 
// makeModulePrefixAndEnv: pinfo -> (bytecode env)
// FIXME: local-defined-names and module-defined-bindings may not be
// disjoint, in which case, references to toplevel-bound identifiers
// may actually be intended to reference a global that should be
// shadowing.
//
// We may need to do a solution such as namespace-require/copy
// (http://list.cs.brown.edu/pipermail/plt-scheme/2007-February/016390.html)
// to copy all toplevel references off to globals.  That means every variable
// reference (save lexically-scoped ones) become references to the global array.
// This doesn't sound so good either...
function makeModulePrefixAndEnv pinfo){
  // collect all the free names being defined and used at toplevel
  //
  // Create a prefix that refers to those values
  // Create an environment that maps to the prefix
  var requiredModules = pinfoModules(pinfo),
      requireModuleBindings = foldl( (function (module acc){
                                      return binding:moduleBindingBindings(module).concat(acc);
                                      })
                              ,[]
                              ,requiredModules),
      freeVariables = pinfoFreeVariables(pinfo),
      localDefinedNames = rbtreeKeys(pinfoDefinedNames pinfo),
      moduleOrToplevelDefininedBindings =
              rbtree-fold(pinfoUsedBindingsHash(pinfo)
               , (function(name binding acc){
                    if((binding:binding-module-source a-binding) &&
                       (!(member a-binding required-module-bindings))){
                      return cons(binding acc);
                    } else {return acc;}
                  })
               ,[]),
      makeModuleVariables = function(binding){
              return bcode:make-module-variable(module-path-index-join(binding:binding-module-source(binding)
                                                                 ,module-path-index-join(false,false))
                                          , (binding:binding-id binding)
                                          , -1
                                          ,0);
               },
      bindings = requireModuleBindings.concat(moduleOrToplevelDefininedBindings);
  var bytecode = bcode:make-prefix(0
                                 ,[false].concat(freeVariables.map(bcode:make-global-bucket)
                                                ,localDefinedNames.map(bcode:make-global-bucket)
                                                ,bindings.map(makeModuleVariables))),
      env = env-push-globals(empty-env
                             ,[false].concat(freeVariables
                                             ,localDefinedNames
                                             ,requireModuleBindings.concat(moduleOrToplevelDefininedBindings).map(binding:binding-id)));
  return [bytecode, env];
}


// compileDefinitions : Listof Defintions, Env, pInfo -> ...?
function compileDefinitions(defns, env, pinfo){
  
  // compile a single definition
  function compileDefinition(defn, env, a-pinfo){
    if(defn instanceof defFunc){
      return compileFunctionDefinition(defn.name, defn.args, defn.body, env, pinfo);
    } else if(defn instanceof defVar){
      return compileVariableDefinition(defn.name, def.expr, env, pinfo);
//    } else if(defn instanceof defVars) {
//      return compileVariablesDefinition(ids, body, env, a-pinfo);
    } else if(defn instanceof defStruct){
      throw "IMPOSSIBLE: structures should have been desugared"

    }
  }
  
  var compiledDefinitions=[];
  for(var i<defns.length; i++){
    var compiledDefinitionAndPinfo = compileDefinition(defns[i], env, pinfo);
    compiledDefinitions.push(compiledDefinitionAndpinfo[0]);
    pinfo = compiledDefinitionAndPinfo[1];
  }
  return values(compiledDefinitions, pinfo);
}


// compile-requires: (listof require) pinfo -> (values (listof bcode) pinfo)
function compileRequires(requires, a-pinfo){

  // compile a single require
  function compileRequire(a-require, a-pinfo){
  // FIXME: I should be doing some kind of module resolution here.
  return [bcode:make-req(datum->syntax #f (stx->datum (second (stx-e a-require)))
                         (bcode:make-toplevel 0 0 #f #f)),
          a-pinfo];
  }
  var compiledRequires = [];
  for(var i<requires.length; i++){
    var compiledRequiresAndPinfo = compileRequire(requires[i], pinfo);
    compiledRequires.push(compiledRequiresAndPinfo[0]);
    pinfo = compiledRequiresAndPinfo[1];
  }
  return [compiledRequires, pinfo];
}



// compileFunctionDefinition : defFunc env pinfo -> [byetcode pinfo]
// compile the name and body in two passes, rewriting the pinfo after each
function compileFunctionDefinition(def, env, pinfo){
  var compiledNameAndPinfo = compileExpression(def.name, env, env, pinfo),
      compiledName = compiledNameAndPinfo[0],
      pinfo = compiledNameAndPinfo[1];
  var compiledLambdaAndPinfo = compileLambda(def.name, def.args, def.body, env, pinfo),
      compiledLambda = compiledLambdaAndPinfo[0],
      pinfo = compiledLambdaAndPinfo[1];
  var bytecode = bcode:make-def-values([compiledName], compiledLambda);
  return [bytecode, pinfo];
}

// compileVariableDefinition : defVar env pinfo -> [bytecode pinfo]
// compile the name and body in two passes, rewriting the pinfo after each
function compileVariableDefinition(def, env, pinfo){
  var compiledIdAndPinfo = compileExpression(def.name, env, pinfo),
      compiledId = compiledExpressionAndPinfo[0],
      pinfo = compiledExpressionAndPinfo[1];
  var compiledBodyAndPinfo = compileExpression(def.body, env, pinfo),
      compiledBody = compiledBodyAndPinfo[0],
      pinfo = compiledBodyAndPinfo[1];
  var bytecode = bcode:make-def-values([compiledId], compiled-body);
  return [bytecode, pinfo];
}


// compileVariablesDefinition: (listof id) body env pinfo -> (values expression pinfo)
// compile the names and bodie in two passes, rewriting the pinfo after each
function compileVariablesDefinition(ids, body, env, pinfo){
  var compiledIdsAndPinfo = compileExpression(ids, env, pinfo),
      compiledIds = compiledIdsAndPinfo[0],
      pinfo = compiledIdsAndPinfo[1];
  var compiledBodyAndPinfo = compileExpression(body, env, pinfo),
      compiledBody = compiledBodyAndPinfo[0],
      pinfo = compiledBodyAndPinfo[1];
  var bytecode = bcode:make-def-values(compiledIds, compiled-body);
  return [bytecode, pinfo];
}

// compileExpression: expression env pinfo -> (values expr pinfo)
function compileExpression(expr, env, pinfo){
  if(expr instanceof ifExpr){
    return compileIfExpr(expr);
  } else if(expr instanceof beginExpr){
    return compileBeginExpression(expr, env, pinfo);
  } else if(expr instanceof symbolExpr){
    return compileIdentifierExpression(expr, env, pinfo);
  } else if(expr instanceof lambdaExpr){
    return compileLambdaExpression(expr, env, pinfo);
  } else if(expr instanceof localExpr){
    return compileLocalExpression(expr, env, pinfo);
  } else if(expr instanceof setBangExpr){
    throw "I don't know how to compile a (set!...) expression."
  } else if(expr instanceof quotedExpression){
    return compileQuotedExpression(expr, env, pinfo);
  } else if(expr instanceof call){
    return compileApplicationExpression_stackRecord(expr, env, pinfo);

    // Regular data are just themselves in the emitted bytecode.
  } else if(expr instanceof numberExpr){
    return [expr, pinfo];
  } else if(expr instanceof stringExpr){
    return [expr, pinfo];
  } else if(expr instanceof byteExpr){
    return [expr, pinfo];
  } else if(expr instanceof booleanExpr){
    return [expr, pinfo];
  } else if(expr instanceof charExpr){
    return [expr, pinfo];
  } else if(expr instanceof pathExpr){
    return [expr, pinfo];
  } else if(expr instanceof boxExpr){
    return [expr, pinfo];
  } else if(expr instanceof regexpExpr){
    return [expr, pinfo];
  } else if(expr instanceof byteRegExpExpr){
    return [expr, pinfo];
  } else {
    throw "I don't recognize this expression type: "+expr;
  }
}


// compile-expressions: (listof expressions) env pinfo -> (values (listof expr) pinfo)
// compile each expression, one pass at a time, rewriting the pinfo after each
function compileExpressions(exprs, env, pinfo){
  var compiledExpressions = [];
  for(var i<exprs.length; i++){
    var compiledExpressionAndPinfo = compileExpression(exprs[i], env, pinfo);
    compiledExpressions.push(compileExpressionAndPinfo[0]);
    pinfo = compiledExpressionAndPinfo[1];
  }
  return [compiledRequires, pinfo];
}

// compileIfExpression: ifExpr env pinfo -> [bytecode, pinfo]
// compile the predicate, consquence and alternate, rewriting the pinfo after each
function compileIfExpression(ifExpr, env, pinfo){
  var compiledPredicateAndPinfo = compileExpression(ifExpr.predicate, env, pinfo),
      compiledPredicate = compiledPredicateAndPinfo[0],
      pinfo = compiledPredicateAndPinfo[1];
  var compiledConsequenceAndPinfo = compileExpression(ifExpr.consequence, env, pinfo),
      compiledConsequence = compiledConsequenceAndPinfo[0],
      pinfo = compiledConsequenceAndPinfo[1];
  var compiledAlternateAndPinfo = compileExpression(ifExpr.alternative, env, pinfo),
      compiledAlternate = compiledAlternateAndPinfo[0],
      pinfo = compiledAlternateAndPinfo[1];
  var bytecode = bcode:make-branch(compiledPredicate, compiledConsequence, compiledAlternate);
  return [bytecode, pinfo];
}

// compileBeginExpression: beginExpr env pinfo -> [bytecode, pinfo]
// compile each expression, one pass at a time, rewriting the pinfo after each
function compileBeginExpression(beginExpr, env, pinfo){
  var compiledExpressionsAndPinfo = compileExpressions(beginExpr.exprs, env, pinfo),
      compiledExpressions = compiledExpressionsAndPinfo[0],
      pinfo1 = compiledExpressionsAndPinfo[1];
  var bytecode = bcode:make-seq(compiledExpressions);
  return [bytecode, pinfo1];
}


// compileIdentifierExpression : symbolExpr env pinfo -> [bytecode, pinfo]
function compileIdentifierExpression(expr, env, pinfo){
  var stackReference = envLookup(env, expr.val), bytecode;
  if(stackReference instanceof localStackRef){
    bytecode = bcode:make-localref(localStackRef.boxed, localStackRef.depth, false, false, false);
  } else if(stackReference instanceof globalStackRef){
    bytecode = bcode:make-toplevel(globalStackRef.depth, globalStackRef.pos, false, false);
  } else if(stackReference instanceof unboundStackRef){
    throw "Couldn't find "+expr.val+" in the environment";
  }
  return [bytecode, pinfo];
}

// quote-expression->javascript-string: quotedExpr env pinfo -> [expr, pinfo]
function compileQuotedExpression(expr, env, pinfo){
  return [expr.val, pinfo];
}

// compileLambdaExpression: lambdaExpr env pinfo -> [lam, pinfo]
// Compile a lambda expression.  The lambda must close its free variables over the
// environment.
function compileLambdaExpression(lambdaExpr, env, pinfo){
  var freeVars = freeVariables(lambdaExpr.body,
                               foldl( (function(variable env){return env.push(variable)})
                                     , emptyEnv
                                     lambdaExpr.args));
  var closureVectorAndEnv = getClosureVectorAndEnv(lambdaExpr.args, freeVars, env),
      closureVector = closureVectorAndEnv[0],
      extendedEnv = closureVectorAndEnv[1];
  var compiledBodyAndPinfo = compileExpressionAndPinfo(lambdaExpr.body, extendedEnv, pinfo),
      compiledBody = compiledBodyAndPinfo[0],
      pinfo = compiledBodyAndPinfo[1];
  var lambdaArgs = new Array(lambdaExpr.args.length),
      closureArgs = new Array(closureVector.length);
  var bytecode = bcode:make-lam(null, [], lambdaExpr.args.length
                                ,lambdaArgs.map((function(){return types.symbol("val");}))
                                ,false
                                ,closureVector
                                ,closureArgs.map((function(){return types.symbol("val/ref");}))
                                ,0
                                ,compiledBody);
  return [bytecode, pinfo];
}

// get-closure-vector-and-env: (listof symbol) (listof symbol) env -> (values (vectorof number) env)
// Produce the closure map, given the set of free variables.
(define (get-closure-vector-and-env args free-variables original-env)
  (let* ([free-variable-references 
          (map (lambda (var) (env-lookup original-env var))
               free-variables)])
    (cond 
      // If anything's unbound, we're in trouble and need to signal an error.
      [(ormap unbound-stack-reference? free-variable-references)
       (error 'get-closure-vector-and-env
              (format "Can't produce closure; I don't know where ~s is bound."
                      (unbound-stack-reference-name
                       (findf unbound-stack-reference? free-variable-references))))]
      
      [else
       (let* ([lexical-free-references 
               (sort-and-unique (filter local-stack-reference? free-variable-references)
                                (lambda (x y) (< (local-stack-reference-depth x)
                                                 (local-stack-reference-depth y)))
                                (lambda (x y) (= (local-stack-reference-depth x)
                                                 (local-stack-reference-depth y))))]
              [lexical-free-depths (map local-stack-reference-depth lexical-free-references)]
              
              [global-references (filter global-stack-reference? free-variable-references)]
              [global-depths (sort-and-unique (map global-stack-reference-depth global-references)
                                              < =)]
              
              // Function arguments
              [env-1 (foldl (lambda (name env)
                              (env-push-local env name))
                            original-env
                            (reverse args))]         
              
              // The lexical free variables
              [env-2 (foldl (lambda (ref env)
                              (cond 
                                [(local-stack-reference-boxed? ref)
                                 (env-push-local/boxed env 
                                                 (local-stack-reference-name ref))]
                                [else
                                 (env-push-local env 
                                                 (local-stack-reference-name ref))]))
                            env-1
                            (reverse lexical-free-references))]
              // The global free variables
              [env-3 (foldl (lambda (a-depth env)
                              (let* ([references-at-depth
                                      (filter (lambda (a-ref)
                                                (= (global-stack-reference-depth a-ref) a-depth))
                                              global-references)]
                                     [used-global-names 
                                      (map global-stack-reference-name
                                           references-at-depth)])
                                (env-push-globals env 
                                                  (mask-unused-globals 
                                                   (global-env-names
                                                    (env-peek original-env a-depth))
                                                   used-global-names))))
                            env-2
                            (reverse global-depths))])
 
         //  When the function is called, the rest-argument list (if any) is pushed onto the stack,
         //  then the normal arguments in reverse order, then the closure-captured values in
         //  reverse order. Thus, when body is run, the first value on the stack is the first value
         //  captured by the closure-map array, and so on.

         
         (values (list->vector (append global-depths lexical-free-depths))
                 env-3))])))


// maskUnusedGlobals: (listof symbol?) (listof symbol?) -> (listof (or/c symbol? false/c))
// map a function that returns names or #f across a list of names
function maskUnusedGlobals(listOfNames, namesToKeep){
  listOfNames.map(function(n){ return (namesToKeep.indexOf(n) > -1)? n : false;})
}

var MOBY_STACK_RECORD_CONTINUATION_MARK_KEY = 'moby-stack-record-continuation-mark-key';

// compileApplicationExpression_stackRecord : callExpr env pinfo -> [bytecode, pinfo]
function compileApplicationExpression_stackRecord(callExpr, env, pinfo){
  var compiledAppAndPinfo = compileApplicationExpression(callExpr.func, callExpr.args, env, pinfo),
      compiledApp = compiledAppAndPinfo[0],
      pinfo = compiledAppAndPinfo[1],
      loc = callExpr.location;
  var bytecode = bcode:make-with-cont-mark(MOBY_STACK_RECORD_CONTINUATION_MARK_KEY
                                           ,types.vector(loc.source, loc.offset, loc.sLine, loc.sCol, loc.span)
                                           ,compiledApp);
  return [bytecode, pinfo];
}

// compileApplicationExpression: callExpr env pinfo -> [bytecode, pinfo]
function compileApplicationExpression(callExpr, env, pinfo){
  // extended-env includes the intermediate scratch space used for
  // operand/operator evaluation
  var extendedEnv = foldl((function(arg, env){envPushUnnamed(env);})
                          ,env
                          ,callExpr.args),
      compiledOperatorAndPinfo = compileExpressionAndPinfo(callExpr.func, extendedEnv, pinfo),
      compiledOperator = compiledOperatorAndPinfo[0],
      pinfo = compiledOperatorAndPinfo[1];
  var compiledOperandsAndPinfo = compileExpressionsAndPinfo(callExpr.args, extendedEnv, pinfo),
      compiledOperands = compiledOperandsAndPinfo[0],
      pinfo = compiledOperandsAndPinfo[1];
  var bytecode = bcode:make-application(compiledOperator, compiledOperands);
  return [bytecode, pinfo];
}

// compileLocalExpression: (listof defn) body env pinfo -> [bytecode pinfo]
function compileLocalExpression(defns, body, env, pinfo){
  if(defns.length === 0) return compileExpression(body, env, pinfo);
  var definedNames = collectDefinedNames(defns),
      envWithBoxedNames = fold( (function(id, env){envPushLocal_Boxed(env, id.val);})
                               , env
                               , definedNames.reverse());
  var letVoidBody = pinfo;
  for(var i=0; i<defns.length; i++){
    if(defns[i] instanceof defFunc){
      (let*-values ([(lambda-rhs pinfo)
                     (compile-lambda-expression
                      (stx-e id)
                      args body
                      env-with-boxed-names pinfo)]
                    [(new-body pinfo)
                     (loop (rest defns) pinfo (add1 i))])
       (values (bcode:make-install-value 1
                i
                #t
                lambda-rhs
                new-body)
        pinfo)))

    } else if(defns[i] instanceof defVar){
      
      (lambda (id val)
       (let*-values ([(rhs pinfo)
                      (compile-expression
                       val env-with-boxed-names pinfo)]
                     [(new-body pinfo)
                      (loop (rest defns) pinfo (add1 i))])
        (values (bcode:make-install-value 1
                 i
                 #t
                 rhs
                 new-body)
         pinfo)))
    } else if(defn[i] instanceof defStruct){
      throw "IMPOSSIBLE: structures should have been desugared"
    } else if(defn[i] instanceof defVars){
      (let*-values ([(rhs pinfo)
                     (compile-expression
                      body env-with-boxed-names pinfo)]
                    [(new-body pinfo)
                     (loop (rest defns)
                      pinfo
                      (+ i (length ids)))])
       (values (bcode:make-install-value (length ids)
                i
                #t
                rhs
                new-body)
        pinfo))))]))])
      
    }
  }
  
  
         (values (bcode:make-let-void
                  (length defined-names)
                  #t
                  let-void-body)
                 pinfo)))]))





// collectDefinedNames: (listof defn) -> (listof id-stx)
function collectDefinedNames(defns){
  foldl((function(defn, collectedNames){collectedNames.push(definitionName(defn))})
        , []
        defns).reverse();

////////////////////////////////////////////////////////////////////////////////////////

// free-variables: expr env pinfo -> (listof symbol)
;; Given an expression, compute the set of free variable occcurances
(define (free-variables expr env)
  (sort-and-unique (let loop ([expr expr]
                              [env env])
                     (cond
                       // (if test consequent alternative)
                       [(stx-begins-with? expr 'if)
                        (local [(define test (second (stx-e expr)))
                                (define consequent (third (stx-e expr)))
                                (define alternative (fourth (stx-e expr)))]
                          (append (loop test env)
                                  (loop consequent env)
                                  (loop alternative env)))]
                       
                       
                       // (begin ...)
                       [(stx-begins-with? expr 'begin)
                        (local [(define exprs (rest (stx-e expr)))]
                          (apply append
                                 (map (lambda (e) (loop e env)) exprs)))]
                       
                       
                       // Identifiers
                       [(symbol? (stx-e expr))
                        (match (env-lookup env (stx-e expr))
                          [(struct local-stack-reference (name boxed? depth))
                           empty]
                          [(struct global-stack-reference (name depth pos))
                           empty]
                          [(struct unbound-stack-reference (name))
                           (list (stx-e expr))])]
                       
                       
                       // (local ([define ...] ...) body)
                       [(stx-begins-with? expr 'local)
                          (local [(define defns (stx-e (second (stx-e expr))))
                                  (define body (third (stx-e expr)))] 
                            // construct an updated environment, adding all the definitions
                            // introduced by defns.
                            // Also walk though each of the definitions and collect its free variables.
                            (let* ([defined-names (collect-defined-names defns)]
                                   [updated-env (foldl (lambda (id env)
                                                         (env-push-local/boxed env (stx-e id)))
                                                       env 
                                                       (reverse defined-names))])
                              (append 
                               (loop body updated-env)
                               (apply append (map (lambda (a-defn) 
                                                    (case-analyze-definition a-defn
                                                                             (lambda (id args body)
                                                                               (loop body (foldl (lambda (id env)
                                                                                                   (env-push-local env (stx-e id)))
                                                                                                 updated-env
                                                                                                 args)))
                                                                             (lambda (id body)
                                                                               (loop body updated-env))
                                                                             (lambda (id fields)
                                                                               empty)
                                                                             (lambda (ids body)
                                                                               (loop body updated-env))))
                                                  defns)))))]
                              
                              

                       
                       
                       // (set! identifier value)
                       // Attention: it's evaluation doesn't produce an Object
                       #;[(stx-begins-with? expr 'set!)
                          (local [(define id (second (stx-e expr)))
                                  (define value (third (stx-e expr)))]
                            ...)]
                       
                       // (and exprs ...)
                       [(stx-begins-with? expr 'and)
                        (apply append (map (lambda (x)
                                             (loop x env))
                                           (rest (stx-e expr))))]
                       
                       // (or exprs ...)
                       [(stx-begins-with? expr 'or)
                        (apply append (map (lambda (x)
                                             (loop x env))
                                           (rest (stx-e expr))))]
                       
                       // (lambda (args ...) body)
                       [(stx-begins-with? expr 'lambda)
                        (let ([args (map stx-e (stx-e (second (stx-e expr))))]
                              [body (third (stx-e expr))])
                          (loop body (foldl (lambda (id env)
                                              (env-push-local env id))
                                            env
                                            (reverse args))))]
                       
                       
                       // Quoted datums
                       [(stx-begins-with? expr 'quote)
                        empty]
                       
                       // Function call/primitive operation call
                       [(pair? (stx-e expr))
                        (apply append (map (lambda (x)
                                             (loop x env))
                                           (stx-e expr)))]
                       
                       // Numbers
                       [(number? (stx-e expr))
                        empty]
                       
                       // Strings
                       [(string? (stx-e expr))
                        empty]
                       
                       // Literal booleans
                       [(boolean? (stx-e expr))
                        empty]
                       
                       // Characters
                       [(char? (stx-e expr))
                        empty]
                       [else
                        (error 'free-variables (format "~s" (stx-e expr)))]))
                   
                   (lambda (x y)
                     (string<? (symbol->string x) (symbol->string y)))
                   
                   symbol=?))
///////////////////////////////////////////////////////////////////////////////////////////
// sort-and-unique: (listof X) (X X -> boolean) (X X -> boolean) -> (listof symbol)
(define (sort-and-unique elts < =)
  (let loop ([elts (sort elts <)])
    (cond
      [(empty? elts)
       empty]
      [(empty? (rest elts))
       elts]
      [(= (first elts) (second elts))
       (loop (rest elts))]
      [else
       (cons (first elts) (loop (rest elts)))])))

 
/////////////////////
// Export Bindings /
/////////////////////
window.compile = compile;
*/
})();