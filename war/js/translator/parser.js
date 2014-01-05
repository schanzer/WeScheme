/* 
 
 
 //////////////////////////////////////////////////////////////////////////////
 ///////////////////////////////// PARSER OBJECT //////////////////////////////
 //////////////////////////////////////////////////////////////////////////////
 
 Parser for http://docs.racket-lang.org/htdp-langs/intermediate-lam.html
 
 * Given an Array of SExps, produce an array of Programs
 * see structures.js for Program types
 
 TODO
 - JSLint
 - multipart error anomalies
 - proper parsing/errors for
    - quoted
    - quasiquoted
 */

(function () {
 'use strict';
 
 //////////////////////////////////// UTILITY FUNCTIONS //////////////////////////////
 function isString(x) { return x instanceof stringExpr; }
 function isNumber(x) { return x instanceof numberExpr; }
 function isSymbol(x) { return x instanceof symbolExpr; }
 function isChar(x)   { return x instanceof charExpr;   }
 function isVector(x) { return x instanceof vectorExpr;}
 function isBoolean(x){ return x instanceof booleanExpr;}
 
 // isSymbolEqualTo : symbolExpr symbolExpr -> Boolean
 // are these all symbols of the same value?
 function isSymbolEqualTo(x, y) {
    x = (x instanceof symbolExpr)? x.val : x;
    y = (y instanceof symbolExpr)? y.val : y;
    return x === y;
 }
 
 function isCons(x)  { return x instanceof Array && x.length>=1;}
 function rest(ls)   { return ls.slice(1); }
 
  // PARSING ///////////////////////////////////////////
 
   // parse* : sexp list -> Program list
  function parseStar(sexps) {
   function parseSExp(sexp) {
     return isDefinition(sexp) ? parseDefinition(sexp) :
     isExpr(sexp) ? parseExpr(sexp) :
     isRequire(sexp) ? parseRequire(sexp) :
     isProvide(sexp) ? parseProvide(sexp) :
     throwError(new types.Message(["Not a Definition, Expression, Library Require, or Provide"]),
                                  sexp.location);
    }
    return sexps.map(parseSExp);
  }
 
  // parse : sexp list -> Program list
  function parse(sexp) {
    return (sexp.length === 0) ? [] :
    (!isCons(sexp)) ? throwError(new types.Message(["The sexp is not a list of definitions or expressions: "+sexp]),
                                sexp.location):
    parseStar(sexp);
  }


 //////////////////////////////////////// PARSING ERRORS ////////////////////////////////
 function errorInParsing(sexp, msg){
    throwError(new types.Message([new types.ColoredPart(sexp[0].val, sexp[0].location)
                                  , ": "].concat(msg))
               , sexp.location);
 }
 // convert an array of expressions to one of ColoredParts
 function collectExtraParts(parts){
    var coloredParts = parts.map(function(sexp){ return new types.ColoredPart("_", sexp.location); }),
        txt = (coloredParts.length === 1)? " extra part " : " extra parts ";
    return [coloredParts.length.toString(), txt, "<<"].concat(coloredParts).concat(">>");
 }

  //////////////////////////////////////// DEFINITION PARSING ////////////////////////////////
  // (define-struct ...)
  function isStructDefinition(sexp) {
    return ((isCons(sexp)) && (isSymbol(sexp[0])) && (isSymbolEqualTo("define-struct", sexp[0])));
  }

  // (define ...)
  function isValueDefinition(sexp) {
    return (isCons(sexp) && isSymbol(sexp[0]) && isSymbolEqualTo("define", sexp[0]));
  }

  // is it any kind of definition?
  function isDefinition(sexp) {
    return isStructDefinition(sexp) || isValueDefinition(sexp);
  }
 
  // : parseDefinition : SExp -> AST (definition)
  function parseDefinition(sexp) {
    function parseDefStruct(sexp) {
      // is it just (define-struct)?
      if(sexp.length < 2){
        errorInParsing(sexp, ["expected the structure name after define-struct, but nothing's there"]);
      }
      // is the structure name there?
      if(!(sexp[1] instanceof symbolExpr)){
        errorInParsing(sexp, ["expected the structure name after define-struct, but found "
                              , new types.ColoredPart("something else", sexp[1].location)]);
      }
      // is it just (define-struct <name>)?
      if(sexp.length < 3){
        errorInParsing(sexp, ["expected at least one field name (in parentheses) after the "
                              , new types.ColoredPart("structure name", sexp[1].location)
                              , ", but found nothing"]);
      }
      // is the structure name followed by a list?
      if(!(sexp[2] instanceof Array)){
        errorInParsing(sexp, ["expected at least one field name (in parentheses) after the "
                              , new types.ColoredPart("structure name", sexp[1].location)
                              , ", but found "
                              , new types.ColoredPart("something else", sexp[2].location)]);
      }
      // is it a list of not-all-symbols?
      sexp[2].forEach(function(arg){
        if (!(arg instanceof symbolExpr)){
          errorInParsing(sexp, ["expected a field name, but found "
                                , new types.ColoredPart("something else", arg.location)]);
        }
      });
      // too many expressions?
      if(sexp.length > 3){
        errorInParsing(sexp, ["expected nothing after the "
                              , new types.ColoredPart("field names", sexp[2].location)
                              , ", but found "].concat(collectExtraParts(sexp.slice(3))));
      }
      return new defStruct(parseIdExpr(sexp[1]), sexp[2].map(parseIdExpr));
    }
    function parseDef(sexp) {
      // is it just (define)?
      if(sexp.length < 2){
        errorInParsing(sexp, ["expected a variable, or a function name and its variables "
                              , "(in parentheses), after define, but nothing's there"]);
      }
      // If it's (define (...)...)
      if(sexp[1] instanceof Array){
          // is there at least one element?
          if(sexp[1].length === 0){
            errorInParsing(sexp, ["expected a name for the function, inside the "
                                  , new types.ColoredPart("parentheses", sexp[1].location)]);
          }
          // is the first element in the list a symbol?
          if(!(sexp[1][0] instanceof symbolExpr)){
            errorInParsing(sexp, ["expected a function name after the open parenthesis but found "
                                  , new types.ColoredPart("something else", sexp[1][0].location)]);
          }
          // is the next element a list of not-all-symbols?
          sexp[1].forEach(function(arg){
            if (!(arg instanceof symbolExpr)){
              errorInParsing(sexp, ["expected a variable but found "
                                    , new types.ColoredPart("something else", arg.location)]);
            }
          });
          // is it just (define (<name> <args>))?
          if(sexp.length < 3){
            errorInParsing(sexp, ["expected an expression for the function body, but nothing's there"]);
          }
          // too many parts?
          if(sexp.length > 3){
            errorInParsing(sexp, ["expected only one expression for the function body "
                                  , " but found "].concat(collectExtraParts(sexp.slice(3))));
          }
          return new defFunc(parseIdExpr(sexp[1][0]), rest(sexp[1]).map(parseIdExpr), parseExpr(sexp[2]));
      }
      // If it's (define x ...)
      if(sexp[1] instanceof symbolExpr){
          // is it just (define x)?
          if(sexp.length < 3){
            errorInParsing(sexp, ["expected an expression after the variable "
                                  , new types.ColoredPart(sexp[1].val, sexp[1].location)
                                  , " but nothing's there"]);
          }
          // too many parts?
          if(sexp.length > 3){
            errorInParsing(sexp, ["expected only one expression after the variable "
                                  , new types.ColoredPart(sexp[1].val, sexp[1].location)
                                  , " but found "].concat(collectExtraParts(sexp.slice(3))));
          }
          return new defVar(parseIdExpr(sexp[1]), parseExpr(sexp[2]));
      }
      // If it's (define <invalid> ...)
      errorInParsing(sexp, ["expected a variable but found "
                            , new types.ColoredPart("something else", sexp[1].location)]);
    }
    var def = isStructDefinition(sexp) ? parseDefStruct(sexp) :
              isValueDefinition(sexp) ? parseDef(sexp) :
              throwError(new types.Message(["Expected to find a definition, but found: "+ sexp]),
                         sexp.location);
    def.location = sexp.location;
   return def;
  }


  //////////////////////////////////////// EXPRESSION PARSING ////////////////////////////////
  function isExpr(sexp) {
    return ((!(isDefinition(sexp))) && (!(isRequire(sexp))) && (!(isProvide(sexp))));
  }

  function parseExpr(sexp) {
    return isCons(sexp) ? parseExprList(sexp) :
    parseExprSingleton(sexp);
  }

  // parseExprList : SExp -> AST
  // predicates and parsers for call, lambda, local, letrec, let, let*, if, and, or, quote and quasiquote exprs
  function parseExprList(sexp) {
    function parseFuncCall(sexp) {
      return isCons(sexp)? new callExpr(parseExpr(sexp[0]), rest(sexp).map(parseExpr)) :
                          throwError(new types.Message(["function call sexp"]), sexp.location);
    }
    function parseLambdaExpr(sexp) {
      // is it just (lambda)?
      if(sexp.length === 1){
        errorInParsing(sexp, ["expected at least one variable (in parentheses) after lambda, but nothing's there"]);
      }
      // is it just (lambda <not-list>)?
      if(!(sexp[1] instanceof Array)){
        errorInParsing(sexp, ["expected at least one variable (in parentheses) after lambda, but found "
                              , new types.ColoredPart("something else", sexp[1].location)]);
      }
      // is it a list of not-all-symbols?
      sexp[1].forEach(function(arg){
        if (!(arg instanceof symbolExpr)){
          errorInParsing(sexp, ["expected as list of variables after lambda, but found "
                                , new types.ColoredPart("something else", arg.location)]);
        }
      });
      // is it just (lambda (x))?
      if(sexp.length === 2){
        errorInParsing(sexp, ["expected an expression for the function body, but nothing's there"]);
      }
      // too many expressions?
      if(sexp.length > 3){
        errorInParsing(sexp, ["expected a single body, but found "].concat(collectExtraParts(sexp.slice(3))));
      }
      return new lambdaExpr(sexp[1].map(parseIdExpr), parseExpr(sexp[2]));
    }
    function parseLocalExpr(sexp) {
      // is it just (local)?
      if(sexp.length === 1){
        errorInParsing(sexp, ["expected at least one definition (in square brackets) after local,"
                        ," but nothing's there"]);
      }
      // is it just (local <not-list>)?
      if(!(sexp[1] instanceof Array)){
        errorInParsing(sexp, ["expected a collection of definitions, but found "
                        , new types.ColoredPart("something else", sexp[1].location)]);
      }
      // is it a list of not-all-definitions?
      sexp[1].forEach(function(def){
        if (!isDefinition(def)){
        errorInParsing(sexp, ["expected a definition, but found "
                      , new types.ColoredPart("something else", def.location)]);
        }
      });
      // is it just (local [...defs...] ))?
      if(sexp.length === 2){
        errorInParsing(sexp, [new types.ColoredPart("local", sexp[0].location)
                              ,"expected a single body, but found none"]);
      }
      // too many expressions?
      if(sexp.length > 3){
        errorInParsing(sexp, ["expected a single body, but found "].concat(collectExtraParts(sexp.slice(3))));
      }
      return new localExpr(sexp[1].map(parseDefinition), parseExpr(sexp[2]));
    }
    function parseLetrecExpr(sexp) {
      // is it just (letrec)?
      if(sexp.length < 3){
        errorInParsing(sexp, ["expected an expression after the bindings, but nothing's there"]);
      }
      // is it just (letrec <not-list>)?
      if(sexp[1] instanceof Array){
        errorInParsing(sexp, ["expected sequence of key value pairs, but given "
                              , new types.ColoredPart("something else", sexp[1].location)]);
      }
      // is it a list of not-all-bindings?
      sexp[1].forEach(function(binding){
        if (!sexpIsCouple(binding)){
          errorInParsing(sexp, ["expected a key/value pair, but found "
                                , new types.ColoredPart("something else", binding.location)]);
        }
      });
      // is it just (letrec (...bindings...) ))?
      if(sexp.length === 2){
        errorInParsing(sexp, ["expected an expression after the bindings, but nothing's there"]);
      }
      // too many expressions?
      if(sexp.length > 3){
        errorInParsing(sexp, ["expected a single body, but found "].concat(collectExtraParts(sexp.slice(3))));
      }
      return new letrecExpr(sexp[1].map(parseBinding), parseExpr(sexp[2]));

    }
    function parseLetExpr(sexp) {
      // is it just (let)?
      if(sexp.length === 1){
        errorInParsing(sexp, ["expected at least one binding (in parentheses) after let, but nothing's there"]);
      }
      // is it just (let <not-list>)?
      if(!(sexp[1] instanceof Array) || (sexp[1].length < 1)){
        errorInParsing(sexp, ["expected sequence of key/value pairs, but given "
                        , new types.ColoredPart("something else", sexp[1].location)]);
      }
      // is it a list of not-all-bindings?
      sexp[1].forEach(function(binding){
        if (!sexpIsCouple(binding)){
          errorInParsing(sexp, ["expected a key/value pair, but found "
                          , new types.ColoredPart("something else", binding.location)]);
        }
      });
      // is it just (let (...bindings...) ))?
      if(sexp.length === 2){
        errorInParsing(sexp, ["expected a single body, but found none"]);
      }
      // too many expressions?
      if(sexp.length > 3){
        errorInParsing(sexp, ["expected a single body, but found "].concat(collectExtraParts(sexp.slice(3))));
      }
      return new letExpr(sexp[1].map(parseBinding), parseExpr(sexp[2]));
    }
    function parseLetStarExpr(sexp) {
      // is it just (let*)?
      if(sexp.length === 1){
        errorInParsing(sexp, ["expected at least one binding (in parentheses) after let, but nothing's there"]);
      }
      // is it just (let* <not-list>)?
      if(!(sexp[1] instanceof Array)){
        errorInParsing(sexp, ["expected sequence of key/value pairs, but given "
                              , new types.ColoredPart("something else", sexp[1].location)]);
      }
      // is it a list of not-all-bindings?
      sexp[1].forEach(function(binding){
        if (!sexpIsCouple(binding)){
          errorInParsing(sexp, ["expected a key/value pair, but found "
                                , new types.ColoredPart("something else", binding.location)]);
        }
      });
      // is it just (let* (...bindings...) ))?
      if(sexp.length === 2){
        errorInParsing(sexp, ["expected a single body, but found none"]);
      }
      // too many expressions?
      if(sexp.length > 3){
        errorInParsing(sexp, ["expected a single body, but found "].concat(collectExtraParts(sexp.slice(3))));
      }
      return new letStarExpr(sexp[1].map(parseBinding), parseExpr(sexp[2]));
    }
    function parseIfExpr(sexp) {
      // Does it have too few parts?
      if(sexp.length < 4){
        errorInParsing(sexp, [": expected a test, a consequence, and an alternative, but all three were not found"]);
      }
      // Does it have too many parts?
      if(sexp.length > 4){
        errorInParsing(sexp, [": expected only a test, a consequence, and an "
                              ,"alternative, but found "].concat(collectExtraParts(sexp.slice(4))));
      }
      return new ifExpr(parseExpr(sexp[1]), parseExpr(sexp[2]), parseExpr(sexp[3]));
    }
    function parseBeginExpr(sexp) {
      // is it just (begin)?
      if(sexp.length < 2){
        errorInParsing(sexp, ["Inside a begin, expected to find a body, but nothing was found."]);
      }
      return new beginExpr(rest(sexp).map(parseExpr));
    }
    function parseAndExpr(sexp) {
      // is it just (and)?
      if(sexp.length < 3){
        errorInParsing(sexp, [": expected at least 2 arguments, but given "
                              , new types.ColoredPart((sexp.length-1).toString(), sexp[1].location)]);
      }
      return new andExpr(rest(sexp).map(parseExpr));
    }
    function parseOrExpr(sexp) {
      // is it just (or)?
      if(sexp.length < 3){
        errorInParsing(sexp, [": expected at least 2 arguments, but given "
                              , new types.ColoredPart((sexp.length-1).toString(), sexp[1].location)]);
      }
      return new orExpr(rest(sexp.map(parseExpr)));
    }
    function parseQuotedExpr(sexp) {
      return new quotedExpr((sexp.length === 0) ?   new callExpr(new primop("list"), []) :
                            isCons(sexp)    ?  new callExpr(new primop("list"), sexp.map(parseQuotedExpr)) :
                            isString(sexp)  ?  sexp :
                            isNumber(sexp)  ?  sexp :
                            isBoolean(sexp) ?  sexp :
                            isChar(sexp)    ?  sexp :
                            isSymbol(sexp)  ?  sexp :
                            throwError(new types.Message(["quoted sexp"]), sexp.location));
    }

    return (function () {
        var peek = sexp[0],
            expr = !(isSymbol(peek)) ? parseFuncCall(sexp) :
                    isSymbolEqualTo("λ", peek)       ? parseLambdaExpr(sexp) :
                    isSymbolEqualTo("lambda", peek)  ? parseLambdaExpr(sexp) :
                    isSymbolEqualTo("local", peek)   ? parseLocalExpr(sexp) :
                    isSymbolEqualTo("letrec", peek)  ? parseLetrecExpr(sexp) :
                    isSymbolEqualTo("let", peek)     ? parseLetExpr(sexp) :
                    isSymbolEqualTo("let*", peek)    ? parseLetStarExpr(sexp) :
                    isSymbolEqualTo("cond", peek)    ? parseCondExpr(sexp) :
                    isSymbolEqualTo("case", peek)    ? parseCaseExpr(sexp) :
                    isSymbolEqualTo("if", peek)      ? parseIfExpr(sexp) :
                    isSymbolEqualTo("begin", peek)   ? parseBeginExpr(sexp) :
                    isSymbolEqualTo("and", peek)     ? parseAndExpr(sexp) :
                    isSymbolEqualTo("or", peek)      ? parseOrExpr(sexp) :
                    isSymbolEqualTo("quote", peek)   ? parseQuotedExpr(sexp[1]) :
                    isSymbolEqualTo("quasiquote", peek) ? parseQuasiQuotedExpr(sexp[1], false) :
                    parseFuncCall(sexp);
          expr.location = sexp.location;
          return expr;
   })();
  }

  function parseCondExpr(sexp) {
    // is it just (cond)?
    if(sexp.length === 1){
        errorInParsing(sexp, ["expected at least one clause after cond, but nothing's there"]);
    }
 
    function parseCondCouple(clause) {
      var clauseLocations = [clause.location.start(), clause.location.end()];
      if(!(clause instanceof Array)){
        errorInParsing(sexp, ["expected a clause with a question and an answer, but found "
                              , new types.ColoredPart("something else", clause.location)]);
      }
      if(clause.length === 0){
        errorInParsing(sexp, ["expected a clause with a question and an answer, but found an "
                              , new types.ColoredPart("empty part", clause.location)]);
      }
      if(clause.length === 1){
        errorInParsing(sexp, ["expected a clause with a question and an answer, but found a "
                              , new types.MultiPart("clause", clauseLocations, true)
                              , " with only "
                              , new types.ColoredPart("one part", clause[0].location)]);
      }
      if(clause.length > 2){
        errorInParsing(sexp, ["expected a clause with a question and an answer, but found a "
                              , new types.MultiPart("clause", clauseLocations, true)
                              , " with "].concat(collectExtraParts(clause.slice(2))));
      }
      if(sexpIsCouple(clause)){
        var cpl = new couple(parseExpr(clause[0]), parseExpr(clause[1]));
        cpl.location = clause.location;
        return cpl;
      }
    }
 
    return new condExpr(rest(sexp).reduceRight(function (rst, couple) {
               if((isSymbol(couple[0])) && (isSymbolEqualTo(couple[0], "else")) && (rst.length > 0)){
               errorInParsing(sexp, ["found an ",
                                     new types.ColoredPart("else clause", couple.location),
                                     "that isn't the last clause in its cond expression; there is ",
                                     new types.ColoredPart("another clause", rst[0].location),
                                      " after it"]);
               } else {
                 return [parseCondCouple(couple)].concat(rst);
               }
             }, []));
  }

   function parseCaseExpr(sexp) {
    // is it just (case)?
    if(sexp.length === 1){
        errorInParsing(sexp, ["expected at least one clause after case, but nothing's there"]);
    }
    if(sexp.length === 2){
        errorInParsing(sexp, ["expected a clause with at least one choice (in parentheses)",
                              "and an answer after the expression, but nothing's there"]);
    }
 
    function parseCaseCouple(clause) {
      var clauseLocations = [clause.location.start(), clause.location.end()];
      if(!(clause instanceof Array)){
        errorInParsing(sexp, ["expected a clause with at least one choice (in parentheses), but found "
                              , new types.ColoredPart("something else", clause.location)]);
      }
      if(clause.length === 0){
        errorInParsing(sexp, ["expected at least one choice (in parentheses) and an answer, but found an "
                              , new types.ColoredPart("empty part", clause.location)]);
      }
      if(!(clause[0] instanceof Array)){
        errorInParsing(sexp, ["eexpected at least one choice (in parentheses), but found "
                              , new types.ColoredPart("something else", clause.location)]);
      }
      if(clause.length === 1){
        errorInParsing(sexp, ["expected a clause with a question and an answer, but found a "
                              , new types.MultiPart("clause", clauseLocations, true)
                              , " with only "
                              , new types.ColoredPart("one part", clause[0].location)]);
      }
      if(clause.length > 2){
        errorInParsing(sexp, ["expected only one expression for the answer in the case clause, but found "
                              , new types.MultiPart("clause", clauseLocations, true)
                              , collectExtraParts(clause.slice(2))]);
      }
      if(sexpIsCouple(clause)){
        var cpl = new couple(parseExpr(clause[0]), parseExpr(clause[1]));
        cpl.location = clause.location;
        return cpl;
      }
    }
 
    return new caseExpr(sexp[1], sexp.slice(2).reduceRight(function (rst, couple) {
               if((isSymbol(couple[0])) && (isSymbolEqualTo(couple[0], "else")) && (rst.length > 0)){
               errorInParsing(sexp, ["found an ",
                                     new types.ColoredPart("else clause", couple.location),
                                     "that isn't the last clause in its case expression; there is ",
                                     new types.ColoredPart("another clause", rst[0].location),
                                      " after it"]);
               } else {
                 return [parseCaseCouple(couple)].concat(rst);
               }
             }, []));
  }
 
  function parseBinding(sexp) {
    return sexpIsCouple(sexp) ? new couple(parseIdExpr(sexp[0]), parseExpr(sexp[1])) :
    errorInParsing(sexp, ["expected a sequence of key/value pairs, but given "
                          , new types.ColoredPart("something else", sexp[0].location)]);
  }

  function parseQuasiQuotedExpr(sexp, inlist) {
    return (sexp.length === 0) ? new qqList([]) :
    isCons(sexp)   ? parseQqList(sexp, inlist) :
    isString(sexp) ? sexp :
    isNumber(sexp) ? sexp :
    isBoolean(sexp)? sexp :
    isChar(sexp)   ? sexp :
    isSymbol(sexp) ? sexp :
    throwError(new types.Message(["quoted sexp"]), sexp.location);
  }

  function parseQqList(sexp, inlist) {
    return isSymbol(sexp[0]) ? isSymbolEqualTo(sexp[0], "unquote") ? parseExpr(sexp[1]) :
    isSymbolEqualTo(sexp[0], "unquote-splicing") ? inlist ? new qqSplice(parseExpr(sexp[1])) :
    throwError(new types.Message(["misuse of ,@ or `unquote-splicing' within a quasiquoting backquote"]), sexp.location) :
    new qqList(sexp.map(function (x) {
    return parseQuasiQuotedExpr(x, true);
  })) :
    new qqList(sexp.map(function (x) {
                    return parseQuasiQuotedExpr(x, true);
                    }));
  }
 
  function parseVector(sexp){
    sexp.vals = parseStar(sexp.vals);
    sexp.size = Math.max(sexp.size, sexp.vals.length);
    if(sexp.vals.length < sexp.size){
      for(var i=sexp.vals.length-1; i < sexp.size; i++)
        sexp.vals[i] = sexp.vals[sexp.vals.length-1] || 0;
    }
    return new callExpr(new symbolExpr("vector"), sexp.vals);
  }
 
  function parseExprSingleton(sexp) {
    var singleton = isString(sexp)  ? sexp :
                    isNumber(sexp)  ? sexp :
                    isBoolean(sexp) ? sexp :
                    isChar(sexp)    ? sexp :
                    isVector(sexp)  ? parseVector(sexp) :
                    isSymbolEqualTo("quote", sexp) ? new quotedExpr(sexp) :
                    isSymbolEqualTo("empty", sexp) ? new callExpr(new primop("list"), []) :
                    isSymbol(sexp) ? sexpIsPrimop(sexp) ? new primop(sexp) : sexp :
      throwError(new types.Message([sexp+"expected a function, but nothing's there"]), sexp.location);
   singleton.location = sexp.location;
   return singleton;
  }

  function parseIdExpr(sexp) {
    return isSymbol(sexp) ? sexp :
    throwError(new types.Message(["ID"]), sexp.location);
  }

  function isTupleStartingWithOfLength(sexp, symbol, n) {
    return ((isCons(sexp)) && (sexp.length === n) && (isSymbol(sexp[0])) && (isSymbolEqualTo(sexp[0], symbol)));
  }

  function sexpIsCouple(sexp) {
    return ((isCons(sexp)) && ((sexp.length === 2)));
  }

  function sexpIsPrimop(sexp) {
       return primitive.getPrimitive(sexp);
  }

  function sexpIsCondListP(sexp) {
    return ((isCons(sexp)) && (sexp.length >= 2) && (isSymbol(sexp[0])) && (isSymbolEqualTo(sexp[0], "cond")));
  }

  //////////////////////////////////////// REQUIRE PARSING ////////////////////////////////
  function isRequire(sexp) {
    return isCons(sexp) && isSymbol(sexp[0]) && isSymbolEqualTo(sexp[0], "require");
  }

  function parseRequire(sexp) {
    // is it (require)?
    if(sexp.length < 2){
      errorInParsing(sexp, ["expected a module name after `require', but found nothing"]);
    }
    // if it's (require (lib...))
    if((sexp[1] instanceof Array) && isSymbolEqualTo(sexp[1][0], "lib")){
        // is it (require (lib)) or (require (lib <string>))
        if(sexp[1].length < 3){
          errorInParsing(sexp, ["expected at least two strings after "
                                , new types.ColoredPart("lib", sexp[1][0].location)]);
        }
        // is it (require (lib not-strings))?
        rest(sexp[1]).forEach(function(str){
          if (!(str instanceof stringExpr)){
            errorInParsing(sexp, ["expected a string for a library collection, but found "
                                  , new types.ColoredPart("something else", str.location)]);
          }
         });
    // if it's (require (planet...))
    } else if((sexp[1] instanceof Array) && isSymbolEqualTo(sexp[1][0], "planet")){
      errorInParsing(sexp, ["Importing PLaneT pacakges is not supported at this time"]);
    // if it's (require <not-a-string-or-symbol>)
    } else if(!((sexp[1] instanceof symbolExpr) || (sexp[1] instanceof stringExpr))){
      errorInParsing(sexp, ["expected a module name as a string or a `(lib ...)' form, but found "
                            , new types.ColoredPart("something else", sexp[1].location)]);
    }
    var req = new requireExpr(sexp[1]);
    req.location = sexp.location;
    return req;
  }

  //////////////////////////////////////// PROVIDE PARSING ////////////////////////////////
 function isProvide(sexp) {
    return isCons(sexp) && isSymbol(sexp[0]) && isSymbolEqualTo(sexp[0], "provide");
 }
 function parseProvide(sexp) {
    var clauses = rest(sexp).map(function(p){
        // symbols are ok
        if(p instanceof symbolExpr){ return p;}
        // (struct-out sym) is ok
        if((p instanceof Array) && (p.length == 2)
           && (p[0] instanceof symbolExpr) && isSymbolEqualTo(p[0], "struct-out")
           && (p[1] instanceof symbolExpr)){
          return p;
        }
        // everything else is NOT okay
        errorInParsing(sexp, ["I don't recognize the syntax of this "
                              , new types.ColoredPart("clause", p.location)]);
    });
    var provide = new provideStatement(clauses);
    provide.location = sexp.location;
    return provide;
  }

  /////////////////////
  /* Export Bindings */
  /////////////////////
 window.parse = parse;
})();