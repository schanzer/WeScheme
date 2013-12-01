/* TODO
 - JSLint
 */

//////////////////////////////////////////////////////////////////////////////
///////////////////////////////// PARSER OBJECT //////////////////////////////
//////////////////////////////////////////////////////////////////////////////
(function () {
 'use strict';

  // parse : sexp -> AST
  var parse = (function (sexp) {
    return isEmpty(sexp) ? [] :
    (!isCons(sexp)) ? error(types.symbol("parse"), "The sexp is not a list of definitions or expressions: ", sexpGreaterThanString(sexp)) :
    parseStar(sexp);
  });

  // parse* : sexp list -> AST
  var parseStar = function (sexps) {
   var parseSExp = function (sexp) {
     return isDefinition(sexp) ? parseDefinition(sexp) :
     isExpr(sexp) ? parseExpr(sexp) :
     isTestCase(sexp) ? parseTestCase(sexp) :
     isRequire(sexp) ? parseRequire(sexp) :
     isProvide(sexp) ? parseProvide(sexp) :
     error(types.symbol("parse"), "Not a Definition, Expression, Test Case, Library Require, or Provide");
   };
    return sexps.map(parseSExp);
  };


  //////////////////////////////////////// DEFINITION PARSING ////////////////////////////////
  var isDefinition = function (sexp) {
    return ((isStructDefinition(sexp)) || (isFunctionDefinition(sexp)) || (isVariableDefinition(sexp)));
  };

  // if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define-struct'
  var isStructDefinition = function (sexp) {
    return ((isCons(sexp))
            && (sexp.length === 3)
            && (isSymbolExpr(sexp[0]))
            && (isSymbolEqualTo(types.symbol("define-struct"), sexp[0])));
  };

  // if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define' and rest is a Cons
  var isFunctionDefinition = function (sexp) {
    return ((isCons(sexp))
            && (sexp.length === 3)
            && (isSymbolExpr(sexp[0]))
            && (isSymbolEqualTo(types.symbol("define"), sexp[0]))
            && (isCons(sexp[1])));
  };

  // if it's an sexp of length 3, where the first sub-exp is a symbol and that symbol is 'define' and rest is NOT a Cons
  var isVariableDefinition = function (sexp) {
    return ((isCons(sexp))
            && (sexp.length === 3)
            && (isSymbolExpr(sexp[0]))
            && (isSymbolEqualTo(types.symbol("define"), sexp[0]))
            && (!(isCons(sexp[1]))));
  };

  // : parseDefinition : SExp -> AST (definition)
  var parseDefinition = function (sexp) {
    function parseDefStruct(sexp) {
      return new defStruct(parseIdExpr(sexp[1]), sexp[2].map(parseIdExpr));
    };
    function parseDefFunc(sexp) {
      return (rest(sexp[1]).length > 0) ? new defFunc(parseIdExpr(sexp[1][0]), rest(sexp[1]).map(parseIdExpr), parseExpr(sexp[2])) :
          error(types.symbol("parse-def-func"), stringAppend("expected at least one argument name after the", " function name, but found none."));
    };
    function parseDef(sexp) {
      return new defVar(parseIdExpr(sexp[1]), parseExpr(sexp[2]));
    };
   
    var def = isStructDefinition(sexp) ? parseDefStruct(sexp) :
              isFunctionDefinition(sexp) ? parseDefFunc(sexp) :
              isVariableDefinition(sexp) ? parseDef(sexp) :
              error(types.symbol("parse-definition"), stringAppend("Expected to find a definition, but found: ", sexpGreaterThanString(sexp)));
    def.location = sexp.location;
   return def;
  };


  //////////////////////////////////////// EXPRESSION PARSING ////////////////////////////////
  var isExpr = function (sexp) {
    return ((!(isDefinition(sexp))) && (!(isTestCase(sexp))) && (!(isRequire(sexp))) && (!(isProvide(sexp))));
  };

  var parseExpr = function (sexp) {
    return isCons(sexp) ? parseExprList(sexp) :
    parseExprSingleton(sexp);
  };

  // parseExprList : SExp -> AST
  // predicates and parsers for call, lambda, local, letrec, let, let*, if, and, or, time, quote and quasiquote exprs
  var parseExprList = function (sexp) {
    function isLambda(sexp) {
      return isTripleWithFirstEqualTo(sexp, types.symbol("lambda"));
    };
    function isLocal(sexp) {
      return isTripleWithFirstEqualTo(sexp, types.symbol("local"));
    };
    function isLetrec(sexp) {
      return isTripleWithFirstEqualTo(sexp, types.symbol("letrec"));
    };
    function isLet(sexp) {
      return isTripleWithFirstEqualTo(sexp, types.symbol("let"));
    };
    function isLetStar(sexp) {
      return isTripleWithFirstEqualTo(sexp, types.symbol("let*"));
    };
    function isIf(sexp) {
      return isQuadWithFirstEqualTo(sexp, types.symbol("if"));
    };
    function isBegin(sexp) {
      return ((isCons(sexp)) && (isSymbolExpr(sexp[0])) && (isSymbolEqualTo(sexp[0], types.symbol("begin"))));
    };
    function isAnd(sexp) {
      return ((isCons(sexp)) && (isSymbolExpr(sexp[0])) && (isSymbolEqualTo(sexp[0], types.symbol("and"))));
    };
    function isOr(sexp) {
      return ((isCons(sexp)) && (isSymbolExpr(sexp[0])) && (isSymbolEqualTo(sexp[0], types.symbol("or"))));
    };
    function isTime(sexp) {
      return isTupleStartingWithOfLength(sexp, types.symbol("time"), 2);
    };
    function parseFuncCall(sexp) {
      return isCons(sexp)? new call(parseExpr(sexp[0]), rest(sexp).map(parseExpr)) :
                          expectedError(types.symbol("parse-func-call"), "function call sexp", sexp);
    };
    function parseLambdaExpr(sexp) {
      return isLambda(sexp) ? (sexp[1].length > -1) ? new lambdaExpr(sexp[1].map(parseIdExpr), parseExpr(sexp[2])) :
      error(types.symbol("parse-lambda-expr"), stringAppend("expected at least one argument name in the ", "sequence after `lambda', but found none")) :
      expectedError(types.symbol("parse-lambda-expt"), "lambda function sexp", sexp);
    };
    function parseLocalExpr(sexp) {
      return isLocal(sexp) ? new localExpr(sexp[1].map(parseDefinition), parseExpr(sexp[2])) :
      expectedError(types.symbol("parse-local-expr"), "local expression sexp", sexp);
    };
    function parseLetrecExpr(sexp) {
      return isLetrec(sexp) ? new letrecExpr(sexp[1].map(parseLetCouple), parseExpr(sexp[2])) :
      expectedError(types.symbol("parse-letrec-expr"), "letrec expression sexp", sexp);
    };

    function parseLetExpr(sexp) {
      return isLet(sexp) ? new letExpr(sexp[1].map(parseLetCouple), parseExpr(sexp[2])) :
      expectedError(types.symbol("parse-let-expr"), "let expression sexp", sexp);
    };
    function parseLetStarExpr(sexp) {
      return isLetStar(sexp) ? new letStarExpr(sexp[1].map(parseLetCouple), parseExpr(sexp[2])) :
      expectedError(types.symbol("parse-let*-expr"), "let* expression sexp", sexp);
    };
    function parseIfExpr(sexp) {
      return isIf(sexp) ? new ifExpr(parseExpr(sexp[1]), parseExpr(sexp[2]), parseExpr(sexp[3])) :
      expectedError(types.symbol("parse-if-expr"), "if expression sexp", sexp);
    };
    function parseBeginExpr(sexp) {
      return isBegin(sexp) ? new beginExpr(rest(sexp).map(parseExpr)) :
      expectedError(types.symbol("parse-begin-expr"), "begin expression sexp", sexp);
    };
    function parseAndExpr(sexp) {
      return isAnd(sexp) ? new andExpr(rest(sexp).map(parseExpr)) :
      expectedError(types.symbol("parse-and-expr"), "and expression sexp", sexp);
    };
    function parseOrExpr(sexp) {
      return isOr(sexp) ? new orExpr(rest(sexp).map(parseExpr)) :
      expectedError(types.symbol("parse-or-expr"), "or expression sexp", sexp);
    };
    function parseTimeExpr(sexp) {
      return isTime(sexp) ? new timeExpr(parseExpr(sexp[1])) :
      expectedError(types.symbol("parse-time-expr"), "time expression sexp", sexp);
    };
    function parseQuotedExpr(sexp) {
      return new quotedExpr(isEmpty(sexp) ?   new call(new primop(types.symbol("list")), []) :
                            isCons(sexp) ?    new call(new primop(types.symbol("list")), map(parseQuotedExpr, sexp)) :
                            isNumber(sexp) ?  new numberExpr(sexp) :
                            isString(sexp) ?  new stringExpr(sexp) :
                            isChar(sexp) ?    new charExpr(sexp.val) :
                            isSymbolExpr(sexp) ?  new symbolExpr(sexp) :
                            expectedError(types.symbol("parse-quoted-expr"), "quoted sexp", sexp));
    };
    return (function () {
        var peek = sexp[0];
        var expr = !(isSymbolExpr(peek)) ? parseFuncCall(sexp) :
                    isSymbolEqualTo(types.symbol("lambda"), peek)  ? parseLambdaExpr(sexp) :
                    isSymbolEqualTo(types.symbol("local"), peek)   ? parseLocalExpr(sexp) :
                    isSymbolEqualTo(types.symbol("letrec"), peek)  ? parseLetrecExpr(sexp) :
                    isSymbolEqualTo(types.symbol("let"), peek)     ? parseLetExpr(sexp) :
                    isSymbolEqualTo(types.symbol("let*"), peek)    ? parseLetStarExpr(sexp) :
                    isSymbolEqualTo(types.symbol("cond"), peek)    ? parseCondExpr(sexp) :
                    isSymbolEqualTo(types.symbol("if"), peek)      ? parseIfExpr(sexp) :
                    isSymbolEqualTo(types.symbol("begin"), peek)   ? parseBeginExpr(sexp) :
                    isSymbolEqualTo(types.symbol("and"), peek)     ? parseAndExpr(sexp) :
                    isSymbolEqualTo(types.symbol("or"), peek)      ? parseOrExpr(sexp) :
                    isSymbolEqualTo(types.symbol("time"), peek)    ? parseTimeExpr(sexp) :
                    isSymbolEqualTo(types.symbol("quote"), peek)   ? parseQuotedExpr(sexp[1]) :
                    isSymbolEqualTo(types.symbol("quasiquote"), peek) ? parseQuasiQuotedExpr(sexp[1], false) :
                    parseFuncCall(sexp);
          expr.location = sexp.location;
          return expr;
   })();
  };

  var parseCondExpr = function (sexp) {
   if(sexpIsCondListP(sexp)){
      return new condExpr(rest(sexp).reduceRight((function (rst, couple) {
                                 if((isSymbolExpr(couple[0])) && (isSymbolEqualTo(couple[0], types.symbol("else"))) && (!(isEmpty(rst)))){
                                 return error(types.symbol("parse-cond-expr"),
                                              stringAppend("found an `else' clause", " that isn't the last", " clause in its `cond'", " expression"));
                                 } else {
                                   return cons(parseCondCouple(couple), rst);
                                 }
                                 }), []));
   } else {
    expectedError(types.symbol("parse-cond-expr"), "cond expression sexp", sexp);
   }
  };

  var parseCondCouple = function (sexp) {
   if(sexpIsisCouple(sexp)){
      var cpl = new couple(parseExpr(sexp[0]), parseExpr(sexp[1]));
      cpl.location = sexp.location;
      return cpl;
   } else {
      return expectedError(types.symbol("parse-cond-couple"), "couple of expressions sexp", sexp);
   }
  };

  var parseLetCouple = function (sexp) {
    return sexpIsisCouple(sexp) ? new couple(parseIdExpr(sexp[0]), parseExpr(sexp[1])) :
    expectedError(types.symbol("parse-let-couple"), "couple of an id and an expression sexp", sexp);
  };

  var parseQuasiQuotedExpr = function (sexp, inlist) {
    return isEmpty(sexp) ? new qqList([]) :
    isCons(sexp) ? parseQqList(sexp, inlist) :
    isNumber(sexp) ? new numberExpr(sexp) :
    isString(sexp) ? new stringExpr(sexp) :
    isChar(sexp) ? new charExpr(sexp.val) :
    isSymbolExpr(sexp) ? new symbolExpr(sexp) :
    expectedError(types.symbol("parse-quoted-expr"), "quoted sexp", sexp);
  };

  var parseQqList = function (sexp, inlist) {
    return isSymbolExpr(sexp[0]) ? isSymbolEqualTo(sexp[0], types.symbol("unquote")) ? parseExpr(sexp[1]) :
    isSymbolEqualTo(sexp[0], types.symbol("unquote-splicing")) ? inlist ? new qqSplice(parseExpr(sexp[1])) :
    error(types.symbol("unquote-splicing"), "misuse of ,@ or `unquote-splicing' within a quasiquoting backquote") :
    new qqList(sexp.map((function (x) {
    return parseQuasiQuotedExpr(x, true);
  }))) :
    new qqList(sexp.map((function (x) {
                    return parseQuasiQuotedExpr(x, true);
                    })));
  };

  var parseExprSingleton = function (sexp) {
    function parseImage(img) {
      return new imageExpr(encodeImage(img), imageWidth(img), imageHeight(img), pinholeX(img), pinholeY(img));
    };
    var singleton = isString(sexp) ? new stringExpr(sexp) :
                    isNumber(sexp) ? new numberExpr(sexp) :
                    isSymbolEqualTo(types.symbol("quote"), sexp) ? new quotedExpr(sexp) :
                    isChar(sexp) ? new charExpr(sexp.val) :
                    ((isSymbolEqualTo(types.symbol("true"), sexp)) || (isSymbolEqualTo(types.symbol("false"), sexp))) ? new booleanExpr(sexp) :
                    isSymbolEqualTo(types.symbol("empty"), sexp) ? new call(new primop(types.symbol("list")), []) :
                    isSymbolExpr(sexp) ? sexpIsisPrimop(sexp) ? new primop(sexp) : sexp :
                    imageP(sexp) ? parseImage(sexp) :
      error(types.symbol("parse-expr-singleton"), stringAppend("( ): ", sexpGreaterThanString(sexp), "expected a function, but nothing's there"));
   singleton.location = sexp.location;
   return singleton;
  };


  var parseIdExpr = function (sexp) {
    return isId(sexp) ? sexp :
    expectedError(types.symbol("parse-id-expr"), "ID", sexp);
  };

  var isTupleStartingWithOfLength = function (sexp, symbol, n) {
    return ((isCons(sexp)) && (sexp.length === n) && (isSymbolExpr(sexp[0])) && (isSymbolEqualTo(sexp[0], symbol)));
  };

  var isTripleWithFirstEqualTo = function (sexp, symbol) {
    return isTupleStartingWithOfLength(sexp, symbol, 3);
  };

  var isQuadWithFirstEqualTo = function (sexp, symbol) {
    return isTupleStartingWithOfLength(sexp, symbol, 4);
  };

  var sexpIsisCouple = function (sexp) {
    return ((isCons(sexp)) && ((sexp.length === 2)));
  };

  var sexpIsisPrimop = function (sexp) {
       return primitive.getPrimitive(sexp);
  };

  var sexpIsCondListP = function (sexp) {
    return ((isCons(sexp)) && (sexp.length >= 2) && (isSymbolExpr(sexp[0])) && (isSymbolEqualTo(sexp[0], types.symbol("cond"))));
  };

  var isId = function (sexp) {
    return isSymbolExpr(sexp);
  };

  //////////////////////////////////////// TEST-CASE PARSING ////////////////////////////////
  var isTestCase = function (sexp) {
    return ((isCons(sexp)) &&
            (isSymbolExpr(sexp[0])) &&
            (((isSymbolEqualTo(sexp[0], types.symbol("check-expect"))) ||
              (isSymbolEqualTo(sexp[0], types.symbol("check-within"))) ||
              (isSymbolEqualTo(sexp[0], types.symbol("EXAMPLE"))) ||
              (isSymbolEqualTo(sexp[0], types.symbol("check-error")))
                                                         )));
  };

  var isCheckExpect = function (sexp) {
    return isTripleWithFirstEqualTo(sexp, types.symbol("check-expect")) ||
           isTripleWithFirstEqualTo(sexp, types.symbol("EXAMPLE"));
  };

  var isCheckError = function (sexp) {
    return isTripleWithFirstEqualTo(sexp, types.symbol("check-error"));
  };

  var isCheckWithin = function (sexp) {
    return isQuadWithFirstEqualTo(sexp, types.symbol("check-within"));
  };

  // parseTestCase : SExp -> AST
  var parseTestCase = function (sexp) {
    function parseCheckExpect(sexp) {
      return isCheckExpect(sexp) ? new chkExpect(parseExpr(sexp[1]), parseExpr(sexp[2]), sexp) :
      expectedError(types.symbol("parse-check-expect"), "check expect sexp", sexp);
    };
    function parseCheckError(sexp) {
      return isCheckError(sexp) ? new chkError(parseExpr(sexp[1]), parseExpr(sexp[2]), sexp) :
      expectedError(types.symbol("parse-check-error"), "check error sexp", sexp);
    };
    function parseCheckWithin(sexp) {
      return isCheckWithin(sexp) ? new chkWithin(parseExpr(sexp[1]), parseExpr(sexp[2]), parseExpr(sexp[3]), sexp) :
      expectedError(types.symbol("parse-check-within"), "check within sexp", sexp);
    };

    var testCase = isCons(sexp) ? isSymbolEqualTo(sexp[0], types.symbol("check-expect")) ? parseCheckExpect(sexp) :
        isSymbolEqualTo(sexp[0], types.symbol("EXAMPLE")) ? parseCheckExpect(sexp) :
        isSymbolEqualTo(sexp[0], types.symbol("check-error")) ? parseCheckError(sexp) :
        isSymbolEqualTo(sexp[0], types.symbol("check-within")) ? parseCheckWithin(sexp) :
        error(types.symbol("parse-test-case"), stringAppend("Expected a test case but instead found: ", sexpGreaterThanString(sexp))) :
        expectedError(types.symbol("parse-test-case"), "test-case sexp", sexp);
    testCase.location = sexp.location;
    return testCase;
  };

  //////////////////////////////////////// REQUIRE PARSING ////////////////////////////////
  var isRequire = function (sexp) {
    return ((isCons(sexp)) && ((function () { var fst = sexp[0];

  return ((isSymbolExpr(fst)) && (isSymbolEqualTo(fst, types.symbol("require"))));
   })()));
  };

  var parseRequire = function (sexp) {
    return (function () { var uri = sexp[1];
      var req = ((isString(uri)) || (isSymbolExpr(uri))) ? new req(uri) :
        isSymbolEqualTo(uri[0], types.symbol("lib")) ? new req(uri) :
        new req(cons(types.symbol("planet"), cons(second(uri), [rest(third(uri))])));
      req.location = sexp.location;
      return req;
   })();
  };

  //////////////////////////////////////// PROVIDE PARSING ////////////////////////////////
  var isProvide = function (sexp) {
    return ((isCons(sexp)) && (isSymbolExpr(sexp[0])) && (isSymbolEqualTo(sexp[0], types.symbol("provide"))));
  };

  var parseProvide = function (sexp) {
    var provide = new provide(isSymbolExpr(sexp[1]) ? rest(sexp) : types.symbol("all-defined-out"));
    provide.location = sexp.location;
    return provide;
  };

  var sexpGreaterThanString = function (sexp) {
    return format("~a", sexp);
  };

  var expectedError = function (id, expected, actual) {
    return error(id, stringAppend("Expected a ", expected, " but found: ", sexpGreaterThanString(actual)));
  };

  /////////////////////
  /* Export Bindings */
  /////////////////////
 window.parse = parse;
})();