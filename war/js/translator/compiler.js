/*
 TODO
 - desugaring of structs, require, provide and local. proper handling of 'else' in cond
 - desugar defvars, defstruct and local
 - gensym for or?
 - collectDefinitions
 - analyzeUses
*/
(function () {
 'use strict';

  var makeHash = types.makeLowLevelEqHash;
  var keywords = ["cond", "else", "let", "case", "let*", "letrec", "quote",
                  "quasiquote", "unquote","unquote-splicing","local","begin",
                  "if","or","and","when","unless","lambda","λ","define",
                  "define-struct", "define-values"];

  // ENVIRONMENT STRUCTS ////////////////////////////////////////////////////////////////
  // Representation of the stack environment of the mzscheme vm, so we know where
  // things live.
  function env(){
    // pushGlobals: (listof symbol) -> env
    function pushGlobals(names){ return new globalEnv(names, this); }

    // pushLocal: symbol -> env
    function pushLocal(name){ return new localEnv(name, false, this); };

    // pushLocalBoxed: symbol -> env
    function pushLocalBoxed(name){ return new localEnv(name, true, this); };

    // pushUnnamed: -> env
    function pushUnnamed(){ return new unnamedEnv(this); };

    // pop: -> env
    function pop(){ return this.parentEnv; };
 
    // lookup: symbol -> stack-reference
    // given a symbol, return a stack reference to that symbol's value in this environment
    function lookup(name){ this.search(this, 0); }

    // peek: number -> env
    // search up the chain until we find the environment or run dry
    function peek(depth){
      if(depth === 0){ return env; }
      else { this.peek(this.parentEnv, depth-1); }
    }
  }

  function emptyEnv(){
    env.call(this);
    this.pop = function(){throwError('env-pop "empty env"');};
    this.search = function(name, depth){return new unboundStackReference(name);};
    this.peek = function(depth){throwError("env-peek");};
  }
  emptyEnv.prototype = heir(env.prototype);
  function localEnv(name, isBoxed, parentEnv){
    env.call(this);
    this.name = name; this.isBoxed = isBoxed; this.parentEnv = parentEnv;
    this.search = function(name, depth){
      return (name===this.name)? (function (pos){return new globalStackReference(name, dept, pos);}) :
                                this.parentEnv.lookup(name, depth+1);

    };
  }
  localEnv.prototype = heir(env.prototype);

  function globalEnv(names, parentEnv){
    env.call(this);
    this.names = names; this.parentEnv = parentEnv;
    this.search = function(name, depth){
      return (position(name, this.names))? new localStackReference(name, this.isBoxed, this.depth) :
                                this.parentEnv.lookup(name, depth);

    };
  }
  globalEnv.prototype = heir(env.prototype);

 function unnamedEnv(parentEnv){
    env.call(this);
    this.parentEnv = parentEnv;
    this.search = function(name, depth){return this.parentEnv.lookup(name, depth-1);};
  }
  unnamedEnv.prototype = heir(env.prototype);

 // STACKREF STRUCTS ////////////////////////////////////////////////////////////////
  function stackReference(){}
  function localStackReference(name, isBoxed, depth){
    stackReference.call(this);
    this.name = name;
    this.isBoxed = isBoxed;
    this.depth = depth;
  }
  localStackReference.prototype = heir(stackReference.prototype);
  function globalStackReference(name, depth, pos){
    stackReference.call(this);
    this.name = name;
    this.pos = pos;
    this.depth = depth;
  }
  globalStackReference.prototype = heir(stackReference.prototype);
  function unboundStackReference(name){
    stackReference.call(this);
    this.name = name;
  }
  unboundStackReference.prototype = heir(stackReference.prototype);

  // position: symbol (listof symbol) -> (number || #f)
  // Find position of element in list; return false if we can't find the element.
  function position(x, lst){
    return (lst.indexOf(x) > -1)? lst.indexOf(x) : false;
  }
 
  // PINFO STRUCTS ////////////////////////////////////////////////////////////////
  var defaultCurrentModulePath = "";
  function defaultModuleResolver(){}
  function defaultModulePathResolver(){}

  // pinfo (program-info) is the "world" structure for the compilers;
  // it captures the information we get from analyzing and compiling
  // the program, and also maintains some auxillary structures.
  function pinfo(env, modules, usedBindingsHash, freeVariables, gensymCounter,
                 providedNames,definedNames, sharedExpressions,
                 withLocationEmits, allowRedefinition,
                 moduleResolver, modulePathResolver, currentModulePath,
                 declaredPermissions){
    this.env = env || new emptyEnv();                       // env
    this.modules = modules || [];                           // (listof module-binding)
    this.usedBindingsHash = usedBindingsHash || makeHash(); // (hashof symbol binding)
    this.freeVariables = freeVariables || [];               // (listof symbol)
    this.gensymCounter = gensymCounter || 0;                // number
    this.providedNames = providedNames || makeHash();       // (hashof symbol provide-binding)
    this.definedNames = definedNames || makeHash();         // (hashof symbol binding)
 
    this.sharedExpressions = sharedExpressions || makeHash();// (hashof expression labeled-translation)
    // Maintains a mapping between expressions and a labeled translation.  Acts
    // as a symbol table to avoid duplicate construction of common literal values.

    this.withLocationEmits = withLocationEmits || true;     // boolean
    // If true, the compiler emits calls to plt.Kernel.setLastLoc to maintain
    // source position during evaluation.

    this.allowRedefinition = allowRedefinition || true;     // boolean
    // If true, redefinition of a value that's already defined will not raise an error.
 
    // For the module system.
    // (module-name -> (module-binding | false))
    this.moduleResolver = moduleResolver || new defaultModuleResolver();
    // (string module-path -> module-name)
    this.modulePathResolver = modulePathResolver || defaultModulePathResolver();
    // module-path
    this.currentModulePath = currentModulePath || defaultCurrentModulePath;
 
    this.declaredPermissions = declaredPermissions || [];   // (listof (listof symbol any/c))
 
    /////////////////////////////////////////////////
    // functions for manipulating pinfo objects
    this.isRedefinition = function(name){ return this.env.lookup(name); };
 
    // usedBindings: -> (listof binding)
    // Returns the list of used bindings computed from the program analysis.
    this.usedBindings = function(){ return this.usedBindingsHash.values(); };
 
    this.accumulateDeclaredPermission = function(name, permission){
      return new pinfo(this.env, this.modules, this.usedBindingsHash, this.freeVariables,
                       this.gensymCounter+1, this.providedNames, this.definedNames,
                       this.sharedExpressions, this.withLocationEmits,
                       this.allowRedefinition,
                       this.moduleResolver, this.modulePathResolver, this.currentModulePath,
                       [[name, position]].concat(this.declaredPermissions));
    };
 
    this.accumulateSharedExpression = function(expression, translation){
      var labeledTranslation = makeLabeledTranslation(this.gensymCounter, translation);
      new pinfo(this.env, this.modules, this.usedBindingsHash, this.freeVariables,
                this.gensymCounter+1, this.providedNames, this.definedNames,
                this.sharedExpressions.put(labeledTranslation, expression),
                this.moduleResolver, this.modulePathResolver, this.currentModulePath,
                this.declaredPermissions);
    };
 
    // accumulateDefinedBinding: binding loc -> pinfo
    // Adds a new defined binding to a pinfo's set.
    this.accumulateDefinedBinding = function(binding, loc){
      if(keywords.indexOf(binding.id)>-1){
        throwError(types.Message([new ColoredPart(binding.id, loc),
                                  ": this is a reserved keyword and cannot be used"+
                                  "as a variable or function name"]));
      } else if(!this.allowRedefinition && isRedefinition(binding.id)){
        var prevBinding = this.env.lookup(binding.id);
        if(binding.loc){
          throwError(types.Message([new ColoredPart(binding.id, binding.loc),
                                    ": this name has a ",
                                    new ColoredPart("previous definition", prevBinding.loc),
                                    " and cannot be re-defined"]));
 
        } else {
          throwError(types.Message([new ColoredPart(binding.id, binding.loc),
                                    ": this name has a ",
                                    "previous definition",
                                    " and cannot be re-defined"]));

        }
      } else {
        return new pinfo(envExtend(this.env, binding), this.modules,
                         this.usedBindingsHash, this.freeVariables,
                         this.gensymCounter, this.providedNames,
                         this.definedNames.put(binding.id, binding),
                         this.sharedExpressions, this.withLocationEmits,
                         this.allowRedefinition, this.moduleResolver,
                         this.modulePathResolver, this.currentModulePath,
                         this.declaredPermissions);
      }
    };
 
    // accumulateBindings: (listof binding) Loc -> pinfo
    // Adds a list of defined bindings to the pinfo's set.
    this.accumulateDefinedBindings = function(bindings, loc){
      return bindings.reduce((function(pinfo, b){
          return this.accumulateDefinedBinding(b, loc);
          }), this);
    };
 
 
    // accumuldateModuleBindings: (listof binding) -> pinfo
    // Adds a list of module-imported bindings to the pinfo's known set of bindings, without
    // including them within the set of defined names.
    this.accumulateModuleBindings = function(bindings){
      return bindings.reduce((function(pinfo, binding){
        return new pinfo(envExtend(this.env, binding), this.modules,
                         this.usedBindingsHash, this.freeVariables,
                         this.gensymCounter, this.providedNames,
                         this.definedNames.put(binding.id, binding),
                         this.sharedExpressions, this.withLocationEmits,
                         this.allowRedefinition, this.moduleResolver,
                         this.modulePathResolver, this.currentModulePath,
                         this.declaredPermissions);
        }), this);
    };
   
    // accumulateModule: module-binding -> pinfo
    // Adds a module to the pinfo's set.
    this.accumulateModule = function(module){
      return new pinfo(this.env, [module].concat(this.modules),
                       this.usedBindingsHash, this.freeVariables,
                       this.gensymCounter, this.providedNames,
                       this.definedNames, this.sharedExpressions,
                       this.withLocationEmits, this.allowRedefinition,
                       this.moduleResolver, this.modulePathResolver,
                       this.declaredPermissions);
    };

    // accumulateBindingUse: binding -> pinfo
    // Adds a binding's use to a pinfo's set.
    this.accumulateBindingUse = function(binding){
      return new pinfo(this.env, this.modules,
                       this.usedBindingsHash.put(binding.id,binding),
                       this.freeVariables, this.gensymCounter,
                       this.providedNames, this.definedNames,
                       this.sharedExpressions, this.withLocationEmits,
                       this.allowRedefinition, this.moduleResolver,
                       this.modulePathResolver, this.currentModulePath,
                       this.declaredPermissions);
    };
   
    // accumulateFreeVariableUse: symbol -> pinfo
    // Mark a free variable usage.
    this.accumulateFreeVariableUse = function(sym){
      return new pinfo(this.env, this.modules, this.usedBindingsHash,
                       ((this.freeVariables.indexOf(sym) > -1)?
                        this.freeVariables : [sym].concat(this.freeVariables)),
                       this.gensymCounter,
                       this.providedNames, this.definedNames,
                       this.sharedExpressions, this.withLocationEmits,
                       this.allowRedefinition, this.moduleResolver,
                       this.modulePathResolver, this.currentModulePath,
                       this.declaredPermissions);
    };
   
    // gensym: symbol -> [pinfo, symbol]
    // Generates a unique symbol.
    this.gensym = function(label){
      return [new pinfo(this.env, this.modules, this.usedBindingsHash,
                        this.freeVariables, this.gensymCounter+1,
                        this.providedNames, this.definedNames,
                        this.sharedExpressions, this.withLocationEmits,
                        this.allowRedefinition, this.moduleResolver,
                        this.modulePathResolver, this.currentModulePath,
                        this.declaredPermissions),
              
              label+this.gensymCounter];
    };
 
    // permissions: -> (listof permission)
    // Given a pinfo, collect the list of permissions.
    this.permissions = function(){
      // unique : listof X -> listof X
      function unique(lst){
        if(lst.length === 0) return lst;
        else if(lst.slice(1).indexOf(lst[0]) > -1) return unique.slice(1)
        else return [lst[0]].concat(unique.slice(1));
      }
      function reducePermissions(permissions, binding){
        if(binding.isFunction) return binding.functionPermissions.concat(permissions);
        else if(binding.isConstant) return binding.constantPermissions.concat(permissions);
      }
      return unique(this.usedBindings().reduce(reducePermissions, []));
    }

    // getBasePinfo: symbol -> pinfo
    // Returns a pinfo that knows the base definitions. Language can be one of the following:
    // 'base
    // 'moby
    this.getBasePinfo = function(language){
      var pinfo = new pinfo();
      if(Language === "moby"){
        pinfo.env = extendEnv_ModuleBinding(getTopLevelEnv(language),
                                            mobyModuleBinding);
      } else if(Language === "base"){
        pinfo.env = getTopLevelEnv(language);
      }
      return pinfo;
    };
 
    // getExposedBindings:  -> (listof binding)
    // Extract the list of the defined bindings that are exposed by provide.
    this.getExposedBindings = function(){
      // lookupProvideBindingInDefinitionBindings: provide-binding compiled-program -> (listof binding)
      // Lookup the provided bindings.
      function lookupProvideBindingInDefinitionBindings(provideBinding){
        var binding;
        if(this.definedNames.containsKey(provideBinding.stx)){
          binding = checkBindingCompatibility(binding, this.definedNames.get(provideBinding.stx));
        } else {
          throwError(types.Message(["provided-name-not-defined: ", provideBinding.stx]));
        }

        // ref: symbol -> binding
        // Lookup the binding, given the symbolic identifier.
        function ref(id){ return this.definedNames.get(id); }
 
        // if it's a struct provide, return a list containing the constructor and predicate,
        // along with all the accessor and mutator functions
        if(provideBinding instanceof structId){
          [binding, ref(binding.structureConstructor), ref(binding.structurePredicate)].concat(
              binding.structureAccessors.map(ref), binding.structureMutators.map(ref));
        } else {
          return [binding];
        }
      }
 
      // decorateWithPermissions: binding -> binding
      // HACK!
      function decorateWithPermissions(binding){
        var bindingEntry = function(entry){return entry[0]===binding.id;},
            filteredPermissions = this.declaredPermissions.filter(bindingEntry);
        binding.updatePermissions(filteredPermissions.map(function(p){return p[1];}));
        return binding;
      }

      // Make sure that if the provide says "struct-out ...", that the exported binding
      // is really a structure.
      function checkBindingCompatibility(binding, exportedBinding){
        if(binding instanceof structureId){
          if(exportedBinding instanceof structure){
            return exportedBinding;
          } else {
            throwError(types.Message(["provided-structure-not-structure: ", exportedBinding.stx]));
          }
        } else {
          return exportedBinding;
        }
      }
 
      var keys = this.providedNames.keys, bindings = this.providedNames.values;
      // for each provide binding, ensure it's defined and then decorate with permissions
      // concat all the permissions and bindings together, and return
      return bindings.reduce(function(acc, b){
         acc.concat(decorateWithPermissions(lookupProvideBindingInDefinitionBindings(b)));
        }, []);
 
    }
 }

 // BINDING STRUCTS ///////////////////////////////////////////////////////
 function provideBindingId(stx){ this.stx = stx;}
 function provideBindingStructId(stx){ this.stx = stx;}
 
 // DESUGARING ////////////////////////////////////////////////////////////////
 
 // desugarProgram : Listof Programs null/pinfo -> [Listof Programs, pinfo]
 function desugarProgram(programs, pinfo){
    var acc = [ [], (pinfo || new pinfo())];
    return programs.reduce((function(acc, p){
                              var desugaredAndPinfo = p.desugar(acc[1]);
                              acc[0].push(desugaredAndPinfo[0]);
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
    return [new defVar(this.name, exprAndPinfo[1]), exprAndPinfo[1]];
 };
 defVars.prototype.desugar = function(pinfo){
    throw "desugaring defVars is not yet implemented";
    return this;
 };
 defStruct.prototype.desugar = function(pinfo){
    throw "desugaring defStruct is not yet implemented";
    return this;
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
    var defnsAndPinfo = desugarProgram(this.defs, pinfo),
        exprAndPinfo = this.body.desugar(pinfo);
    throw "desugaring defStruct is not yet implemented";
    return new localExpr(desugar(this.defs), this.body.desugar());
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

 // convert all these to simpler forms, then desugar those forms
 // letrecs become locals
 letrecExpr.prototype.desugar = function(pinfo){
    function bindingToDefn(b){return new defVar(b.first, b.second.desugar());};
    return [new localExpr(this.bindings.map(bindingToDefn), this.body.desugar()), pinfo];
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
    var expr = this.exprs[exprs.length-1]; // ASSUME length >=2!!!
    for(var i=this.exprs.length-2; i>-1; i--){
      expr = new ifExpr(this.exprs[i], expr, new booleanExpr(types.symbol("false")));
    }
    return expr.desugar(pinfo);
 };
 // ors become nested
 orExpr.prototype.desugar = function(pinfo){
    var expr = exprs[exprs.length-1]; // ASSUME length >=2!!!
    for(var i=this.exprs.length-2; i>-1; i--){
      expr = new ifExpr(this.exprs[i], new booleanExpr(types.symbol("true")), expr);
    }
    return expr.desugar(pinfo);
 };
 
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
 defStruct.prototype.collectDefinitions = function(pinfo){
 };
 req.prototype.collectDefinitions = function(pinfo){
 }
 // extend the Program class to collect provides
 // Program.collectProvides: pinfo -> pinfo
 Program.prototype.collectProvides = function(pinfo){
    return pinfo;
 };
 provideStatement.prototype.collectProvides = function(pinfo){
    // TODO do some work here
    return pinfo;
 };
 
 
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
 defStruct.prototype.analyzeUses = function(pinfo){
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