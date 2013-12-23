/* TODO
 - JSLint
 - parse bugs: (define 2) (cond)
 */

(function () {
 'use strict';
 
 //////////////////////////////////// INSTANCE CHECKING WRAPPERS //////////////////////////////
 function isString(x) { return (x instanceof Constant && types.isString(x.val));}
 function isNumber(x) {return (x instanceof Constant && types.isNumber(x.val));}
 function isSymbolExpr(x) { return x instanceof symbolExpr; };
 var isChar = types.isChar;
 
  // PARSING ///////////////////////////////////////////
 
  // parse : sexp -> AST
  function parse(sexp) {
    return isEmpty(sexp) ? [] :
    (!isCons(sexp)) ? throwError(new types.Message(["The sexp is not a list of definitions or expressions: "+sexp]),
                                sexp.location):
    parseStar(sexp);
  };

  // parse* : sexp list -> AST
  function parseStar(sexps) {
   function parseSExp(sexp) {
     return isDefinition(sexp) ? parseDefinition(sexp) :
     isExpr(sexp) ? parseExpr(sexp) :
     isRequire(sexp) ? parseRequire(sexp) :
     isProvide(sexp) ? parseProvide(sexp) :
     throwError(new types.Message(["Not a Definition, Expression, Library Require, or Provide"]),
                                  sexp.location);
    };
    return sexps.map(parseSExp);
  };


  //////////////////////////////////////// DEFINITION PARSING ////////////////////////////////
  function isDefinition(sexp) {
    return (isStructDefinition(sexp) || isFunctionDefinition(sexp) || isVariableDefinition(sexp));
  };

  // if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define-struct'
  function isStructDefinition(sexp) {
    return ((isCons(sexp))
            && (sexp.length === 3)
            && (isSymbolExpr(sexp[0]))
            && (isSymbolEqualTo("define-struct", sexp[0])));
  };

  // if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define' and rest is a Cons
  function isFunctionDefinition(sexp) {
    return ((isCons(sexp))
            && (sexp.length === 3)
            && (isSymbolExpr(sexp[0]))
            && (isSymbolEqualTo("define", sexp[0]))
            && (isCons(sexp[1])));
  };

  // if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define' and rest is NOT a Cons
  function isVariableDefinition(sexp) {
    return ((isCons(sexp))
            && (sexp.length === 3)
            && (isSymbolExpr(sexp[0]))
            && (isSymbolEqualTo("define", sexp[0]))
            && (!(isCons(sexp[1]))));
  };

  // : parseDefinition : SExp -> AST (definition)
  function parseDefinition(sexp) {
    function parseDefStruct(sexp) {
      return new defStruct(parseIdExpr(sexp[1]), sexp[2].map(parseIdExpr));
    }
    function parseDefFunc(sexp) {
      return (rest(sexp[1]).length > 0) ?
          new defFunc(parseIdExpr(sexp[1][0]), rest(sexp[1]).map(parseIdExpr), parseExpr(sexp[2])) :
          throwError(new types.Message(["expected at least one argument name after the function name, but found none."]),
                     sexp.location);
    }
    function parseDef(sexp) {
      return new defVar(parseIdExpr(sexp[1]), parseExpr(sexp[2]));
    }
    var def = isStructDefinition(sexp) ? parseDefStruct(sexp) :
              isFunctionDefinition(sexp) ? parseDefFunc(sexp) :
              isVariableDefinition(sexp) ? parseDef(sexp) :
              throwError(new types.Message(["Expected to find a definition, but found: "+ sexp]),
                         sexp.location);
    def.location = sexp.location;
   return def;
  };


  //////////////////////////////////////// EXPRESSION PARSING ////////////////////////////////
  function isExpr(sexp) {
    return ((!(isDefinition(sexp))) && (!(isRequire(sexp))) && (!(isProvide(sexp))));
  };

  function parseExpr(sexp) {
    return isCons(sexp) ? parseExprList(sexp) :
    parseExprSingleton(sexp);
  };

  // parseExprList : SExp -> AST
  // predicates and parsers for call, lambda, local, letrec, let, let*, if, and, or, time, quote and quasiquote exprs
  function parseExprList(sexp) {
    function isLambda(sexp) {
      return isTripleWithFirstEqualTo(sexp, "lambda");
    }
    function isLocal(sexp) {
      return isTripleWithFirstEqualTo(sexp, "local");
    }
    function isLetrec(sexp) {
      return isTripleWithFirstEqualTo(sexp, "letrec");
    }
    function isLet(sexp) {
      return isTripleWithFirstEqualTo(sexp, "let");
    }
    function isLetStar(sexp) {
      return isTripleWithFirstEqualTo(sexp, "let*");
    }
    function isIf(sexp) {
      return isQuadWithFirstEqualTo(sexp, "if");
    }
    function isBegin(sexp) {
      return ((isCons(sexp)) && (isSymbolExpr(sexp[0]))
              && (isSymbolEqualTo(sexp[0], "begin")) && sexp.length >= 2);
    }
    function isAnd(sexp) {
      return ((isCons(sexp)) && (isSymbolExpr(sexp[0]))
              && (isSymbolEqualTo(sexp[0], "and")) && sexp.length >= 3);
    }
    function isOr(sexp) {
      return ((isCons(sexp)) && (isSymbolExpr(sexp[0]))
              && (isSymbolEqualTo(sexp[0], "or")) && sexp.length >= 3);
    }
    function isTime(sexp) {
      return isTupleStartingWithOfLength(sexp, "time", 2);
    }
    function parseFuncCall(sexp) {
      return isCons(sexp)? new callExpr(parseExpr(sexp[0]), rest(sexp).map(parseExpr)) :
                          throwError(new types.Message(["function call sexp"]), sexp.location);
    }
    function parseLambdaExpr(sexp) {
      return isLambda(sexp) ? (sexp[1].length > -1) ?
        new lambdaExpr(sexp[1].map(parseIdExpr), parseExpr(sexp[2])) :
        throwError(new types.Message([new types.ColoredPart("lambda", sexp[0].location)
                                      ," : expected at least one variable (in parentheses) after lambda, but found "
                                      , new types.ColoredPart("something else", sexp[1].location)])
                   , sexp.location) :
        throwError(new types.Message([new types.ColoredPart("lambda", sexp[0].location)
                                      ," : expected at least one variable (in parentheses) after lambda, but found "
                                      , new types.ColoredPart("something else", sexp[1].location)])
                   , sexp.location);
    }
    function parseLocalExpr(sexp) {
      return isLocal(sexp) ? new localExpr(sexp[1].map(parseDefinition), parseExpr(sexp[2])) :
        throwError(new types.Message([new types.ColoredPart("local", sexp[0].location)
                               ," : expected a collection of definitions, but given "
                               , new types.ColoredPart("something else", sexp[1].location)])
                  , sexp.location);
    }
    function parseLetrecExpr(sexp) {
      return isLetrec(sexp) ? new letrecExpr(sexp[1].map(parseLetCouple), parseExpr(sexp[2])) :
        throwError(new types.Message([new types.ColoredPart("letrec", sexp[0].location)
                                      ," : expected an expression after the bindings, but nothing's there"])
                    , sexp.location);

    }
    function parseLetExpr(sexp) {
      return isLet(sexp) ? new letExpr(sexp[1].map(parseLetCouple), parseExpr(sexp[2])) :
        throwError(new types.Message([new types.ColoredPart("let", sexp[0].location)
                               ," : expected a sequence of key/value pairs, but given "
                               , new types.ColoredPart("something else", sexp[1].location)])
                  , sexp.location);
    }
    function parseLetStarExpr(sexp) {
      return isLetStar(sexp) ? new letStarExpr(sexp[1].map(parseLetCouple), parseExpr(sexp[2])) :
        throwError(new types.Message([new types.ColoredPart("let*", sexp[0].location)
                               ," : expected a sequence of key/value pairs, but given "
                               , new types.ColoredPart("something else", sexp[1].location)])
                  , sexp.location);
    }
    function parseIfExpr(sexp) {
      return isIf(sexp) ? new ifExpr(parseExpr(sexp[1]), parseExpr(sexp[2]), parseExpr(sexp[3])) :
      throwError(new types.Message([new types.ColoredPart("if", sexp[0].location)
                                    ,": expected a test, a consequence, and an "
                                    ,"alternative, but all three were not found"])
                 , sexp.location);
    }
    function parseBeginExpr(sexp) {
      return isBegin(sexp) ? new beginExpr(rest(sexp).map(parseExpr)) :
        throwError(new types.Message(["Inside a begin, expected to find a body, but nothing was found."])
                   , sexp.location);
    }
    function parseAndExpr(sexp) {
      return isAnd(sexp) ? new andExpr(rest(sexp).map(parseExpr)) :
        throwError(new types.Message([new types.ColoredPart("and", sexp[0].location),
                                      ": expected at least 2 arguments, but given ",
                                      (sexp.length-1).toString()])
                 , sexp.location);
    }
    function parseOrExpr(sexp) {
      return isOr(sexp) ? new orExpr(rest(sexp).map(parseExpr)) :
        throwError(new types.Message([new types.ColoredPart("or", sexp[0].location)
                                    ,": expected at least 2 arguments, but given "
                                    ,(sexp.length-1).toString()])
                 , sexp.location);
    }
    function parseTimeExpr(sexp) {
      return isTime(sexp) ? new timeExpr(parseExpr(sexp[1])) :
      throwError(new types.Message(["time expression sexp"]), sexp.location);
    }
    function parseQuotedExpr(sexp) {
      return new quotedExpr(isEmpty(sexp) ?   new callExpr(new primop("list"), []) :
                            isCons(sexp) ?    new callExpr(new primop("list"), sexp.map(parseQuotedExpr)) :
                            isNumber(sexp) ?  new numberExpr(sexp) :
                            isString(sexp) ?  new stringExpr(sexp) :
                            isChar(sexp) ?    new charExpr(sexp.val) :
                            isSymbolExpr(sexp) ?  new symbolExpr(sexp) :
                            throwError(new types.Message(["quoted sexp"]), sexp.location));
    }
    return (function () {
        var peek = sexp[0];
        var expr = !(isSymbolExpr(peek)) ? parseFuncCall(sexp) :
                    isSymbolEqualTo("lambda", peek)  ? parseLambdaExpr(sexp) :
                    isSymbolEqualTo("local", peek)   ? parseLocalExpr(sexp) :
                    isSymbolEqualTo("letrec", peek)  ? parseLetrecExpr(sexp) :
                    isSymbolEqualTo("let", peek)     ? parseLetExpr(sexp) :
                    isSymbolEqualTo("let*", peek)    ? parseLetStarExpr(sexp) :
                    isSymbolEqualTo("cond", peek)    ? parseCondExpr(sexp) :
                    isSymbolEqualTo("if", peek)      ? parseIfExpr(sexp) :
                    isSymbolEqualTo("begin", peek)   ? parseBeginExpr(sexp) :
                    isSymbolEqualTo("and", peek)     ? parseAndExpr(sexp) :
                    isSymbolEqualTo("or", peek)      ? parseOrExpr(sexp) :
                    isSymbolEqualTo("time", peek)    ? parseTimeExpr(sexp) :
                    isSymbolEqualTo("quote", peek)   ? parseQuotedExpr(sexp[1]) :
                    isSymbolEqualTo("quasiquote", peek) ? parseQuasiQuotedExpr(sexp[1], false) :
                    parseFuncCall(sexp);
          expr.location = sexp.location;
          return expr;
   })();
  };

  function parseCondExpr(sexp) {
    function parseCondCouple(sexp_) {
      if(sexpIsisCouple(sexp_)){
        var cpl = new couple(parseExpr(sexp_[0]), parseExpr(sexp_[1]));
        cpl.location = sexp_.location;
        return cpl;
      } else {
        return throwError(new types.Message([new types.ColoredPart("cond", sexp[0].location),
                                             " : expected a clause with a question and an answer, but found a ",
                                             new types.ColoredPart("clause", sexp_.location),
                                             " with only ",
                                             new types.ColoredPart("one part", sexp_[0].location)])
                          , sexp.location);
      }
    }
 
    if(sexpIsCondListP(sexp)){
      return new condExpr(rest(sexp).reduceRight((function (rst, couple) {
                                 if((isSymbolExpr(couple[0])) && (isSymbolEqualTo(couple[0], "else")) && (!(isEmpty(rst)))){
                                 return throwError(new types.Message([new types.ColoredPart("cond", sexp[0].location),
                                                                      " : found an ",
                                                                      new types.ColoredPart("else clause", couple.location),
                                                                      "that isn't the last clause in its cond expression; there is ",
                                                                      new types.ColoredPart("another clause", rst[0].location),
                                                                      " after it"])
                                                   , couple.location);
                                 } else {
                                   return cons(parseCondCouple(couple), rst);
                                 }
                                 }), []));
    } else {
      throwError(new types.Message([new types.ColoredPart("cond", sexp[0].location),
                                    " : expected at least one clause after cond, but nothing's there"])
                 , sexp.location);
    }
  };

  function parseLetCouple(sexp) {
    return sexpIsisCouple(sexp) ? new couple(parseIdExpr(sexp[0]), parseExpr(sexp[1])) :
    throwError(new types.Message([" : expected a sequence of key/value pairs, but given "
                                 , new types.ColoredPart("something else", sexp[0].location)])
                , sexp.location);

  };

  function parseQuasiQuotedExpr(sexp, inlist) {
    return isEmpty(sexp) ? new qqList([]) :
    isCons(sexp) ? parseQqList(sexp, inlist) :
    isNumber(sexp) ? new numberExpr(sexp) :
    isString(sexp) ? new stringExpr(sexp) :
    isChar(sexp) ? new charExpr(sexp.val) :
    isSymbolExpr(sexp) ? new symbolExpr(sexp) :
    throwError(new types.Message(["quoted sexp"]), sexp.location);
  };

  function parseQqList(sexp, inlist) {
    return isSymbolExpr(sexp[0]) ? isSymbolEqualTo(sexp[0], "unquote") ? parseExpr(sexp[1]) :
    isSymbolEqualTo(sexp[0], "unquote-splicing") ? inlist ? new qqSplice(parseExpr(sexp[1])) :
    throwError(new types.Message(["misuse of ,@ or `unquote-splicing' within a quasiquoting backquote"]), sexp.location) :
    new qqList(sexp.map((function (x) {
    return parseQuasiQuotedExpr(x, true);
  }))) :
    new qqList(sexp.map((function (x) {
                    return parseQuasiQuotedExpr(x, true);
                    })));
  };

  function parseExprSingleton(sexp) {
    function parseImage(img) {
      return new imageExpr(encodeImage(img), imageWidth(img), imageHeight(img), pinholeX(img), pinholeY(img));
    };
    var singleton = isString(sexp) ? new stringExpr(sexp) :
                    isNumber(sexp) ? new numberExpr(sexp) :
                    isSymbolEqualTo("quote", sexp) ? new quotedExpr(sexp) :
                    isChar(sexp) ? new charExpr(sexp.val) :
                    ((isSymbolEqualTo("true", sexp)) || (isSymbolEqualTo("false", sexp))) ? new booleanExpr(sexp) :
                    isSymbolEqualTo("empty", sexp) ? new callExpr(new primop("list"), []) :
                    isSymbolExpr(sexp) ? sexpIsisPrimop(sexp) ? new primop(sexp) : sexp :
      throwError(new types.Message([sexp+"expected a function, but nothing's there"]), sexp.location);
   singleton.location = sexp.location;
   return singleton;
  };

  function parseIdExpr(sexp) {
    return isId(sexp) ? sexp :
    throwError(new types.Message(["ID"]), sexp.location);
  };

  function isTupleStartingWithOfLength(sexp, symbol, n) {
    return ((isCons(sexp)) && (sexp.length === n) && (isSymbolExpr(sexp[0])) && (isSymbolEqualTo(sexp[0], symbol)));
  };

  function isTripleWithFirstEqualTo(sexp, symbol) {
    return isTupleStartingWithOfLength(sexp, symbol, 3);
  };

  function isQuadWithFirstEqualTo(sexp, symbol) {
    return isTupleStartingWithOfLength(sexp, symbol, 4);
  };

  function sexpIsisCouple(sexp) {
    return ((isCons(sexp)) && ((sexp.length === 2)));
  };

  function sexpIsisPrimop(sexp) {
       return primitive.getPrimitive(sexp);
  };

  function sexpIsCondListP(sexp) {
    return ((isCons(sexp)) && (sexp.length >= 2) && (isSymbolExpr(sexp[0])) && (isSymbolEqualTo(sexp[0], "cond")));
  };

  function isId(sexp) {
    return isSymbolExpr(sexp);
  };

  //////////////////////////////////////// REQUIRE PARSING ////////////////////////////////
  function isRequire(sexp) {
    return isCons(sexp) && isSymbolExpr(sexp[0]) && isSymbolEqualTo(sexp[0], "require");
  };

  function parseRequire(sexp) {
    var uri = sexp[1];
    var require = (isString(uri) || isSymbolExpr(uri)) ? new req(uri) :
              isSymbolEqualTo(uri[0], "lib") ? new req(uri) :
              new req(cons("planet", cons(second(uri), [rest(third(uri))])));
    req.location = sexp.location;
    return require;
  };

  //////////////////////////////////////// PROVIDE PARSING ////////////////////////////////
 function isProvide(sexp) {
    return isCons(sexp) && isSymbolExpr(sexp[0]) && isSymbolEqualTo(sexp[0], "provide");
 };
 function parseProvide(sexp) {
    var provide = new provideStatement(isSymbolExpr(sexp[1]) ? rest(sexp) : "all-defined-out");
    provide.location = sexp.location;
    return provide;
  };

  /////////////////////
  /* Export Bindings */
  /////////////////////
 window.parse = parse;
})();