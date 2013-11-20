
/////////////  BASIC MACHINE STRUCTURES AND OPERATIONS /////////////
function aBox(x)  { this.x = x; }
function box(x)   { return new aBox(x); }
function unbox(b) { return b.x; }
function boxP(b)  { return b instanceof aBox; }
function setDashBoxB(b, x) { b.x = x; }

var empty = [];

function structDashVal(type,fields) {
  this.type = type;
  this.fields = fields;
}
function makeDashStructDashVal(type,fields) {
  return new structDashVal(type,fields);
}
function structDashValP(x) { return x instanceof structDashVal; }
function structDashValDashType(x) { return x.type; }
function structDashValDashFields(x) { return x.fields; }
structDashVal.prototype.toString =
  function () {
    var str = "#(struct:" + this.type.toString();
    for(var i=0;i<this.fields.length;i++)
      str += " " + this.fields[i].toString();
    return str + ")";
  };

function charDashVal(str) {
  this.str = str;
};
function makeDashCharDashVal(str) { return new charDashVal(str); };
function charDashValP(x) { return x instanceof charDashVal; };
function charDashValDashStr(x) { return x.str; };

function quote(x)    { this.x = x; }
var symbolP = types.isSymbol;
function quoteVal(q) { return q.x; }
quote.prototype.toString = function () {
    return this.x.toString();
};

function chr(x)     { this.x = x; }
function charP(c)   { return c instanceof chr; }
function chrVal(c)  { return c.x; }
chr.prototype.toString =
  function () {
    return this.x.toString();
  };

function image(x)    { this.x = x; }
function imageP(i)   { return i instanceof image; }
function imageVal(i) { return i.x; }
image.prototype.toString =
  function () {
    return "#<image-snip%>";
  };

function unquoteSplicing(x)     { this.x = x; }
function unquoteSplicingP(u)    { return u instanceof unquoteSplicing; }
function unquoteSplicingVal(u)  { return u.x; }

function eofObject() { }
function eof() { return new eofObject(); }
function eofDashObjectP(x) { return x instanceof eofObject; }

function qqList(ls) {
  var ret = [];

  for(var i = 0; i < ls.length; i++) {
    if(unquoteSplicingP(ls[i])) {
      var subls = unquoteSplicingVal(ls[i]);
      ret = ret.concat(subls);
    } else
      ret = ret.concat([ls[i]]);

  }

  return ret;
}

Array.prototype.toString = function () {
  var str = "(";
  for(var i=0; i<this.length; i++)
    str += this[i].toString() + (i+1===this.length ? "" : " ");
  return str + ")";
};

function require(x) {
//  var oRequest = new XMLHttpRequest();
//  oRequest.open( "GET", x, false);
//  oRequest.send(null);
//  eval(oRequest.responseText);  // FIXME
}

function provide(x) {
  return x;
}
function allDashDefinedDashOut() {
  return "alldefinedout";
}
function checkDashExpect(x) {
  return x;
}



/////////////////////////////////////////// PRESET VARIABLES and PRIMITIVES //////////////////////
var e = Math.E;
var pi = Math.PI;

// hasArgs : Number Number Number -> Void
// if the argv list's length (first num) is less than min
// or more than max an error indicating such is thrown.
// Otherwise, void is returned.
function hasArgs(argv, min, max) {
  if(min != -1 && argv < min)
    throw new Error("Procedure must have at least " + min + " argument(s)!");
  else if(max != -1 && argv > max)
    throw new Error("Procedure must have at most " + max + " argument(s)!");
  return;
}

// plus : Number ... -> Number
function plus() {
  return foldl(jsnums.add, 0, arguments);
}

// minus : Number ... -> Number
function minus() {
  hasArgs(arguments.length, 1, -1);
  if(arguments.length === 1)
    return -arguments[0];
  else
    return foldl(jsnums.subtract, arguments[0], Array.prototype.slice.call(arguments,1));
}

// times : Number ... -> Number
function times() {
  return foldl(jsnums.multiply, 1, arguments);
}

// divide : Number ... -> Number
function divide() {
  hasArgs(arguments.length, 2, -1);
  return foldl(jsnums.divide, arguments[0], Array.prototype.slice.call(arguments,1));
}

function __posn(x, y) {
  this.x = x;
  this.y = y;
}

function makeDashPosn(x, y) {
  return new __posn(x, y);
}

function posnP(x) {
  return x instanceof __posn;
}

function posnDashX(posn) {
  return posn.x;
}

function posnDashY(posn) {
  return posn.y;
}

// * : types.Number -> various
// all of these assume native WeScheme Number types
var abs   = jsnums.abs;
var sin   = jsnums.sin;
var asin  = jsnums.asin;
var cos   = jsnums.cos;
var acos  = jsnums.acos;
var tan   = jsnums.tan;
var atan  = jsnums.atan;
var exp   = jsnums.expt;
var expt  = jsnums.pow;
var floor = jsnums.floor;
var log   = jsnums.log;
var round = jsnums.round;
var sqrt  = jsnums.sqrt;
var sqr   = jsnums.sqr;
var sinh  = jsnums.sinh;
var cosh  = jsnums.cosh;
var modulo= jsnums.modulo
var ceiling=jsnums.ceiling;
var integerP=jsnums.isInteger;
var realP = jsnums.isReal;
var real  = jsnums.isReal;
var quotient = jsnums.quotient;
var remainder = jsnums.remainder;



// add1 : Number -> Number
function add1(x) { return jsnums.add(x, 1); }

// returns the number of seconds since January 1, 1970, 00:00:00 UTC
function currentDashSeconds() {
  return (new Date()).getTime()/1000;
}

function evenP(x) { return x%2===0; }

// gcd : Number ... -> Number
// determines the greatest common divisor of its arguments
function gcd(x,y) {
  var rest = Array.prototype.splice.call(arguments,2);
  var x = jsnums.gcd(x,y);
  return rest.length===0 ? x : gcd.apply(gcd,[x].concat(rest));
}

// integerDashGreaterThanChar : Number -> Char
function integerDashGreaterThanChar(x) {
  return new chr(String.fromCharCode(x));
}

// integerDashSqrt : Number -> Number
// returns the floor of the number's sqrt
function integerDashSqrt(x) {
  return floor(sqrt(x));
}

// lcm : Number ... -> Number
// computes the lowest common multiple of the arguments
function lcm() {
  return abs(jsnums.multiply.apply(jsnums.multiply, arguments))
  /    gcd.apply(gcd, arguments);
}

// max : Number ... -> Number
// gets the biggest number of the arguments
function max() {
  return foldl(function (x,max) {
                return jsnums.greaterThan(x,max) ? x : max;
               },
               arguments[0],
               arguments);
}

// min : Number ... -> Number
// gets the smallest number of the arguments
function min() {
  return foldl(function (x,min) {
                return jsnums.lessThan(x,min) ? x : min;
               },
               arguments[0],
               arguments);
}

// negativeP : Number -> Boolean
function negativeP(x) {
  return jsnums.lessThan(x.val, 0);
}

// numberDashGreaterThanString : Number -> String
function numberDashGreaterThanString(x) { return x.toString(); };

// numberP : expr -> Boolean
function numberP(x) {
  return (x instanceof Constant && types.isNumber(x.val));
}

// oddP : Number -> Boolean
function oddP(x) { return jsnums.remainder(x.val,2)===1; }

// positiveP : Number -> Boolean
function positiveP(x) { return jsnums.greaterThan(x.val, 0); }

// random : Number -> Number
function random(x) { return jsnums.fromFixnum(Math.floor(Math.random()*x)); }

// sgn : Number -> (U 1 0 -1)
function sgn(x) {
  return negativeP(x)? -1 : positiveP(x) ? 1 : 0;
}

// sub1 : Number -> Number
function sub1(x) { return jsnums.subtract(x, 1); }

// zeroP : Number -> Boolean
// is this the number zero?
function zeroP(x) { return jsnums.equals(x, 0); }

// booleanP : Any -> Boolean
function booleanP(x) {
  return x instanceof Boolean || typeof x==="boolean";
}

// falseP : Any -> Boolean
// "false"==false -> false
// new Boolean(false)==false -> true
// false==false -> true
function falseP(x) { return x==false; }

// not : Boolean -> Boolean
function not(x) { return !x; }

// append : [ListOf Any] ... -> [ListOf Any]
function append() {
  return foldl(function(x,xs) {
               return xs.concat(x);
               },
               [],
               arguments);
}

// assq : X [ListOf (cons X Y)] -> (U False (cons X Y))
function assq(x, ls) {
  var temp = memf(function(pair) {
                  return eqP(first(pair), x);
                  },
                  ls);
  return falseP(temp) ? false : first(temp);
}

// car : (cons X Any) -> X
function car(x) {
  return x[0];
}

// cdr : (cons Any X) -> X
function cdr(x) {
  return x.slice(1);
}

// caar : (cons (cons X Any) Any) -> X
function caar(x) {
  return x[0][0];
}

// cadr : (cons Any (cons X Any)) -> X
function cadr(x) {
  return x[1];
}

// cdar : (cons (cons Any X) Any) -> X
function cdar(x) {
  return x[0].slice(1);
}

// cddr : (cons Any (cons Any X)) -> X
function cddr(x) {
  return x.slice(2);
}

// caaar : (cons (cons (cons X Any) Any) Any) -> X
function caaar(x) {
  return x[0][0][0];
}

// caadr : (cons Any (cons (cons X Any) Any)) -> X
function caadr(x) {
  return x[1][0];
}

// cadar : (cons (cons Any (cons X Any)) Any) -> X
function cadar(x) {
  return x[0][1];
}

// caddr : (cons Any (cons Any (cons X Any))) -> X
function caddr(x) {
  return x[2];
}

// cdaar : (cons (cons (cons Any X) Any) Any) -> X
function cdaar(x) {
  return x[0][0].slice(1);
}

// cdadr : (cons Any (cons (cons Any X) Any)) -> X
function cdadr(x) {
  return x[1].slice(1);
}

// cddar : (cons (cons Any (cons Any X)) Any) -> X
function cddar(x) {
  return x[0].slice(2);
}

// cdddr : (cons Any (cons Any (cons Any X))) -> X
function cdddr(x) {
  return x.slice(3);
}

// listStar : Any ... [ListOf Any] -> X
function listStar() {
  var arr = Array.prototype.splice.call(arguments,
                                        0,
                                        arguments.length - 1);
  return list.apply(list, arr).concat(arguments[arguments.length - 1]);
}

// listDashRef : [ListOf X] Number -> X
function listDashRef(ls, x) {
  return ls[x];
}

// nullP : Any -> Boolean
function nullP(x) {
  return emptyP(x);
}

// reverse : [ListOf Any] -> [ListOf Any]
// returns a new reversed list
function reverse(x) {
  return x.slice(0).reverse();
}

// format : (U String char Number quote struct-val cons)
//       -> String
/*
 (format (string-append "string ~a; char ~a; number ~a; quote ~a; "
 "posn ~a; list ~a; lambda ~a;"
 "a" #\a 5 'a (make-posn 1 2) (list 1 2) (lambda (x) x))
 ->
 (string-append "string a; char a; number 5; quote a; "
 "posn #(struct:posn 1 2); list (1 2); lambda #<procedure>;"
 */
function format(fmt) {
  var as = fmt.match(/~a/g);
  var num = as===null ? 1 : as.length+1;
  hasArgs(arguments.length, num, num);
  
  for(var i=1; i<arguments.length; i++) {
    var item = arguments[i];
    fmt = fmt.replace(/~a/,sexpToString(item));
  }
  
  return fmt;
}

// intDashGreaterThanString : Integer -> String
function intDashGreaterThanString(n) {
  return String.fromCharCode(n);
}

// listDashGreaterThanString : [ListOf Char] -> String
function listDashGreaterThanString(ls) {
  return foldl(function (x,xs) {
               return xs + chrVal(x);
               },
               "",
               ls);
}

// makeDashString : Number Char -> String
function makeDashString(n, ch) {
  var str = "";
  while(n>0) {
    str += chrVal(ch);
    n--;
  }
  return str;
}

// string : Char ... -> String
function string() {
  return foldl(function(x,xs) {
               return xs + chrVal(x);
               },
               "",
               arguments);
}

// stringDashGreaterThanInt : String -> Integer
function stringDashGreaterThanInt(str) {
  return str.charCodeAt(0);
}

// stringDashGreaterThanList : String -> [ListOf Char]
function stringDashGreaterThanList(str) {
  var arr = [];
  for(var i=0; i<str.length; i++)
    arr[i] = new chr(str.charAt(i));
  return arr;
}

// stringDashGreaterThanNumber : String -> (U Number false)
function stringDashGreaterThanNumber(str) {
  var num = new Number(str);
  return isNaN(num) ? false : num;
}

// stringDashGreaterThanSymbol : String -> Symbol
function stringDashGreaterThanSymbol(str) {
  return new quote(str);
}

// stringDashAlphabeticP : String -> Boolean
function stringDashAlphabeticP(str) {
  return stringOnlyContains(str, /[A-Z]*/i);
}

// stringDashAppend : String ... -> String
function stringDashAppend() {
  return foldl(function (x, xs) {
               return xs + x;
               },
               "",
               arguments);
}

// stringDashCiLessThanEqualSignP : String String ... -> Boolean
function stringDashCiLessThanEqualSignP() {
  return compareStringsCi(arguments, function(x,y) { return x<=y; });
}
function stringDashCiLessThanP() {
  return compareStringsCi(arguments, function(x,y) { return x<y; });
}
function stringDashCiEqualSignP() {
  return compareStringsCi(arguments, function(x,y) { return x==y; });
}
function stringDashCiGreaterThanEqualSignP() {
  return compareStringsCi(arguments, function(x,y) { return x>=y; });
}
function stringDashCiGreaterThanP() {
  return compareStringsCi(arguments, function(x,y) { return x>y; });
}

// stringDashCopy : String -> String
function stringDashCopy(str) {
  return str.slice(0);
}

// stringDashLength : String -> Number
function stringDashLength(str) {
  return str.length;
}

// stringDashRef : String Number -> Char
function stringDashRef(str, i) {
  return new chr(str.charAt(i));
}

// stringDashLowerDashCaseP : String -> Boolean
function stringDashLowerDashCaseP(str) {
  return str==str.toLowerCase();
}

// stringDashNumericP : String -> Boolean
function stringDashNumericP(str) {
  return stringOnlyContains(str, /[0-9]*/i);
}

// stringDashUpperDashCaseP : String -> Boolean
function stringDashUpperDashCaseP(str) {
  return str==str.toUpperCase();
}

// stringDashWhitespaceP : String -> Boolean
function stringDashWhitespaceP(str) {
  return stringOnlyContains(str, /\s*/);
}

// stringOnlyContains : String Regex -> Boolean
function stringOnlyContains(str, regex) {
  var res = str.match(regex);
  return res[0].length===str.length;
}

// stringLessThanEqualSignP : String String ... -> Boolean
function stringLessThanEqualSignP() {
  return compareStrings(arguments, function(x,y) { return x<=y; });
}
function stringLessThanP() {
  return compareStrings(arguments, function(x,y) { return x<y; });
}
function stringEqualSignP() {
  return compareStrings(arguments, function(x,y) { return x==y; });
}
function stringGreaterThanEqualSignP() {
  return compareStrings(arguments, function(x,y) { return x>=y; });
}
function stringGreaterThanP() {
  return compareStrings(arguments, function(x,y) { return x>y; });
}

// stringP : Any -> Boolean
function stringP(x) {
  return x instanceof String || typeof x==="string" || types.isString(x);
}

// substring : String Number Number -> String
function substring(str, i1, i0) {
  return str.substring(i1,i0);
}

// imageEqualSignP : Image Image -> Boolean
function imageEqualSignP(i1, i2) {
  return imageVal(i1)===imageVal(i2);
}

// imageP : Image -> Boolean
function imageP(i) {
  return i instanceof image;
}

// error : Symbol String -> Error
function error(sym, msg) {
  throw new Error(sym.toString() + " : " + msg);
}

// identity : X -> X
function identity(x) { return x; }

// LessThan : Number Number ... -> Number
function LessThan() {
  return compareNums(arguments, function(x,y) {return x<y;});
}

// GreaterThan : Number Number ... -> Number
function GreaterThan() {
  return compareNums(arguments, function(x,y) {return x>y;});
}

// GreaterThanEqualSign : Number Number ... -> Number
function GreaterThanEqualSign() {
  return compareNums(arguments, function(x,y) {return x>=y;});
}

// LessThanEqualSign : Number Number ... -> Number
function LessThanEqualSign() {
  return compareNums(arguments, function(x,y) {return x<=y;});
}

// EqualSign : Number Number ... -> Number
function EqualSign() {
  return compareNums(arguments, function(x,y) {return x==y;});
}

// EqualSignTilde : Number Number Number -> Boolean
function EqualSignTilde(x1,x2,dx) {
  return abs(x1-x2)<=dx;
}

// compareNums : Arguments (Number Number -> Boolean) -> Boolean
function compareNums(argv, proc) {
  return compareXs(argv, proc);
}

// compareCharsCi : Arguments (Char Char -> Boolean) -> Boolean
function compareCharsCi(argv, proc) {
  return compareXs(argv, function(x,y) {
                   return proc(chrVal(x).toLowerCase().charCodeAt(0),
                               chrVal(y).toLowerCase().charCodeAt(0));});
}

// compareChars : Arguments (Char Char -> Boolean) -> Boolean
function compareChars(argv, proc) {
  return compareXs(argv, function(x,y) {
                   return proc(chrVal(x).charCodeAt(0),
                               chrVal(y).charCodeAt(0));});
}

// compareStringsCi : Arguments (String String -> Boolean) -> Boolean
function compareStringsCi(argv, proc) {
  return compareXs(argv, function(x,y) {
                   return proc(x.toLowerCase(), y.toLowerCase());});
}

// compareStrings : Arguments (String String -> Boolean) -> Boolean
function compareStrings(argv, proc) {
  return compareXs(argv, proc);
}

// compareXs : Arguments (X X -> Boolean) -> Boolean
// Applies the proc to pairs of arguments, first and second, second
// and third, and so on.  If the procedure ever returns false
// compareNums returns false.  Otherwise, compareNums returns true
function compareXs(argv, pred) {
  hasArgs(argv.length,2, -1);
  for(var i=1; i < argv.length; i++) {
    var x = argv[i-1];
    var y = argv[i];
    
    if(!pred(x, y))
      return false;
  }
  return true;
}

// cons : Any [ListOf Any] -> [ListOf Any]
function cons(x, y) {
  return [x].concat(y);
}

// consP : Any -> Boolean
// is this a list and can I take the first and rest of it?
function consP(x) {
  return x instanceof Array && x.length>=1;
}

// emptyP : Any -> Boolean
// is this the empty list?
function emptyP(x) {
  return x instanceof Array && x.length===0;
}

// first : [ListOf X] -> X
function first(ls) {
  return ls[0];
}

// rest : [ListOf X] -> X
function rest(ls) {
  return ls.slice(1);
}

// second : [ListOf X] -> X
function second(ls) {
  return ls[1];
}

function third(ls)   { return ls[2]; };
function fourth(ls)  { return ls[3]; };
function fifth(ls)   { return ls[4]; };
function sixth(ls)   { return ls[5]; };
function seventh(ls) { return ls[6]; };
function eighth(ls)  { return ls[7]; };

function length(ls)  { return ls.length; };

// list : Any ... -> [ListOf Any]
function list() {
  var ls = [];
  for(var i=0; i < arguments.length; i++)
    ls[i] = arguments[i];
  return ls;
}

// apply : ((list* X ... [ListOf X]) -> Y) X ... [ListOf X] -> Y
// applys the passed proc to the named arguments and the list as if
// each list member was an individual named argument.
// apply(plus, 1, 2, [3,4,5]) -> plus(1,2,3,4,5) -> 15
function apply(proc) {
  var argv = [];
  var len = arguments.length;
  for(var i=1; i < len-1; i++)
    argv[i-1] = arguments[i];
  argv = argv.concat(arguments[len-1]);
  return proc.apply(proc, argv);
}

// symbolDashGreaterThanString : Quote -> String
function symbolDashGreaterThanString(s) {
  return quoteVal(s);
}

// foldl : (X Y -> Y) Y [ListOf X] -> Y
function foldl(p, b, ls) {
  var ret = b;
  for(var i=0; i < ls.length; i++)
    ret = p(ls[i], ret);
  return ret;
}

// foldr : (X Y -> Y) Y [ListOf X] -> Y
function foldr(p, b, ls) {
  var ret = b;
  for(var i=ls.length-1; i >= 0; i--)
    ret = p(ls[i], ret);
  return ret;
}

// map : (X ... -> Y) [ListOf X] ... -> [ListOf Y]
function map(p) {
  var lists = Array.prototype.slice.call(arguments,1);
  var res = [];
  
  if(!andmap(function(x) { return x.length === lists[0].length; }, lists)) {
    throw new Error("map: lists must all be of the same length!");
  }
  
  for(var i=0; i<lists[0].length; i++) {
    var args = [];
    for(var j=0; j<lists.length; j++)
      args[j] = lists[j][i];
    res[i] = apply(p, args);
  }
  return res;
}

// ormap : (X -> Boolean) [ListOf X] -> Boolean
function ormap(pred, ls) {
  function p(x, y) {
    return y || pred(x);
  }
  return foldr(p, false, ls);
}

// andmap : (X -> Boolean) [ListOf X] -> Boolean
function andmap(pred, ls) {
  function p(x, y) {
    return y && pred(x);
  }
  return foldr(p, true, ls);
}

// argmax : (X -> Real) [ListOf X] -> X
function argmax(proc, ls) {
  return foldl(function (x, max) {
               return proc(x)>proc(max) ? x : max;
               },
               ls[0],
               ls);
}

// argmin : (X -> Real) [ListOf X] -> X
function argmin(proc, ls) {
  return foldl(function(x, min) {
               return proc(x)<proc(min) ? x : min;
               },
               ls[0],
               ls);
}

// buildDashList : Nat (Nat -> X) -> [ListOf X]
function buildDashList(x, proc) {
  var arr = [];
  for(var i=0; i<x; i++) {
    arr[i] = proc(i);
  }
  return arr;
}

// buildDashString : Nat (Nat -> Char) -> String
function buildDashString(x, proc) {
  var str = "";
  for(var i=0; i<x; i++) {
    str += chrVal(proc(i));
  }
  return str;
}

// compose : ((Y-1 -> Z) ... (Y-N -> Y-N-1) (X-1 ... X-N -> Y-N)
//        -> (X-1 ... X-N -> Z))
function compose() {
  var lastProc = arguments[arguments.length-1];
  var otherProcs = Array.prototype.slice.call(arguments,0,arguments.length-1);
  
  return function() {
    var xs = arguments;
    return foldr(function(proc,y) {
                 return proc(y);
                 },
                 apply(lastProc, Array.prototype.slice.call(arguments,0)),
                 otherProcs);
  };
}

// filter : (X -> Boolean) [ListOf X] -> [ListOf X]
function filter(pred, ls) {
  return foldr(function(x,xs) {
               return pred(x) ? cons(x, xs) : xs;
               },
               [],
               ls);
}

// forDashEach : (Any ... -> Any) [ListOf Any] ... -> Void
function forDashEach(proc) {
  var lists = Array.prototype.slice.call(arguments,1);
  
  if(!andmap(function(x) { return x.length === lists[0].length; }, lists))
    throw new Error("forDash: lists must all be of the same length!");
  
  for(var i=0; i<lists[0].length; i++) {
    var arr = [];
    for(var j=0; j<lists.length; j++)
      arr[j] = lists[j][i];
    apply(proc, arr);
  }
}

function member(x, ls) {
  return !falseP(memf(function(y) {
                      return equalP(x, y); // implemented in scheme
                      },
                      ls));
}

// memq : Any [ListOf Any] -> (U False [ListOf Any])
function memq(x, ls) {
  return memf(function(y) {
              return eqP(x,y);
              },
              ls);
}

// memv : Any [ListOf Any] -> (U False [ListOf Any])
function memv(x, ls) {
  return memf(function(y) {
              return eqvP(x,y);
              },
              ls);
}

// memf : (X -> Boolean) [ListOf X] -> (U False [ListOf X])
function memf(pred, ls) {
  if(typeof pred != 'function' || pred.length != 1)
    throw new Error(format("memf: expected argument of type"
                           + "<procedure (arity 1)>; given ~a",
                           ls));
  
  for(var i=0; i<ls.length; i++)
    if(pred(ls[i]))
      return ls.slice(i);
  return false;
}

// swap : Number Number [ListOf Any] -> void
function swap(x,y,arr) {
  var temp = arr[x];
  arr[x] = arr[y];
  arr[y] = temp;
  return;
}

// quicksort : [ListOf X] (X X -> Boolean) -> [ListOf X]
function quicksort(array, proc) {
  var newarr = [];
  for(var i=0; i < array.length; i++)
    newarr[i] = array[i];
  quicksortB(newarr, 0, newarr.length-1, proc);
  return newarr;
}

var sort = quicksort;

// quicksortB : [ListOf X] Number Number (X X -> Boolean) -> Void
// same as quicksort, but mutates the array
function quicksortB(array, left, right, proc) {
  if(right > left) {
    var pivotIndex = left;
    var pivotNewIndex = partition(array, left, right, pivotIndex, proc);
    quicksortB(array, left, pivotNewIndex - 1, proc);
    quicksortB(array, pivotNewIndex + 1, right, proc);
  }
}

// partition : [ListOf X] Number Number Number (X X -> Boolean) -> Number
function partition(array, left, right, pivotIndex, proc) {
  var pivotValue = array[pivotIndex];
  swap(pivotIndex, right, array); // Move pivot to end
  var storeIndex = left;
  for(var i = left; i <= right - 1; i++)
    if (proc(array[i], pivotValue)) {
      swap(i, storeIndex, array);
      storeIndex = storeIndex + 1;
    }
  swap(storeIndex, right, array); // Move pivot to its final place
  return storeIndex;
}

// consecCmp : (Any Any -> Boolean) [ListOf Any] -> Boolean
function consecCmp(proc, ls) {
  var res = true;
  for(var i=1; i < ls.length; i++) {
    var x = ls[i-1];
    var y = ls[i];
    res = proc(x,y);
  }
  
  return res;
}

// booleanEqualSignP : Any ... -> Boolean
// are these all booleans of the same value?
function booleanEqualSignP() {
  function proc(x,y){
    return (x instanceof Boolean || typeof x==="boolean") &&
    (y instanceof Boolean || typeof y==="boolean") &&
    x==y;
  }
  return consecCmp(proc, arguments);
}

// stringEqualSignP : Any ... -> Boolean
// are these all string of the same sequences of characters?
function stringEqualSignP() {
  function proc(x,y){
    return (x instanceof String || typeof x==="string") &&
    (y instanceof String || typeof y==="string") &&
    x==y;
  }
  return consecCmp(proc, arguments);
}

// charEqualSignP : Any ... -> Boolean
// are these all chars of the same value?
function charEqualSignP() {
  function proc(x,y){
    return x instanceof chr && y instanceof chr
    && chrVal(x) === chrVal(y);
  }
  return consecCmp(proc, arguments);
}

// symbolEqualSignP : Any ... -> Boolean
// are these all symbols of the same value?
function symbolEqualSignP() {
  function proc(x,y){
    return x.val === y.val && types.isSymbol(x) && types.isSymbol(y);
  }
  return consecCmp(proc, arguments);
}

// eqP : Any ... -> Boolean
// see documentation in R5RS for the behavior of eq?
// exceptions: eqP returns true on string literals that contain
// the same characters
function eqP() {
  function proc(x,y){
    return x === y
    ||   charEqualSignP(x,y)
    ||   symbolEqualSignP(x,y)
    ||   (x instanceof Array && y instanceof Array &&
          x.length===0 && y.length===0);
  }
  return consecCmp(proc, arguments);
}

// eqvP : Any ... -> Boolean
// the subtle differences between eqP and eqvP are probably
// not important for a student language, and I cannot
// think of a way to implement them in JS
function eqvP() { return eqP.apply(eqP, arguments); }



// Char Functions
function singletonDashStringDashCodeDashPoint(s) {
  return s.charCodeAt(0);
};

function singletonDashStringDashDowncase(s) {
  return s.toLowerCase();
};

function singletonDashStringDashUpcase(s) {
  return s.toUpperCase();
};

function integerDashGreaterThanSingletonDashString(n) {
  return String.fromCharCode(n);
}

function variableDashArityDashLambda(proc) {
  return function(){
    return proc(Array.prototype.slice.call(arguments, 0));
  };
}
///////////////////////////////////////////////////////////////////////////////////////////////
// Compiler-Tramp JS implemented functions

// load_teachpack : String -> Void
// loads any JS file into the runtime by adding it to a DOM script tag.
function load_teachpack(str) {
  var my_tag = document.createElement('script');
  my_tag.setAttribute('type', 'text/javascript');
  my_tag.setAttribute('src', str);
  var head = document.getElementsByTagName('head')[0];
  head.appendChild(my_tag);
}

// compile-req : Library-Require -> (list NEnv [Comp (list ProgRes NEnv VEnv)])
// compiles a require statement which, when called, will load into the
// environment all the provided identifiers from the require file
function compileDashReq(req) {
  var uri = reqDashUri(req);
  if(stringP(uri)) {
    var pathToFile = uri;

    var xhr = new XMLHttpRequest();

    xhr.open("GET", pathToFile, false);
    xhr.send(null);

    if(xhr.responseText === null || xhr.status !== 200) {
      throw new Error("compile-req: " + pathToFile + " could not be found.");
    } else {
      var parsedFile = parse(readFile(xhr.responseText));
      var compiledFile = compileSlashEnvs(parsedFile,
                                          [], []);
      return [loadDashNdefs(parsedFile, []),
              function (venv, k) {
                return function (_) {
                  return k(compiledFile(new quote("_")));
                };
              }];
    }
  } else if(consP(uri)) {
    // these two teachpacks are baked into the runtime
    if(second(uri) == 'world.ss' || second(uri) == 'image.ss') {
      //load_teachpack(second(uri).substring(0, second(uri).length-3)
      //               + '-teachpack.js');
      return [[],
	      function (venv, k) {
		return function (_) {
		  return k([makeDashProgDashRes([],false,false,[]), [], []]);
		};
	      }];
    }
  }

  alert("WARNING: compile-req: " + uri + " is an unsupported require type");
  return [[], function (venv, k) { return function (_) {
                                     return [makeDashProgDashRes([],false,
                                                                 false,[]),
                                             [],[]]; }; }];
}


// trampoline on which all bytecodes are run
function tramp(x) {
  do { x = x(); }
  while (typeof x === 'function');
  return x;
}

// tools for passing bytecodes to the trampoline, with various environments
var runprogSlashEnvs = (function (sexp, nenv, venv) {
  var compiled = compileSlashEnvs(sexp, nenv, venv);
  return tramp(compiled);
});

var runprog = (function (sexp) {
  var compiled = compile(sexp);
  return tramp(compiled);
});

var run = (function (sexp) {
  var compiled = compileDashExpr(sexp)(mtDashEnv, identity);
  return tramp(compiled);
});

var primDashOpDashList = [new quote("*"), new quote("+"), new quote("-"), new quote("/"), new quote("<"), new quote("<="), new quote("="), new quote(">"), new quote(">="), new quote("abs"), new quote("acos"), new quote("add1"), new quote("angle"), new quote("asin"), new quote("atan"), new quote("ceiling"), new quote("complex?"), new quote("conjugate"), new quote("cos"), new quote("cosh"), new quote("current-seconds"), new quote("denominator"), new quote("even?"), new quote("exact->inexact"), new quote("exact?"), new quote("exp"), new quote("expt"), new quote("floor"), new quote("gcd"), new quote("imag-part"), new quote("inexact->exact"), new quote("inexact?"), new quote("integer->char"), new quote("integer-sqrt"), new quote("integer?"), new quote("lcm"), new quote("log"), new quote("magnitude"), new quote("make-polar"), new quote("make-rectangular"), new quote("max"), new quote("min"), new quote("modulo"), new quote("negative?"), new quote("number->string"), new quote("number?"), new quote("numerator"), new quote("odd?"), new quote("positive?"), new quote("quotient"), new quote("random"), new quote("rational?"), new quote("real?"), new quote("remainder"), new quote("round"), new quote("sgn"), new quote("sin"), new quote("sinh"), new quote("sqr"), new quote("sqrt"), new quote("sub1"), new quote("tan"), new quote("zero?"), new quote("boolean=?"), new quote("boolean?"), new quote("false?"), new quote("not"), new quote("symbol->string"), new quote("symbol=?"), new quote("symbol?"), new quote("append"), new quote("assq"), new quote("car"), new quote("cdr"), new quote("caar"), new quote("cadr"), new quote("cdar"), new quote("cddr"), new quote("caaar"), new quote("caadr"), new quote("cadar"), new quote("caddr"), new quote("cdaar"), new quote("cdadr"), new quote("cddar"), new quote("cdddr"), new quote("cons"), new quote("cons?"), new quote("eighth"), new quote("empty?"), new quote("fifth"), new quote("first"), new quote("fourth"), new quote("list"), new quote("list*"), new quote("list-ref"), new quote("member"), new quote("memq"), new quote("memv"), new quote("null?"), new quote("rest"), new quote("reverse"), new quote("second"), new quote("seventh"), new quote("sixth"), new quote("third"), new quote("make-posn"), new quote("posn?"), new quote("posn-x"), new quote("posn-y"), new quote("char->integer"), new quote("char-alphabetic?"), new quote("char-ci<=?"), new quote("char-ci<?"), new quote("char-ci=?"), new quote("char-ci>=?"), new quote("char-ci>?"), new quote("char-downcase"), new quote("char-lower-case?"), new quote("char-numeric?"), new quote("char-upcase"), new quote("char-upper-case?"), new quote("char-whitespace?"), new quote("char<=?"), new quote("char<?"), new quote("char=?"), new quote("char>=?"), new quote("char>?"), new quote("char?"), new quote("format"), new quote("list->string"), new quote("make-string"), new quote("string"), new quote("string->list"), new quote("string->number"), new quote("string->symbol"), new quote("string-append"), new quote("string-ci<=?"), new quote("string-ci<?"), new quote("string-ci=?"), new quote("string-ci>=?"), new quote("string-ci>?"), new quote("string-copy"), new quote("string-length"), new quote("string-ref"), new quote("string<=?"), new quote("string<?"), new quote("string=?"), new quote("string>=?"), new quote("string>?"), new quote("string?"), new quote("substring"), new quote("image=?"), new quote("image?"), new quote("=~"), new quote("eof-object?"), new quote("eq?"), new quote("equal?"), new quote("equal~?"), new quote("eqv?"), new quote("error"), new quote("exit"), new quote("identity"), new quote("andmap"), new quote("apply"), new quote("argmax"), new quote("argmin"), new quote("build-list"), new quote("build-string"), new quote("compose"), new quote("filter"), new quote("foldl"), new quote("foldr"), new quote("for-each"), new quote("map"), new quote("memf"), new quote("ormap"), new quote("procedure?"), new quote("quicksort"), new quote("sort")];

function exception(proc, msg) {
  this.proc = proc;
  this.msg = msg;
};
function makeDashException(proc, msg) { return new exception(proc, msg); };
function exceptionP(x) { return x instanceof exception; };
function exceptionDashProc(x) { return x.proc; };
function exceptionDashMsg(x) { return x.msg; };
var err = (function (sym, str) {
  return makeDashException(sym, str);
});

var errP = (function (x) {
  return exceptionP(x);
});

var errDashGreaterThanString = (function (err) {
  return stringDashAppend(symbolDashGreaterThanString(exceptionDashProc(err)), ": ", exceptionDashMsg(err));
});

var errDashGreaterThanError = (function (err) {
  return error(exceptionDashProc(err), exceptionDashMsg(err));
});

// basic names and values included in all enivronments
var initDashNenv = [[new quote("e"), new quote("pi"), new quote("eof")]];
var initDashVenv = [[2.718281828459045, 3.141592653589793, eof]];

function recDashFrame(ids) {
  this.ids = ids;
};
function makeDashRecDashFrame(ids) { return new recDashFrame(ids); };
function recDashFrameP(x) { return x instanceof recDashFrame; };
function recDashFrameDashIds(x) { return x.ids; };
function boxedDashAddr(i, j) {
  this.i = i;
this.j = j;
};
function makeDashBoxedDashAddr(i, j) { return new boxedDashAddr(i, j); };
function boxedDashAddrP(x) { return x instanceof boxedDashAddr; };
function boxedDashAddrDashI(x) { return x.i; };
function boxedDashAddrDashJ(x) { return x.j; };
function unboxedDashAddr(i, j) {
  this.i = i;
this.j = j;
};
function makeDashUnboxedDashAddr(i, j) { return new unboxedDashAddr(i, j); };
function unboxedDashAddrP(x) { return x instanceof unboxedDashAddr; };
function unboxedDashAddrDashI(x) { return x.i; };
function unboxedDashAddrDashJ(x) { return x.j; };
var address = (function (id, nenv) {
  return addressStar(id, nenv, 0, identity);
});

var addressStar = (function (id, nenv, i, k) {
  return (function () { var findDashUnboxed = (function (f, j, k) {
  return emptyP(f) ? addressStar(id, rest(nenv), add1(i), k) :
  symbolEqualSignP(id, first(f)) ? k(makeDashUnboxedDashAddr(i, j)) :
  findDashUnboxed(rest(f), add1(j), k);
});

var findDashBoxed = (function (f, j, k) {
  return emptyP(f) ? addressStar(id, rest(nenv), add1(i), k) :
  symbolEqualSignP(id, first(f)) ? k(makeDashBoxedDashAddr(i, j)) :
  findDashBoxed(rest(f), add1(j), k);
});

return emptyP(nenv) ? err(new quote("lookup"), symbolDashGreaterThanString(id)) :
  recDashFrameP(first(nenv)) ? findDashBoxed(recDashFrameDashIds(first(nenv)), 0, k) :
  findDashUnboxed(first(nenv), 0, k);
 })();
});

var valueof = (function (i, j, venv) {
  return listDashRef(listDashRef(venv, i), j);
});

function _undefined() {
  };
function makeDashUndefined() { return new _undefined(); };
function undefinedP(x) { return x instanceof _undefined; };
var mtDashEnv = [];

var undefn = makeDashUndefined();

var makeDashIdPlusVal = (function (id, val) {
  return [id, val];
});

var frameDashId = (function (frame) {
  return first(frame);
});

var frameDashVal = (function (frame) {
  return second(frame);
});

var boxDashBind = (function (id, val, env) {
  return cons(box([[id, val]]), env);
});

var extend = (function (frame, env) {
  return cons(frame, env);
});

var letDashExtend = (function (lhs, rhs, env) {
  return extend(zip(lhs, rhs), env);
});

var envDashRecurB = (function (env, vals) {
  return (function () { var frame = first(env);

return (function () { var DO = setDashBoxB(frame, map(list, map(first, unbox(frame)), vals));

return env;
 })();
 })();
});

var bindDashReplaceB = (function (id, val, env) {
  return emptyP(env) ? error(new quote("bind-replace!"), format("did not find undefined name (~a) to replace. Val was: ~a", id, val)) :
  boxP(first(env)) ? (function () { var frame = unbox(first(env));

return consP(memf((function (x) {
  return ((eqP(id, first(x))) && (undefinedP(second(x))));
}), frame)) ? (function () { var DO = setDashBoxB(first(env), map((function (x) {
  return ((eqP(id, first(x))) && (undefinedP(second(x)))) ? [id, val] :
  x;
}), frame));

return env;
 })() :
  cons(first(env), bindDashReplaceB(id, val, rest(env)));
 })() :
  cons(first(env), bindDashReplaceB(id, val, rest(env)));
});

var freshDashName = (function (env) {
  return (function () { var TRY = (function (i) {
  return (function () { var s = stringDashGreaterThanSymbol(stringDashAppend("g", numberDashGreaterThanString(i)));

return boundP(s, env) ? TRY(add1(i)) :
  s;
 })();
});

return TRY(0);
 })();
});

var boundP = (function (id, env) {
  return ((not(emptyP(env))) && (((consP(assq(id, boxP(first(env)) ? unbox(first(env)) :
  first(env)))) || (boundP(id, rest(env))))));
});

var lookup = (function (id, env) {
  return (function () { var find = (function (f) {
  return emptyP(f) ? lookup(id, rest(env)) :
  symbolEqualSignP(id, first(first(f))) ? second(first(f)) :
  find(rest(f));
});

return find(emptyP(env) ? error(new quote("lookup"), symbolDashGreaterThanString(id)) :
  boxP(first(env)) ? unbox(first(env)) :
  first(env));
 })();
});

var lookupSlashCps = (function (id, env, ret) {
  return (function () { var find = (function (f, retStar) {
  return emptyP(f) ? lookupSlashCps(id, rest(env), retStar) :
  symbolEqualSignP(id, first(first(f))) ? retStar(second(first(f))) :
  find(rest(f), retStar);
});

return emptyP(env) ? err(new quote("lookup"), symbolDashGreaterThanString(id)) :
  boxP(first(env)) ? find(unbox(first(env)), ret) :
  find(first(env), ret);
 })();
});

var zip = (function (ls1, ls2) {
  return emptyP(ls1) ? [] :
  cons([first(ls1), first(ls2)], zip(rest(ls1), rest(ls2)));
});

var intDashWhitespaceP = (function (n) {
  return ((LessThanEqualSign(9, n, 13)) || (EqualSign(n, 32)) || (EqualSign(n, 133)) || (EqualSign(n, 160)) || (EqualSign(n, 5760)) || (EqualSign(n, 6158)) || (LessThanEqualSign(8192, n, 8202)) || (EqualSign(n, 8232)) || (EqualSign(n, 8233)) || (EqualSign(n, 8239)) || (EqualSign(n, 8287)) || (EqualSign(n, 12288)));
});

var intDashNumericP = (function (n) {
  return ((LessThanEqualSign(48, n, 57)) || (LessThanEqualSign(178, n, 179)) || (EqualSign(n, 185)) || (LessThanEqualSign(188, n, 190)) || (LessThanEqualSign(1632, n, 1641)) || (LessThanEqualSign(1776, n, 1785)) || (LessThanEqualSign(1984, n, 1993)) || (LessThanEqualSign(2406, n, 2415)) || (LessThanEqualSign(2534, n, 2543)) || (LessThanEqualSign(2548, n, 2551)) || (EqualSign(n, 2553)) || (LessThanEqualSign(2662, n, 2671)) || (LessThanEqualSign(2790, n, 2799)) || (LessThanEqualSign(2918, n, 2927)) || (LessThanEqualSign(3046, n, 3058)) || (LessThanEqualSign(3174, n, 3183)) || (LessThanEqualSign(3192, n, 3198)) || (LessThanEqualSign(3302, n, 3311)) || (LessThanEqualSign(3430, n, 3445)) || (LessThanEqualSign(3664, n, 3673)) || (LessThanEqualSign(3792, n, 3801)) || (LessThanEqualSign(3872, n, 3891)) || (LessThanEqualSign(4160, n, 4169)) || (LessThanEqualSign(4240, n, 4249)) || (LessThanEqualSign(4969, n, 4988)) || (LessThanEqualSign(5870, n, 5872)) || (LessThanEqualSign(6112, n, 6121)) || (LessThanEqualSign(6128, n, 6137)) || (LessThanEqualSign(6160, n, 6169)) || (LessThanEqualSign(6470, n, 6479)) || (LessThanEqualSign(6608, n, 6617)) || (LessThanEqualSign(6992, n, 7001)) || (LessThanEqualSign(7088, n, 7097)) || (LessThanEqualSign(7232, n, 7241)) || (LessThanEqualSign(7248, n, 7257)) || (EqualSign(n, 8304)) || (LessThanEqualSign(8308, n, 8313)) || (LessThanEqualSign(8320, n, 8329)) || (LessThanEqualSign(8531, n, 8578)) || (LessThanEqualSign(8581, n, 8584)) || (LessThanEqualSign(9312, n, 9371)) || (LessThanEqualSign(9450, n, 9471)) || (LessThanEqualSign(10102, n, 10131)) || (EqualSign(n, 11517)) || (EqualSign(n, 12295)) || (LessThanEqualSign(12321, n, 12329)) || (LessThanEqualSign(12344, n, 12346)) || (LessThanEqualSign(12690, n, 12693)) || (LessThanEqualSign(12832, n, 12841)) || (LessThanEqualSign(12881, n, 12895)) || (LessThanEqualSign(12928, n, 12937)) || (LessThanEqualSign(12977, n, 12991)) || (LessThanEqualSign(42528, n, 42537)) || (LessThanEqualSign(43216, n, 43225)) || (LessThanEqualSign(43264, n, 43273)) || (LessThanEqualSign(43600, n, 43609)) || (EqualSign(n, 63851)) || (EqualSign(n, 63859)) || (EqualSign(n, 63864)) || (EqualSign(n, 63922)) || (EqualSign(n, 63953)) || (EqualSign(n, 63955)) || (EqualSign(n, 63997)) || (LessThanEqualSign(65296, n, 65305)) || (LessThanEqualSign(65799, n, 65843)) || (LessThanEqualSign(65856, n, 65912)) || (EqualSign(n, 65930)) || (LessThanEqualSign(66336, n, 66339)) || (EqualSign(n, 66369)) || (EqualSign(n, 66378)) || (LessThanEqualSign(66513, n, 66517)) || (LessThanEqualSign(66720, n, 66729)) || (LessThanEqualSign(67862, n, 67865)) || (LessThanEqualSign(68160, n, 68167)) || (LessThanEqualSign(74752, n, 74801)) || (LessThanEqualSign(74804, n, 74837)) || (LessThanEqualSign(74840, n, 74850)) || (LessThanEqualSign(119648, n, 119665)) || (LessThanEqualSign(120782, n, 120831)) || (EqualSign(n, 194704)));
});

var intDashAlphabeticP = (function (n) {
  return ((LessThanEqualSign(65, n, 90)) || (LessThanEqualSign(97, n, 122)) || (EqualSign(n, 170)) || (EqualSign(n, 181)) || (EqualSign(n, 186)) || (LessThanEqualSign(192, n, 214)) || (LessThanEqualSign(216, n, 246)) || (LessThanEqualSign(248, n, 442)) || (EqualSign(n, 443)) || (LessThanEqualSign(444, n, 447)) || (LessThanEqualSign(448, n, 451)) || (LessThanEqualSign(452, n, 659)) || (EqualSign(n, 660)) || (LessThanEqualSign(661, n, 687)) || (LessThanEqualSign(688, n, 705)) || (LessThanEqualSign(710, n, 721)) || (LessThanEqualSign(736, n, 740)) || (EqualSign(n, 748)) || (EqualSign(n, 750)) || (EqualSign(n, 837)) || (LessThanEqualSign(880, n, 883)) || (EqualSign(n, 884)) || (LessThanEqualSign(886, n, 887)) || (EqualSign(n, 890)) || (LessThanEqualSign(891, n, 893)) || (EqualSign(n, 902)) || (LessThanEqualSign(904, n, 906)) || (EqualSign(n, 908)) || (LessThanEqualSign(910, n, 929)) || (LessThanEqualSign(931, n, 1013)) || (LessThanEqualSign(1015, n, 1153)) || (LessThanEqualSign(1162, n, 1315)) || (LessThanEqualSign(1329, n, 1366)) || (EqualSign(n, 1369)) || (LessThanEqualSign(1377, n, 1415)) || (LessThanEqualSign(1456, n, 1469)) || (EqualSign(n, 1471)) || (LessThanEqualSign(1473, n, 1474)) || (LessThanEqualSign(1476, n, 1477)) || (EqualSign(n, 1479)) || (LessThanEqualSign(1488, n, 1514)) || (LessThanEqualSign(1520, n, 1522)) || (LessThanEqualSign(1552, n, 1562)) || (LessThanEqualSign(1569, n, 1599)) || (EqualSign(n, 1600)) || (LessThanEqualSign(1601, n, 1610)) || (LessThanEqualSign(1611, n, 1623)) || (LessThanEqualSign(1625, n, 1630)) || (LessThanEqualSign(1646, n, 1647)) || (EqualSign(n, 1648)) || (LessThanEqualSign(1649, n, 1747)) || (EqualSign(n, 1749)) || (LessThanEqualSign(1750, n, 1756)) || (LessThanEqualSign(1761, n, 1764)) || (LessThanEqualSign(1765, n, 1766)) || (LessThanEqualSign(1767, n, 1768)) || (EqualSign(n, 1773)) || (LessThanEqualSign(1774, n, 1775)) || (LessThanEqualSign(1786, n, 1788)) || (EqualSign(n, 1791)) || (EqualSign(n, 1808)) || (EqualSign(n, 1809)) || (LessThanEqualSign(1810, n, 1839)) || (LessThanEqualSign(1840, n, 1855)) || (LessThanEqualSign(1869, n, 1957)) || (LessThanEqualSign(1958, n, 1968)) || (EqualSign(n, 1969)) || (LessThanEqualSign(1994, n, 2026)) || (LessThanEqualSign(2036, n, 2037)) || (EqualSign(n, 2042)) || (LessThanEqualSign(2305, n, 2306)) || (EqualSign(n, 2307)) || (LessThanEqualSign(2308, n, 2361)) || (EqualSign(n, 2365)) || (LessThanEqualSign(2366, n, 2368)) || (LessThanEqualSign(2369, n, 2376)) || (LessThanEqualSign(2377, n, 2380)) || (EqualSign(n, 2384)) || (LessThanEqualSign(2392, n, 2401)) || (LessThanEqualSign(2402, n, 2403)) || (EqualSign(n, 2417)) || (EqualSign(n, 2418)) || (LessThanEqualSign(2427, n, 2431)) || (EqualSign(n, 2433)) || (LessThanEqualSign(2434, n, 2435)) || (LessThanEqualSign(2437, n, 2444)) || (LessThanEqualSign(2447, n, 2448)) || (LessThanEqualSign(2451, n, 2472)) || (LessThanEqualSign(2474, n, 2480)) || (EqualSign(n, 2482)) || (LessThanEqualSign(2486, n, 2489)) || (EqualSign(n, 2493)) || (LessThanEqualSign(2494, n, 2496)) || (LessThanEqualSign(2497, n, 2500)) || (LessThanEqualSign(2503, n, 2504)) || (LessThanEqualSign(2507, n, 2508)) || (EqualSign(n, 2510)) || (EqualSign(n, 2519)) || (LessThanEqualSign(2524, n, 2525)) || (LessThanEqualSign(2527, n, 2529)) || (LessThanEqualSign(2530, n, 2531)) || (LessThanEqualSign(2544, n, 2545)) || (LessThanEqualSign(2561, n, 2562)) || (EqualSign(n, 2563)) || (LessThanEqualSign(2565, n, 2570)) || (LessThanEqualSign(2575, n, 2576)) || (LessThanEqualSign(2579, n, 2600)) || (LessThanEqualSign(2602, n, 2608)) || (LessThanEqualSign(2610, n, 2611)) || (LessThanEqualSign(2613, n, 2614)) || (LessThanEqualSign(2616, n, 2617)) || (LessThanEqualSign(2622, n, 2624)) || (LessThanEqualSign(2625, n, 2626)) || (LessThanEqualSign(2631, n, 2632)) || (LessThanEqualSign(2635, n, 2636)) || (EqualSign(n, 2641)) || (LessThanEqualSign(2649, n, 2652)) || (EqualSign(n, 2654)) || (LessThanEqualSign(2672, n, 2673)) || (LessThanEqualSign(2674, n, 2676)) || (EqualSign(n, 2677)) || (LessThanEqualSign(2689, n, 2690)) || (EqualSign(n, 2691)) || (LessThanEqualSign(2693, n, 2701)) || (LessThanEqualSign(2703, n, 2705)) || (LessThanEqualSign(2707, n, 2728)) || (LessThanEqualSign(2730, n, 2736)) || (LessThanEqualSign(2738, n, 2739)) || (LessThanEqualSign(2741, n, 2745)) || (EqualSign(n, 2749)) || (LessThanEqualSign(2750, n, 2752)) || (LessThanEqualSign(2753, n, 2757)) || (LessThanEqualSign(2759, n, 2760)) || (EqualSign(n, 2761)) || (LessThanEqualSign(2763, n, 2764)) || (EqualSign(n, 2768)) || (LessThanEqualSign(2784, n, 2785)) || (LessThanEqualSign(2786, n, 2787)) || (EqualSign(n, 2817)) || (LessThanEqualSign(2818, n, 2819)) || (LessThanEqualSign(2821, n, 2828)) || (LessThanEqualSign(2831, n, 2832)) || (LessThanEqualSign(2835, n, 2856)) || (LessThanEqualSign(2858, n, 2864)) || (LessThanEqualSign(2866, n, 2867)) || (LessThanEqualSign(2869, n, 2873)) || (EqualSign(n, 2877)) || (EqualSign(n, 2878)) || (EqualSign(n, 2879)) || (EqualSign(n, 2880)) || (LessThanEqualSign(2881, n, 2884)) || (LessThanEqualSign(2887, n, 2888)) || (LessThanEqualSign(2891, n, 2892)) || (EqualSign(n, 2902)) || (EqualSign(n, 2903)) || (LessThanEqualSign(2908, n, 2909)) || (LessThanEqualSign(2911, n, 2913)) || (LessThanEqualSign(2914, n, 2915)) || (EqualSign(n, 2929)) || (EqualSign(n, 2946)) || (EqualSign(n, 2947)) || (LessThanEqualSign(2949, n, 2954)) || (LessThanEqualSign(2958, n, 2960)) || (LessThanEqualSign(2962, n, 2965)) || (LessThanEqualSign(2969, n, 2970)) || (EqualSign(n, 2972)) || (LessThanEqualSign(2974, n, 2975)) || (LessThanEqualSign(2979, n, 2980)) || (LessThanEqualSign(2984, n, 2986)) || (LessThanEqualSign(2990, n, 3001)) || (LessThanEqualSign(3006, n, 3007)) || (EqualSign(n, 3008)) || (LessThanEqualSign(3009, n, 3010)) || (LessThanEqualSign(3014, n, 3016)) || (LessThanEqualSign(3018, n, 3020)) || (EqualSign(n, 3024)) || (EqualSign(n, 3031)) || (LessThanEqualSign(3073, n, 3075)) || (LessThanEqualSign(3077, n, 3084)) || (LessThanEqualSign(3086, n, 3088)) || (LessThanEqualSign(3090, n, 3112)) || (LessThanEqualSign(3114, n, 3123)) || (LessThanEqualSign(3125, n, 3129)) || (EqualSign(n, 3133)) || (LessThanEqualSign(3134, n, 3136)) || (LessThanEqualSign(3137, n, 3140)) || (LessThanEqualSign(3142, n, 3144)) || (LessThanEqualSign(3146, n, 3148)) || (LessThanEqualSign(3157, n, 3158)) || (LessThanEqualSign(3160, n, 3161)) || (LessThanEqualSign(3168, n, 3169)) || (LessThanEqualSign(3170, n, 3171)) || (LessThanEqualSign(3202, n, 3203)) || (LessThanEqualSign(3205, n, 3212)) || (LessThanEqualSign(3214, n, 3216)) || (LessThanEqualSign(3218, n, 3240)) || (LessThanEqualSign(3242, n, 3251)) || (LessThanEqualSign(3253, n, 3257)) || (EqualSign(n, 3261)) || (EqualSign(n, 3262)) || (EqualSign(n, 3263)) || (LessThanEqualSign(3264, n, 3268)) || (EqualSign(n, 3270)) || (LessThanEqualSign(3271, n, 3272)) || (LessThanEqualSign(3274, n, 3275)) || (EqualSign(n, 3276)) || (LessThanEqualSign(3285, n, 3286)) || (EqualSign(n, 3294)) || (LessThanEqualSign(3296, n, 3297)) || (LessThanEqualSign(3298, n, 3299)) || (LessThanEqualSign(3330, n, 3331)) || (LessThanEqualSign(3333, n, 3340)) || (LessThanEqualSign(3342, n, 3344)) || (LessThanEqualSign(3346, n, 3368)) || (LessThanEqualSign(3370, n, 3385)) || (EqualSign(n, 3389)) || (LessThanEqualSign(3390, n, 3392)) || (LessThanEqualSign(3393, n, 3396)) || (LessThanEqualSign(3398, n, 3400)) || (LessThanEqualSign(3402, n, 3404)) || (EqualSign(n, 3415)) || (LessThanEqualSign(3424, n, 3425)) || (LessThanEqualSign(3426, n, 3427)) || (LessThanEqualSign(3450, n, 3455)) || (LessThanEqualSign(3458, n, 3459)) || (LessThanEqualSign(3461, n, 3478)) || (LessThanEqualSign(3482, n, 3505)) || (LessThanEqualSign(3507, n, 3515)) || (EqualSign(n, 3517)) || (LessThanEqualSign(3520, n, 3526)) || (LessThanEqualSign(3535, n, 3537)) || (LessThanEqualSign(3538, n, 3540)) || (EqualSign(n, 3542)) || (LessThanEqualSign(3544, n, 3551)) || (LessThanEqualSign(3570, n, 3571)) || (LessThanEqualSign(3585, n, 3632)) || (EqualSign(n, 3633)) || (LessThanEqualSign(3634, n, 3635)) || (LessThanEqualSign(3636, n, 3642)) || (LessThanEqualSign(3648, n, 3653)) || (EqualSign(n, 3654)) || (EqualSign(n, 3661)) || (LessThanEqualSign(3713, n, 3714)) || (EqualSign(n, 3716)) || (LessThanEqualSign(3719, n, 3720)) || (EqualSign(n, 3722)) || (EqualSign(n, 3725)) || (LessThanEqualSign(3732, n, 3735)) || (LessThanEqualSign(3737, n, 3743)) || (LessThanEqualSign(3745, n, 3747)) || (EqualSign(n, 3749)) || (EqualSign(n, 3751)) || (LessThanEqualSign(3754, n, 3755)) || (LessThanEqualSign(3757, n, 3760)) || (EqualSign(n, 3761)) || (LessThanEqualSign(3762, n, 3763)) || (LessThanEqualSign(3764, n, 3769)) || (LessThanEqualSign(3771, n, 3772)) || (EqualSign(n, 3773)) || (LessThanEqualSign(3776, n, 3780)) || (EqualSign(n, 3782)) || (EqualSign(n, 3789)) || (LessThanEqualSign(3804, n, 3805)) || (EqualSign(n, 3840)) || (LessThanEqualSign(3904, n, 3911)) || (LessThanEqualSign(3913, n, 3948)) || (LessThanEqualSign(3953, n, 3966)) || (EqualSign(n, 3967)) || (LessThanEqualSign(3968, n, 3969)) || (LessThanEqualSign(3976, n, 3979)) || (LessThanEqualSign(3984, n, 3991)) || (LessThanEqualSign(3993, n, 4028)) || (LessThanEqualSign(4096, n, 4138)) || (LessThanEqualSign(4139, n, 4140)) || (LessThanEqualSign(4141, n, 4144)) || (EqualSign(n, 4145)) || (LessThanEqualSign(4146, n, 4150)) || (EqualSign(n, 4152)) || (LessThanEqualSign(4155, n, 4156)) || (LessThanEqualSign(4157, n, 4158)) || (EqualSign(n, 4159)) || (LessThanEqualSign(4176, n, 4181)) || (LessThanEqualSign(4182, n, 4183)) || (LessThanEqualSign(4184, n, 4185)) || (LessThanEqualSign(4186, n, 4189)) || (LessThanEqualSign(4190, n, 4192)) || (EqualSign(n, 4193)) || (EqualSign(n, 4194)) || (LessThanEqualSign(4197, n, 4198)) || (LessThanEqualSign(4199, n, 4200)) || (LessThanEqualSign(4206, n, 4208)) || (LessThanEqualSign(4209, n, 4212)) || (LessThanEqualSign(4213, n, 4225)) || (EqualSign(n, 4226)) || (LessThanEqualSign(4227, n, 4228)) || (LessThanEqualSign(4229, n, 4230)) || (EqualSign(n, 4238)) || (LessThanEqualSign(4256, n, 4293)) || (LessThanEqualSign(4304, n, 4346)) || (EqualSign(n, 4348)) || (LessThanEqualSign(4352, n, 4441)) || (LessThanEqualSign(4447, n, 4514)) || (LessThanEqualSign(4520, n, 4601)) || (LessThanEqualSign(4608, n, 4680)) || (LessThanEqualSign(4682, n, 4685)) || (LessThanEqualSign(4688, n, 4694)) || (EqualSign(n, 4696)) || (LessThanEqualSign(4698, n, 4701)) || (LessThanEqualSign(4704, n, 4744)) || (LessThanEqualSign(4746, n, 4749)) || (LessThanEqualSign(4752, n, 4784)) || (LessThanEqualSign(4786, n, 4789)) || (LessThanEqualSign(4792, n, 4798)) || (EqualSign(n, 4800)) || (LessThanEqualSign(4802, n, 4805)) || (LessThanEqualSign(4808, n, 4822)) || (LessThanEqualSign(4824, n, 4880)) || (LessThanEqualSign(4882, n, 4885)) || (LessThanEqualSign(4888, n, 4954)) || (EqualSign(n, 4959)) || (LessThanEqualSign(4992, n, 5007)) || (LessThanEqualSign(5024, n, 5108)) || (LessThanEqualSign(5121, n, 5740)) || (LessThanEqualSign(5743, n, 5750)) || (LessThanEqualSign(5761, n, 5786)) || (LessThanEqualSign(5792, n, 5866)) || (LessThanEqualSign(5870, n, 5872)) || (LessThanEqualSign(5888, n, 5900)) || (LessThanEqualSign(5902, n, 5905)) || (LessThanEqualSign(5906, n, 5907)) || (LessThanEqualSign(5920, n, 5937)) || (LessThanEqualSign(5938, n, 5939)) || (LessThanEqualSign(5952, n, 5969)) || (LessThanEqualSign(5970, n, 5971)) || (LessThanEqualSign(5984, n, 5996)) || (LessThanEqualSign(5998, n, 6000)) || (LessThanEqualSign(6002, n, 6003)) || (LessThanEqualSign(6016, n, 6067)) || (EqualSign(n, 6070)) || (LessThanEqualSign(6071, n, 6077)) || (LessThanEqualSign(6078, n, 6085)) || (EqualSign(n, 6086)) || (LessThanEqualSign(6087, n, 6088)) || (EqualSign(n, 6103)) || (EqualSign(n, 6108)) || (LessThanEqualSign(6176, n, 6210)) || (EqualSign(n, 6211)) || (LessThanEqualSign(6212, n, 6263)) || (LessThanEqualSign(6272, n, 6312)) || (EqualSign(n, 6313)) || (EqualSign(n, 6314)) || (LessThanEqualSign(6400, n, 6428)) || (LessThanEqualSign(6432, n, 6434)) || (LessThanEqualSign(6435, n, 6438)) || (LessThanEqualSign(6439, n, 6440)) || (LessThanEqualSign(6441, n, 6443)) || (LessThanEqualSign(6448, n, 6449)) || (EqualSign(n, 6450)) || (LessThanEqualSign(6451, n, 6456)) || (LessThanEqualSign(6480, n, 6509)) || (LessThanEqualSign(6512, n, 6516)) || (LessThanEqualSign(6528, n, 6569)) || (LessThanEqualSign(6576, n, 6592)) || (LessThanEqualSign(6593, n, 6599)) || (LessThanEqualSign(6600, n, 6601)) || (LessThanEqualSign(6656, n, 6678)) || (LessThanEqualSign(6679, n, 6680)) || (LessThanEqualSign(6681, n, 6683)) || (LessThanEqualSign(6912, n, 6915)) || (EqualSign(n, 6916)) || (LessThanEqualSign(6917, n, 6963)) || (EqualSign(n, 6965)) || (LessThanEqualSign(6966, n, 6970)) || (EqualSign(n, 6971)) || (EqualSign(n, 6972)) || (LessThanEqualSign(6973, n, 6977)) || (EqualSign(n, 6978)) || (EqualSign(n, 6979)) || (LessThanEqualSign(6981, n, 6987)) || (LessThanEqualSign(7040, n, 7041)) || (EqualSign(n, 7042)) || (LessThanEqualSign(7043, n, 7072)) || (EqualSign(n, 7073)) || (LessThanEqualSign(7074, n, 7077)) || (LessThanEqualSign(7078, n, 7079)) || (LessThanEqualSign(7080, n, 7081)) || (LessThanEqualSign(7086, n, 7087)) || (LessThanEqualSign(7168, n, 7203)) || (LessThanEqualSign(7204, n, 7211)) || (LessThanEqualSign(7212, n, 7219)) || (LessThanEqualSign(7220, n, 7221)) || (LessThanEqualSign(7245, n, 7247)) || (LessThanEqualSign(7258, n, 7287)) || (LessThanEqualSign(7288, n, 7293)) || (LessThanEqualSign(7424, n, 7467)) || (LessThanEqualSign(7468, n, 7521)) || (LessThanEqualSign(7522, n, 7543)) || (EqualSign(n, 7544)) || (LessThanEqualSign(7545, n, 7578)) || (LessThanEqualSign(7579, n, 7615)) || (LessThanEqualSign(7680, n, 7957)) || (LessThanEqualSign(7960, n, 7965)) || (LessThanEqualSign(7968, n, 8005)) || (LessThanEqualSign(8008, n, 8013)) || (LessThanEqualSign(8016, n, 8023)) || (EqualSign(n, 8025)) || (EqualSign(n, 8027)) || (EqualSign(n, 8029)) || (LessThanEqualSign(8031, n, 8061)) || (LessThanEqualSign(8064, n, 8116)) || (LessThanEqualSign(8118, n, 8124)) || (EqualSign(n, 8126)) || (LessThanEqualSign(8130, n, 8132)) || (LessThanEqualSign(8134, n, 8140)) || (LessThanEqualSign(8144, n, 8147)) || (LessThanEqualSign(8150, n, 8155)) || (LessThanEqualSign(8160, n, 8172)) || (LessThanEqualSign(8178, n, 8180)) || (LessThanEqualSign(8182, n, 8188)) || (EqualSign(n, 8305)) || (EqualSign(n, 8319)) || (LessThanEqualSign(8336, n, 8340)) || (EqualSign(n, 8450)) || (EqualSign(n, 8455)) || (LessThanEqualSign(8458, n, 8467)) || (EqualSign(n, 8469)) || (LessThanEqualSign(8473, n, 8477)) || (EqualSign(n, 8484)) || (EqualSign(n, 8486)) || (EqualSign(n, 8488)) || (LessThanEqualSign(8490, n, 8493)) || (LessThanEqualSign(8495, n, 8500)) || (LessThanEqualSign(8501, n, 8504)) || (EqualSign(n, 8505)) || (LessThanEqualSign(8508, n, 8511)) || (LessThanEqualSign(8517, n, 8521)) || (EqualSign(n, 8526)) || (LessThanEqualSign(8544, n, 8578)) || (LessThanEqualSign(8579, n, 8580)) || (LessThanEqualSign(8581, n, 8584)) || (LessThanEqualSign(9398, n, 9449)) || (LessThanEqualSign(11264, n, 11310)) || (LessThanEqualSign(11312, n, 11358)) || (LessThanEqualSign(11360, n, 11375)) || (LessThanEqualSign(11377, n, 11388)) || (EqualSign(n, 11389)) || (LessThanEqualSign(11392, n, 11492)) || (LessThanEqualSign(11520, n, 11557)) || (LessThanEqualSign(11568, n, 11621)) || (EqualSign(n, 11631)) || (LessThanEqualSign(11648, n, 11670)) || (LessThanEqualSign(11680, n, 11686)) || (LessThanEqualSign(11688, n, 11694)) || (LessThanEqualSign(11696, n, 11702)) || (LessThanEqualSign(11704, n, 11710)) || (LessThanEqualSign(11712, n, 11718)) || (LessThanEqualSign(11720, n, 11726)) || (LessThanEqualSign(11728, n, 11734)) || (LessThanEqualSign(11736, n, 11742)) || (LessThanEqualSign(11744, n, 11775)) || (EqualSign(n, 11823)) || (EqualSign(n, 12293)) || (EqualSign(n, 12294)) || (EqualSign(n, 12295)) || (LessThanEqualSign(12321, n, 12329)) || (LessThanEqualSign(12337, n, 12341)) || (LessThanEqualSign(12344, n, 12346)) || (EqualSign(n, 12347)) || (EqualSign(n, 12348)) || (LessThanEqualSign(12353, n, 12438)) || (LessThanEqualSign(12445, n, 12446)) || (EqualSign(n, 12447)) || (LessThanEqualSign(12449, n, 12538)) || (LessThanEqualSign(12540, n, 12542)) || (EqualSign(n, 12543)) || (LessThanEqualSign(12549, n, 12589)) || (LessThanEqualSign(12593, n, 12686)) || (LessThanEqualSign(12704, n, 12727)) || (LessThanEqualSign(12784, n, 12799)) || (LessThanEqualSign(13312, n, 19893)) || (LessThanEqualSign(19968, n, 40899)) || (LessThanEqualSign(40960, n, 40980)) || (EqualSign(n, 40981)) || (LessThanEqualSign(40982, n, 42124)) || (LessThanEqualSign(42240, n, 42507)) || (EqualSign(n, 42508)) || (LessThanEqualSign(42512, n, 42527)) || (LessThanEqualSign(42538, n, 42539)) || (LessThanEqualSign(42560, n, 42591)) || (LessThanEqualSign(42594, n, 42605)) || (EqualSign(n, 42606)) || (EqualSign(n, 42623)) || (LessThanEqualSign(42624, n, 42647)) || (LessThanEqualSign(42775, n, 42783)) || (LessThanEqualSign(42786, n, 42863)) || (EqualSign(n, 42864)) || (LessThanEqualSign(42865, n, 42887)) || (EqualSign(n, 42888)) || (LessThanEqualSign(42891, n, 42892)) || (LessThanEqualSign(43003, n, 43009)) || (LessThanEqualSign(43011, n, 43013)) || (LessThanEqualSign(43015, n, 43018)) || (LessThanEqualSign(43020, n, 43042)) || (LessThanEqualSign(43043, n, 43044)) || (LessThanEqualSign(43045, n, 43046)) || (EqualSign(n, 43047)) || (LessThanEqualSign(43072, n, 43123)) || (LessThanEqualSign(43136, n, 43137)) || (LessThanEqualSign(43138, n, 43187)) || (LessThanEqualSign(43188, n, 43203)) || (LessThanEqualSign(43274, n, 43301)) || (LessThanEqualSign(43302, n, 43306)) || (LessThanEqualSign(43312, n, 43334)) || (LessThanEqualSign(43335, n, 43345)) || (EqualSign(n, 43346)) || (LessThanEqualSign(43520, n, 43560)) || (LessThanEqualSign(43561, n, 43566)) || (LessThanEqualSign(43567, n, 43568)) || (LessThanEqualSign(43569, n, 43570)) || (LessThanEqualSign(43571, n, 43572)) || (LessThanEqualSign(43573, n, 43574)) || (LessThanEqualSign(43584, n, 43586)) || (EqualSign(n, 43587)) || (LessThanEqualSign(43588, n, 43595)) || (EqualSign(n, 43596)) || (EqualSign(n, 43597)) || (LessThanEqualSign(44032, n, 55203)) || (LessThanEqualSign(63744, n, 64045)) || (LessThanEqualSign(64048, n, 64106)) || (LessThanEqualSign(64112, n, 64217)) || (LessThanEqualSign(64256, n, 64262)) || (LessThanEqualSign(64275, n, 64279)) || (EqualSign(n, 64285)) || (EqualSign(n, 64286)) || (LessThanEqualSign(64287, n, 64296)) || (LessThanEqualSign(64298, n, 64310)) || (LessThanEqualSign(64312, n, 64316)) || (EqualSign(n, 64318)) || (LessThanEqualSign(64320, n, 64321)) || (LessThanEqualSign(64323, n, 64324)) || (LessThanEqualSign(64326, n, 64433)) || (LessThanEqualSign(64467, n, 64829)) || (LessThanEqualSign(64848, n, 64911)) || (LessThanEqualSign(64914, n, 64967)) || (LessThanEqualSign(65008, n, 65019)) || (LessThanEqualSign(65136, n, 65140)) || (LessThanEqualSign(65142, n, 65276)) || (LessThanEqualSign(65313, n, 65338)) || (LessThanEqualSign(65345, n, 65370)) || (LessThanEqualSign(65382, n, 65391)) || (EqualSign(n, 65392)) || (LessThanEqualSign(65393, n, 65437)) || (LessThanEqualSign(65438, n, 65439)) || (LessThanEqualSign(65440, n, 65470)) || (LessThanEqualSign(65474, n, 65479)) || (LessThanEqualSign(65482, n, 65487)) || (LessThanEqualSign(65490, n, 65495)) || (LessThanEqualSign(65498, n, 65500)) || (LessThanEqualSign(65536, n, 65547)) || (LessThanEqualSign(65549, n, 65574)) || (LessThanEqualSign(65576, n, 65594)) || (LessThanEqualSign(65596, n, 65597)) || (LessThanEqualSign(65599, n, 65613)) || (LessThanEqualSign(65616, n, 65629)) || (LessThanEqualSign(65664, n, 65786)) || (LessThanEqualSign(65856, n, 65908)) || (LessThanEqualSign(66176, n, 66204)) || (LessThanEqualSign(66208, n, 66256)) || (LessThanEqualSign(66304, n, 66334)) || (LessThanEqualSign(66352, n, 66368)) || (EqualSign(n, 66369)) || (LessThanEqualSign(66370, n, 66377)) || (EqualSign(n, 66378)) || (LessThanEqualSign(66432, n, 66461)) || (LessThanEqualSign(66464, n, 66499)) || (LessThanEqualSign(66504, n, 66511)) || (LessThanEqualSign(66513, n, 66517)) || (LessThanEqualSign(66560, n, 66639)) || (LessThanEqualSign(66640, n, 66717)) || (LessThanEqualSign(67584, n, 67589)) || (EqualSign(n, 67592)) || (LessThanEqualSign(67594, n, 67637)) || (LessThanEqualSign(67639, n, 67640)) || (EqualSign(n, 67644)) || (EqualSign(n, 67647)) || (LessThanEqualSign(67840, n, 67861)) || (LessThanEqualSign(67872, n, 67897)) || (EqualSign(n, 68096)) || (LessThanEqualSign(68097, n, 68099)) || (LessThanEqualSign(68101, n, 68102)) || (LessThanEqualSign(68108, n, 68111)) || (LessThanEqualSign(68112, n, 68115)) || (LessThanEqualSign(68117, n, 68119)) || (LessThanEqualSign(68121, n, 68147)) || (LessThanEqualSign(73728, n, 74606)) || (LessThanEqualSign(74752, n, 74850)) || (LessThanEqualSign(119808, n, 119892)) || (LessThanEqualSign(119894, n, 119964)) || (LessThanEqualSign(119966, n, 119967)) || (EqualSign(n, 119970)) || (LessThanEqualSign(119973, n, 119974)) || (LessThanEqualSign(119977, n, 119980)) || (LessThanEqualSign(119982, n, 119993)) || (EqualSign(n, 119995)) || (LessThanEqualSign(119997, n, 120003)) || (LessThanEqualSign(120005, n, 120069)) || (LessThanEqualSign(120071, n, 120074)) || (LessThanEqualSign(120077, n, 120084)) || (LessThanEqualSign(120086, n, 120092)) || (LessThanEqualSign(120094, n, 120121)) || (LessThanEqualSign(120123, n, 120126)) || (LessThanEqualSign(120128, n, 120132)) || (EqualSign(n, 120134)) || (LessThanEqualSign(120138, n, 120144)) || (LessThanEqualSign(120146, n, 120485)) || (LessThanEqualSign(120488, n, 120512)) || (LessThanEqualSign(120514, n, 120538)) || (LessThanEqualSign(120540, n, 120570)) || (LessThanEqualSign(120572, n, 120596)) || (LessThanEqualSign(120598, n, 120628)) || (LessThanEqualSign(120630, n, 120654)) || (LessThanEqualSign(120656, n, 120686)) || (LessThanEqualSign(120688, n, 120712)) || (LessThanEqualSign(120714, n, 120744)) || (LessThanEqualSign(120746, n, 120770)) || (LessThanEqualSign(120772, n, 120779)) || (LessThanEqualSign(131072, n, 173782)) || (LessThanEqualSign(194560, n, 195101)));
});

var intDashLowerDashCaseP = (function (n) {
  return ((LessThanEqualSign(97, n, 122)) || (EqualSign(n, 170)) || (EqualSign(n, 181)) || (EqualSign(n, 186)) || (LessThanEqualSign(223, n, 246)) || (LessThanEqualSign(248, n, 255)) || (EqualSign(n, 257)) || (EqualSign(n, 259)) || (EqualSign(n, 261)) || (EqualSign(n, 263)) || (EqualSign(n, 265)) || (EqualSign(n, 267)) || (EqualSign(n, 269)) || (EqualSign(n, 271)) || (EqualSign(n, 273)) || (EqualSign(n, 275)) || (EqualSign(n, 277)) || (EqualSign(n, 279)) || (EqualSign(n, 281)) || (EqualSign(n, 283)) || (EqualSign(n, 285)) || (EqualSign(n, 287)) || (EqualSign(n, 289)) || (EqualSign(n, 291)) || (EqualSign(n, 293)) || (EqualSign(n, 295)) || (EqualSign(n, 297)) || (EqualSign(n, 299)) || (EqualSign(n, 301)) || (EqualSign(n, 303)) || (EqualSign(n, 305)) || (EqualSign(n, 307)) || (EqualSign(n, 309)) || (LessThanEqualSign(311, n, 312)) || (EqualSign(n, 314)) || (EqualSign(n, 316)) || (EqualSign(n, 318)) || (EqualSign(n, 320)) || (EqualSign(n, 322)) || (EqualSign(n, 324)) || (EqualSign(n, 326)) || (LessThanEqualSign(328, n, 329)) || (EqualSign(n, 331)) || (EqualSign(n, 333)) || (EqualSign(n, 335)) || (EqualSign(n, 337)) || (EqualSign(n, 339)) || (EqualSign(n, 341)) || (EqualSign(n, 343)) || (EqualSign(n, 345)) || (EqualSign(n, 347)) || (EqualSign(n, 349)) || (EqualSign(n, 351)) || (EqualSign(n, 353)) || (EqualSign(n, 355)) || (EqualSign(n, 357)) || (EqualSign(n, 359)) || (EqualSign(n, 361)) || (EqualSign(n, 363)) || (EqualSign(n, 365)) || (EqualSign(n, 367)) || (EqualSign(n, 369)) || (EqualSign(n, 371)) || (EqualSign(n, 373)) || (EqualSign(n, 375)) || (EqualSign(n, 378)) || (EqualSign(n, 380)) || (LessThanEqualSign(382, n, 384)) || (EqualSign(n, 387)) || (EqualSign(n, 389)) || (EqualSign(n, 392)) || (LessThanEqualSign(396, n, 397)) || (EqualSign(n, 402)) || (EqualSign(n, 405)) || (LessThanEqualSign(409, n, 411)) || (EqualSign(n, 414)) || (EqualSign(n, 417)) || (EqualSign(n, 419)) || (EqualSign(n, 421)) || (EqualSign(n, 424)) || (LessThanEqualSign(426, n, 427)) || (EqualSign(n, 429)) || (EqualSign(n, 432)) || (EqualSign(n, 436)) || (EqualSign(n, 438)) || (LessThanEqualSign(441, n, 442)) || (LessThanEqualSign(445, n, 447)) || (EqualSign(n, 454)) || (EqualSign(n, 457)) || (EqualSign(n, 460)) || (EqualSign(n, 462)) || (EqualSign(n, 464)) || (EqualSign(n, 466)) || (EqualSign(n, 468)) || (EqualSign(n, 470)) || (EqualSign(n, 472)) || (EqualSign(n, 474)) || (LessThanEqualSign(476, n, 477)) || (EqualSign(n, 479)) || (EqualSign(n, 481)) || (EqualSign(n, 483)) || (EqualSign(n, 485)) || (EqualSign(n, 487)) || (EqualSign(n, 489)) || (EqualSign(n, 491)) || (EqualSign(n, 493)) || (LessThanEqualSign(495, n, 496)) || (EqualSign(n, 499)) || (EqualSign(n, 501)) || (EqualSign(n, 505)) || (EqualSign(n, 507)) || (EqualSign(n, 509)) || (EqualSign(n, 511)) || (EqualSign(n, 513)) || (EqualSign(n, 515)) || (EqualSign(n, 517)) || (EqualSign(n, 519)) || (EqualSign(n, 521)) || (EqualSign(n, 523)) || (EqualSign(n, 525)) || (EqualSign(n, 527)) || (EqualSign(n, 529)) || (EqualSign(n, 531)) || (EqualSign(n, 533)) || (EqualSign(n, 535)) || (EqualSign(n, 537)) || (EqualSign(n, 539)) || (EqualSign(n, 541)) || (EqualSign(n, 543)) || (EqualSign(n, 545)) || (EqualSign(n, 547)) || (EqualSign(n, 549)) || (EqualSign(n, 551)) || (EqualSign(n, 553)) || (EqualSign(n, 555)) || (EqualSign(n, 557)) || (EqualSign(n, 559)) || (EqualSign(n, 561)) || (LessThanEqualSign(563, n, 569)) || (EqualSign(n, 572)) || (LessThanEqualSign(575, n, 576)) || (EqualSign(n, 578)) || (EqualSign(n, 583)) || (EqualSign(n, 585)) || (EqualSign(n, 587)) || (EqualSign(n, 589)) || (LessThanEqualSign(591, n, 659)) || (LessThanEqualSign(661, n, 687)) || (LessThanEqualSign(688, n, 696)) || (LessThanEqualSign(704, n, 705)) || (LessThanEqualSign(736, n, 740)) || (EqualSign(n, 837)) || (EqualSign(n, 881)) || (EqualSign(n, 883)) || (EqualSign(n, 887)) || (EqualSign(n, 890)) || (LessThanEqualSign(891, n, 893)) || (EqualSign(n, 912)) || (LessThanEqualSign(940, n, 974)) || (LessThanEqualSign(976, n, 977)) || (LessThanEqualSign(981, n, 983)) || (EqualSign(n, 985)) || (EqualSign(n, 987)) || (EqualSign(n, 989)) || (EqualSign(n, 991)) || (EqualSign(n, 993)) || (EqualSign(n, 995)) || (EqualSign(n, 997)) || (EqualSign(n, 999)) || (EqualSign(n, 1001)) || (EqualSign(n, 1003)) || (EqualSign(n, 1005)) || (LessThanEqualSign(1007, n, 1011)) || (EqualSign(n, 1013)) || (EqualSign(n, 1016)) || (LessThanEqualSign(1019, n, 1020)) || (LessThanEqualSign(1072, n, 1119)) || (EqualSign(n, 1121)) || (EqualSign(n, 1123)) || (EqualSign(n, 1125)) || (EqualSign(n, 1127)) || (EqualSign(n, 1129)) || (EqualSign(n, 1131)) || (EqualSign(n, 1133)) || (EqualSign(n, 1135)) || (EqualSign(n, 1137)) || (EqualSign(n, 1139)) || (EqualSign(n, 1141)) || (EqualSign(n, 1143)) || (EqualSign(n, 1145)) || (EqualSign(n, 1147)) || (EqualSign(n, 1149)) || (EqualSign(n, 1151)) || (EqualSign(n, 1153)) || (EqualSign(n, 1163)) || (EqualSign(n, 1165)) || (EqualSign(n, 1167)) || (EqualSign(n, 1169)) || (EqualSign(n, 1171)) || (EqualSign(n, 1173)) || (EqualSign(n, 1175)) || (EqualSign(n, 1177)) || (EqualSign(n, 1179)) || (EqualSign(n, 1181)) || (EqualSign(n, 1183)) || (EqualSign(n, 1185)) || (EqualSign(n, 1187)) || (EqualSign(n, 1189)) || (EqualSign(n, 1191)) || (EqualSign(n, 1193)) || (EqualSign(n, 1195)) || (EqualSign(n, 1197)) || (EqualSign(n, 1199)) || (EqualSign(n, 1201)) || (EqualSign(n, 1203)) || (EqualSign(n, 1205)) || (EqualSign(n, 1207)) || (EqualSign(n, 1209)) || (EqualSign(n, 1211)) || (EqualSign(n, 1213)) || (EqualSign(n, 1215)) || (EqualSign(n, 1218)) || (EqualSign(n, 1220)) || (EqualSign(n, 1222)) || (EqualSign(n, 1224)) || (EqualSign(n, 1226)) || (EqualSign(n, 1228)) || (LessThanEqualSign(1230, n, 1231)) || (EqualSign(n, 1233)) || (EqualSign(n, 1235)) || (EqualSign(n, 1237)) || (EqualSign(n, 1239)) || (EqualSign(n, 1241)) || (EqualSign(n, 1243)) || (EqualSign(n, 1245)) || (EqualSign(n, 1247)) || (EqualSign(n, 1249)) || (EqualSign(n, 1251)) || (EqualSign(n, 1253)) || (EqualSign(n, 1255)) || (EqualSign(n, 1257)) || (EqualSign(n, 1259)) || (EqualSign(n, 1261)) || (EqualSign(n, 1263)) || (EqualSign(n, 1265)) || (EqualSign(n, 1267)) || (EqualSign(n, 1269)) || (EqualSign(n, 1271)) || (EqualSign(n, 1273)) || (EqualSign(n, 1275)) || (EqualSign(n, 1277)) || (EqualSign(n, 1279)) || (EqualSign(n, 1281)) || (EqualSign(n, 1283)) || (EqualSign(n, 1285)) || (EqualSign(n, 1287)) || (EqualSign(n, 1289)) || (EqualSign(n, 1291)) || (EqualSign(n, 1293)) || (EqualSign(n, 1295)) || (EqualSign(n, 1297)) || (EqualSign(n, 1299)) || (EqualSign(n, 1301)) || (EqualSign(n, 1303)) || (EqualSign(n, 1305)) || (EqualSign(n, 1307)) || (EqualSign(n, 1309)) || (EqualSign(n, 1311)) || (EqualSign(n, 1313)) || (EqualSign(n, 1315)) || (LessThanEqualSign(1377, n, 1415)) || (LessThanEqualSign(7424, n, 7467)) || (LessThanEqualSign(7468, n, 7521)) || (LessThanEqualSign(7522, n, 7543)) || (EqualSign(n, 7544)) || (LessThanEqualSign(7545, n, 7578)) || (LessThanEqualSign(7579, n, 7615)) || (EqualSign(n, 7681)) || (EqualSign(n, 7683)) || (EqualSign(n, 7685)) || (EqualSign(n, 7687)) || (EqualSign(n, 7689)) || (EqualSign(n, 7691)) || (EqualSign(n, 7693)) || (EqualSign(n, 7695)) || (EqualSign(n, 7697)) || (EqualSign(n, 7699)) || (EqualSign(n, 7701)) || (EqualSign(n, 7703)) || (EqualSign(n, 7705)) || (EqualSign(n, 7707)) || (EqualSign(n, 7709)) || (EqualSign(n, 7711)) || (EqualSign(n, 7713)) || (EqualSign(n, 7715)) || (EqualSign(n, 7717)) || (EqualSign(n, 7719)) || (EqualSign(n, 7721)) || (EqualSign(n, 7723)) || (EqualSign(n, 7725)) || (EqualSign(n, 7727)) || (EqualSign(n, 7729)) || (EqualSign(n, 7731)) || (EqualSign(n, 7733)) || (EqualSign(n, 7735)) || (EqualSign(n, 7737)) || (EqualSign(n, 7739)) || (EqualSign(n, 7741)) || (EqualSign(n, 7743)) || (EqualSign(n, 7745)) || (EqualSign(n, 7747)) || (EqualSign(n, 7749)) || (EqualSign(n, 7751)) || (EqualSign(n, 7753)) || (EqualSign(n, 7755)) || (EqualSign(n, 7757)) || (EqualSign(n, 7759)) || (EqualSign(n, 7761)) || (EqualSign(n, 7763)) || (EqualSign(n, 7765)) || (EqualSign(n, 7767)) || (EqualSign(n, 7769)) || (EqualSign(n, 7771)) || (EqualSign(n, 7773)) || (EqualSign(n, 7775)) || (EqualSign(n, 7777)) || (EqualSign(n, 7779)) || (EqualSign(n, 7781)) || (EqualSign(n, 7783)) || (EqualSign(n, 7785)) || (EqualSign(n, 7787)) || (EqualSign(n, 7789)) || (EqualSign(n, 7791)) || (EqualSign(n, 7793)) || (EqualSign(n, 7795)) || (EqualSign(n, 7797)) || (EqualSign(n, 7799)) || (EqualSign(n, 7801)) || (EqualSign(n, 7803)) || (EqualSign(n, 7805)) || (EqualSign(n, 7807)) || (EqualSign(n, 7809)) || (EqualSign(n, 7811)) || (EqualSign(n, 7813)) || (EqualSign(n, 7815)) || (EqualSign(n, 7817)) || (EqualSign(n, 7819)) || (EqualSign(n, 7821)) || (EqualSign(n, 7823)) || (EqualSign(n, 7825)) || (EqualSign(n, 7827)) || (LessThanEqualSign(7829, n, 7837)) || (EqualSign(n, 7839)) || (EqualSign(n, 7841)) || (EqualSign(n, 7843)) || (EqualSign(n, 7845)) || (EqualSign(n, 7847)) || (EqualSign(n, 7849)) || (EqualSign(n, 7851)) || (EqualSign(n, 7853)) || (EqualSign(n, 7855)) || (EqualSign(n, 7857)) || (EqualSign(n, 7859)) || (EqualSign(n, 7861)) || (EqualSign(n, 7863)) || (EqualSign(n, 7865)) || (EqualSign(n, 7867)) || (EqualSign(n, 7869)) || (EqualSign(n, 7871)) || (EqualSign(n, 7873)) || (EqualSign(n, 7875)) || (EqualSign(n, 7877)) || (EqualSign(n, 7879)) || (EqualSign(n, 7881)) || (EqualSign(n, 7883)) || (EqualSign(n, 7885)) || (EqualSign(n, 7887)) || (EqualSign(n, 7889)) || (EqualSign(n, 7891)) || (EqualSign(n, 7893)) || (EqualSign(n, 7895)) || (EqualSign(n, 7897)) || (EqualSign(n, 7899)) || (EqualSign(n, 7901)) || (EqualSign(n, 7903)) || (EqualSign(n, 7905)) || (EqualSign(n, 7907)) || (EqualSign(n, 7909)) || (EqualSign(n, 7911)) || (EqualSign(n, 7913)) || (EqualSign(n, 7915)) || (EqualSign(n, 7917)) || (EqualSign(n, 7919)) || (EqualSign(n, 7921)) || (EqualSign(n, 7923)) || (EqualSign(n, 7925)) || (EqualSign(n, 7927)) || (EqualSign(n, 7929)) || (EqualSign(n, 7931)) || (EqualSign(n, 7933)) || (LessThanEqualSign(7935, n, 7943)) || (LessThanEqualSign(7952, n, 7957)) || (LessThanEqualSign(7968, n, 7975)) || (LessThanEqualSign(7984, n, 7991)) || (LessThanEqualSign(8000, n, 8005)) || (LessThanEqualSign(8016, n, 8023)) || (LessThanEqualSign(8032, n, 8039)) || (LessThanEqualSign(8048, n, 8061)) || (LessThanEqualSign(8064, n, 8071)) || (LessThanEqualSign(8080, n, 8087)) || (LessThanEqualSign(8096, n, 8103)) || (LessThanEqualSign(8112, n, 8116)) || (LessThanEqualSign(8118, n, 8119)) || (EqualSign(n, 8126)) || (LessThanEqualSign(8130, n, 8132)) || (LessThanEqualSign(8134, n, 8135)) || (LessThanEqualSign(8144, n, 8147)) || (LessThanEqualSign(8150, n, 8151)) || (LessThanEqualSign(8160, n, 8167)) || (LessThanEqualSign(8178, n, 8180)) || (LessThanEqualSign(8182, n, 8183)) || (EqualSign(n, 8305)) || (EqualSign(n, 8319)) || (LessThanEqualSign(8336, n, 8340)) || (EqualSign(n, 8458)) || (LessThanEqualSign(8462, n, 8463)) || (EqualSign(n, 8467)) || (EqualSign(n, 8495)) || (EqualSign(n, 8500)) || (EqualSign(n, 8505)) || (LessThanEqualSign(8508, n, 8509)) || (LessThanEqualSign(8518, n, 8521)) || (EqualSign(n, 8526)) || (LessThanEqualSign(8560, n, 8575)) || (EqualSign(n, 8580)) || (LessThanEqualSign(9424, n, 9449)) || (LessThanEqualSign(11312, n, 11358)) || (EqualSign(n, 11361)) || (LessThanEqualSign(11365, n, 11366)) || (EqualSign(n, 11368)) || (EqualSign(n, 11370)) || (EqualSign(n, 11372)) || (EqualSign(n, 11377)) || (LessThanEqualSign(11379, n, 11380)) || (LessThanEqualSign(11382, n, 11388)) || (EqualSign(n, 11389)) || (EqualSign(n, 11393)) || (EqualSign(n, 11395)) || (EqualSign(n, 11397)) || (EqualSign(n, 11399)) || (EqualSign(n, 11401)) || (EqualSign(n, 11403)) || (EqualSign(n, 11405)) || (EqualSign(n, 11407)) || (EqualSign(n, 11409)) || (EqualSign(n, 11411)) || (EqualSign(n, 11413)) || (EqualSign(n, 11415)) || (EqualSign(n, 11417)) || (EqualSign(n, 11419)) || (EqualSign(n, 11421)) || (EqualSign(n, 11423)) || (EqualSign(n, 11425)) || (EqualSign(n, 11427)) || (EqualSign(n, 11429)) || (EqualSign(n, 11431)) || (EqualSign(n, 11433)) || (EqualSign(n, 11435)) || (EqualSign(n, 11437)) || (EqualSign(n, 11439)) || (EqualSign(n, 11441)) || (EqualSign(n, 11443)) || (EqualSign(n, 11445)) || (EqualSign(n, 11447)) || (EqualSign(n, 11449)) || (EqualSign(n, 11451)) || (EqualSign(n, 11453)) || (EqualSign(n, 11455)) || (EqualSign(n, 11457)) || (EqualSign(n, 11459)) || (EqualSign(n, 11461)) || (EqualSign(n, 11463)) || (EqualSign(n, 11465)) || (EqualSign(n, 11467)) || (EqualSign(n, 11469)) || (EqualSign(n, 11471)) || (EqualSign(n, 11473)) || (EqualSign(n, 11475)) || (EqualSign(n, 11477)) || (EqualSign(n, 11479)) || (EqualSign(n, 11481)) || (EqualSign(n, 11483)) || (EqualSign(n, 11485)) || (EqualSign(n, 11487)) || (EqualSign(n, 11489)) || (LessThanEqualSign(11491, n, 11492)) || (LessThanEqualSign(11520, n, 11557)) || (EqualSign(n, 42561)) || (EqualSign(n, 42563)) || (EqualSign(n, 42565)) || (EqualSign(n, 42567)) || (EqualSign(n, 42569)) || (EqualSign(n, 42571)) || (EqualSign(n, 42573)) || (EqualSign(n, 42575)) || (EqualSign(n, 42577)) || (EqualSign(n, 42579)) || (EqualSign(n, 42581)) || (EqualSign(n, 42583)) || (EqualSign(n, 42585)) || (EqualSign(n, 42587)) || (EqualSign(n, 42589)) || (EqualSign(n, 42591)) || (EqualSign(n, 42595)) || (EqualSign(n, 42597)) || (EqualSign(n, 42599)) || (EqualSign(n, 42601)) || (EqualSign(n, 42603)) || (EqualSign(n, 42605)) || (EqualSign(n, 42625)) || (EqualSign(n, 42627)) || (EqualSign(n, 42629)) || (EqualSign(n, 42631)) || (EqualSign(n, 42633)) || (EqualSign(n, 42635)) || (EqualSign(n, 42637)) || (EqualSign(n, 42639)) || (EqualSign(n, 42641)) || (EqualSign(n, 42643)) || (EqualSign(n, 42645)) || (EqualSign(n, 42647)) || (EqualSign(n, 42787)) || (EqualSign(n, 42789)) || (EqualSign(n, 42791)) || (EqualSign(n, 42793)) || (EqualSign(n, 42795)) || (EqualSign(n, 42797)) || (LessThanEqualSign(42799, n, 42801)) || (EqualSign(n, 42803)) || (EqualSign(n, 42805)) || (EqualSign(n, 42807)) || (EqualSign(n, 42809)) || (EqualSign(n, 42811)) || (EqualSign(n, 42813)) || (EqualSign(n, 42815)) || (EqualSign(n, 42817)) || (EqualSign(n, 42819)) || (EqualSign(n, 42821)) || (EqualSign(n, 42823)) || (EqualSign(n, 42825)) || (EqualSign(n, 42827)) || (EqualSign(n, 42829)) || (EqualSign(n, 42831)) || (EqualSign(n, 42833)) || (EqualSign(n, 42835)) || (EqualSign(n, 42837)) || (EqualSign(n, 42839)) || (EqualSign(n, 42841)) || (EqualSign(n, 42843)) || (EqualSign(n, 42845)) || (EqualSign(n, 42847)) || (EqualSign(n, 42849)) || (EqualSign(n, 42851)) || (EqualSign(n, 42853)) || (EqualSign(n, 42855)) || (EqualSign(n, 42857)) || (EqualSign(n, 42859)) || (EqualSign(n, 42861)) || (EqualSign(n, 42863)) || (EqualSign(n, 42864)) || (LessThanEqualSign(42865, n, 42872)) || (EqualSign(n, 42874)) || (EqualSign(n, 42876)) || (EqualSign(n, 42879)) || (EqualSign(n, 42881)) || (EqualSign(n, 42883)) || (EqualSign(n, 42885)) || (EqualSign(n, 42887)) || (EqualSign(n, 42892)) || (LessThanEqualSign(64256, n, 64262)) || (LessThanEqualSign(64275, n, 64279)) || (LessThanEqualSign(65345, n, 65370)) || (LessThanEqualSign(66600, n, 66639)) || (LessThanEqualSign(119834, n, 119859)) || (LessThanEqualSign(119886, n, 119892)) || (LessThanEqualSign(119894, n, 119911)) || (LessThanEqualSign(119938, n, 119963)) || (LessThanEqualSign(119990, n, 119993)) || (EqualSign(n, 119995)) || (LessThanEqualSign(119997, n, 120003)) || (LessThanEqualSign(120005, n, 120015)) || (LessThanEqualSign(120042, n, 120067)) || (LessThanEqualSign(120094, n, 120119)) || (LessThanEqualSign(120146, n, 120171)) || (LessThanEqualSign(120198, n, 120223)) || (LessThanEqualSign(120250, n, 120275)) || (LessThanEqualSign(120302, n, 120327)) || (LessThanEqualSign(120354, n, 120379)) || (LessThanEqualSign(120406, n, 120431)) || (LessThanEqualSign(120458, n, 120485)) || (LessThanEqualSign(120514, n, 120538)) || (LessThanEqualSign(120540, n, 120545)) || (LessThanEqualSign(120572, n, 120596)) || (LessThanEqualSign(120598, n, 120603)) || (LessThanEqualSign(120630, n, 120654)) || (LessThanEqualSign(120656, n, 120661)) || (LessThanEqualSign(120688, n, 120712)) || (LessThanEqualSign(120714, n, 120719)) || (LessThanEqualSign(120746, n, 120770)) || (LessThanEqualSign(120772, n, 120777)) || (EqualSign(n, 120779)));
});

var intDashUpperDashCaseP = (function (n) {
  return ((LessThanEqualSign(65, n, 90)) || (LessThanEqualSign(192, n, 214)) || (LessThanEqualSign(216, n, 222)) || (EqualSign(n, 256)) || (EqualSign(n, 258)) || (EqualSign(n, 260)) || (EqualSign(n, 262)) || (EqualSign(n, 264)) || (EqualSign(n, 266)) || (EqualSign(n, 268)) || (EqualSign(n, 270)) || (EqualSign(n, 272)) || (EqualSign(n, 274)) || (EqualSign(n, 276)) || (EqualSign(n, 278)) || (EqualSign(n, 280)) || (EqualSign(n, 282)) || (EqualSign(n, 284)) || (EqualSign(n, 286)) || (EqualSign(n, 288)) || (EqualSign(n, 290)) || (EqualSign(n, 292)) || (EqualSign(n, 294)) || (EqualSign(n, 296)) || (EqualSign(n, 298)) || (EqualSign(n, 300)) || (EqualSign(n, 302)) || (EqualSign(n, 304)) || (EqualSign(n, 306)) || (EqualSign(n, 308)) || (EqualSign(n, 310)) || (EqualSign(n, 313)) || (EqualSign(n, 315)) || (EqualSign(n, 317)) || (EqualSign(n, 319)) || (EqualSign(n, 321)) || (EqualSign(n, 323)) || (EqualSign(n, 325)) || (EqualSign(n, 327)) || (EqualSign(n, 330)) || (EqualSign(n, 332)) || (EqualSign(n, 334)) || (EqualSign(n, 336)) || (EqualSign(n, 338)) || (EqualSign(n, 340)) || (EqualSign(n, 342)) || (EqualSign(n, 344)) || (EqualSign(n, 346)) || (EqualSign(n, 348)) || (EqualSign(n, 350)) || (EqualSign(n, 352)) || (EqualSign(n, 354)) || (EqualSign(n, 356)) || (EqualSign(n, 358)) || (EqualSign(n, 360)) || (EqualSign(n, 362)) || (EqualSign(n, 364)) || (EqualSign(n, 366)) || (EqualSign(n, 368)) || (EqualSign(n, 370)) || (EqualSign(n, 372)) || (EqualSign(n, 374)) || (LessThanEqualSign(376, n, 377)) || (EqualSign(n, 379)) || (EqualSign(n, 381)) || (LessThanEqualSign(385, n, 386)) || (EqualSign(n, 388)) || (LessThanEqualSign(390, n, 391)) || (LessThanEqualSign(393, n, 395)) || (LessThanEqualSign(398, n, 401)) || (LessThanEqualSign(403, n, 404)) || (LessThanEqualSign(406, n, 408)) || (LessThanEqualSign(412, n, 413)) || (LessThanEqualSign(415, n, 416)) || (EqualSign(n, 418)) || (EqualSign(n, 420)) || (LessThanEqualSign(422, n, 423)) || (EqualSign(n, 425)) || (EqualSign(n, 428)) || (LessThanEqualSign(430, n, 431)) || (LessThanEqualSign(433, n, 435)) || (EqualSign(n, 437)) || (LessThanEqualSign(439, n, 440)) || (EqualSign(n, 444)) || (EqualSign(n, 452)) || (EqualSign(n, 455)) || (EqualSign(n, 458)) || (EqualSign(n, 461)) || (EqualSign(n, 463)) || (EqualSign(n, 465)) || (EqualSign(n, 467)) || (EqualSign(n, 469)) || (EqualSign(n, 471)) || (EqualSign(n, 473)) || (EqualSign(n, 475)) || (EqualSign(n, 478)) || (EqualSign(n, 480)) || (EqualSign(n, 482)) || (EqualSign(n, 484)) || (EqualSign(n, 486)) || (EqualSign(n, 488)) || (EqualSign(n, 490)) || (EqualSign(n, 492)) || (EqualSign(n, 494)) || (EqualSign(n, 497)) || (EqualSign(n, 500)) || (LessThanEqualSign(502, n, 504)) || (EqualSign(n, 506)) || (EqualSign(n, 508)) || (EqualSign(n, 510)) || (EqualSign(n, 512)) || (EqualSign(n, 514)) || (EqualSign(n, 516)) || (EqualSign(n, 518)) || (EqualSign(n, 520)) || (EqualSign(n, 522)) || (EqualSign(n, 524)) || (EqualSign(n, 526)) || (EqualSign(n, 528)) || (EqualSign(n, 530)) || (EqualSign(n, 532)) || (EqualSign(n, 534)) || (EqualSign(n, 536)) || (EqualSign(n, 538)) || (EqualSign(n, 540)) || (EqualSign(n, 542)) || (EqualSign(n, 544)) || (EqualSign(n, 546)) || (EqualSign(n, 548)) || (EqualSign(n, 550)) || (EqualSign(n, 552)) || (EqualSign(n, 554)) || (EqualSign(n, 556)) || (EqualSign(n, 558)) || (EqualSign(n, 560)) || (EqualSign(n, 562)) || (LessThanEqualSign(570, n, 571)) || (LessThanEqualSign(573, n, 574)) || (EqualSign(n, 577)) || (LessThanEqualSign(579, n, 582)) || (EqualSign(n, 584)) || (EqualSign(n, 586)) || (EqualSign(n, 588)) || (EqualSign(n, 590)) || (EqualSign(n, 880)) || (EqualSign(n, 882)) || (EqualSign(n, 886)) || (EqualSign(n, 902)) || (LessThanEqualSign(904, n, 906)) || (EqualSign(n, 908)) || (LessThanEqualSign(910, n, 911)) || (LessThanEqualSign(913, n, 929)) || (LessThanEqualSign(931, n, 939)) || (EqualSign(n, 975)) || (LessThanEqualSign(978, n, 980)) || (EqualSign(n, 984)) || (EqualSign(n, 986)) || (EqualSign(n, 988)) || (EqualSign(n, 990)) || (EqualSign(n, 992)) || (EqualSign(n, 994)) || (EqualSign(n, 996)) || (EqualSign(n, 998)) || (EqualSign(n, 1000)) || (EqualSign(n, 1002)) || (EqualSign(n, 1004)) || (EqualSign(n, 1006)) || (EqualSign(n, 1012)) || (EqualSign(n, 1015)) || (LessThanEqualSign(1017, n, 1018)) || (LessThanEqualSign(1021, n, 1071)) || (EqualSign(n, 1120)) || (EqualSign(n, 1122)) || (EqualSign(n, 1124)) || (EqualSign(n, 1126)) || (EqualSign(n, 1128)) || (EqualSign(n, 1130)) || (EqualSign(n, 1132)) || (EqualSign(n, 1134)) || (EqualSign(n, 1136)) || (EqualSign(n, 1138)) || (EqualSign(n, 1140)) || (EqualSign(n, 1142)) || (EqualSign(n, 1144)) || (EqualSign(n, 1146)) || (EqualSign(n, 1148)) || (EqualSign(n, 1150)) || (EqualSign(n, 1152)) || (EqualSign(n, 1162)) || (EqualSign(n, 1164)) || (EqualSign(n, 1166)) || (EqualSign(n, 1168)) || (EqualSign(n, 1170)) || (EqualSign(n, 1172)) || (EqualSign(n, 1174)) || (EqualSign(n, 1176)) || (EqualSign(n, 1178)) || (EqualSign(n, 1180)) || (EqualSign(n, 1182)) || (EqualSign(n, 1184)) || (EqualSign(n, 1186)) || (EqualSign(n, 1188)) || (EqualSign(n, 1190)) || (EqualSign(n, 1192)) || (EqualSign(n, 1194)) || (EqualSign(n, 1196)) || (EqualSign(n, 1198)) || (EqualSign(n, 1200)) || (EqualSign(n, 1202)) || (EqualSign(n, 1204)) || (EqualSign(n, 1206)) || (EqualSign(n, 1208)) || (EqualSign(n, 1210)) || (EqualSign(n, 1212)) || (EqualSign(n, 1214)) || (LessThanEqualSign(1216, n, 1217)) || (EqualSign(n, 1219)) || (EqualSign(n, 1221)) || (EqualSign(n, 1223)) || (EqualSign(n, 1225)) || (EqualSign(n, 1227)) || (EqualSign(n, 1229)) || (EqualSign(n, 1232)) || (EqualSign(n, 1234)) || (EqualSign(n, 1236)) || (EqualSign(n, 1238)) || (EqualSign(n, 1240)) || (EqualSign(n, 1242)) || (EqualSign(n, 1244)) || (EqualSign(n, 1246)) || (EqualSign(n, 1248)) || (EqualSign(n, 1250)) || (EqualSign(n, 1252)) || (EqualSign(n, 1254)) || (EqualSign(n, 1256)) || (EqualSign(n, 1258)) || (EqualSign(n, 1260)) || (EqualSign(n, 1262)) || (EqualSign(n, 1264)) || (EqualSign(n, 1266)) || (EqualSign(n, 1268)) || (EqualSign(n, 1270)) || (EqualSign(n, 1272)) || (EqualSign(n, 1274)) || (EqualSign(n, 1276)) || (EqualSign(n, 1278)) || (EqualSign(n, 1280)) || (EqualSign(n, 1282)) || (EqualSign(n, 1284)) || (EqualSign(n, 1286)) || (EqualSign(n, 1288)) || (EqualSign(n, 1290)) || (EqualSign(n, 1292)) || (EqualSign(n, 1294)) || (EqualSign(n, 1296)) || (EqualSign(n, 1298)) || (EqualSign(n, 1300)) || (EqualSign(n, 1302)) || (EqualSign(n, 1304)) || (EqualSign(n, 1306)) || (EqualSign(n, 1308)) || (EqualSign(n, 1310)) || (EqualSign(n, 1312)) || (EqualSign(n, 1314)) || (LessThanEqualSign(1329, n, 1366)) || (LessThanEqualSign(4256, n, 4293)) || (EqualSign(n, 7680)) || (EqualSign(n, 7682)) || (EqualSign(n, 7684)) || (EqualSign(n, 7686)) || (EqualSign(n, 7688)) || (EqualSign(n, 7690)) || (EqualSign(n, 7692)) || (EqualSign(n, 7694)) || (EqualSign(n, 7696)) || (EqualSign(n, 7698)) || (EqualSign(n, 7700)) || (EqualSign(n, 7702)) || (EqualSign(n, 7704)) || (EqualSign(n, 7706)) || (EqualSign(n, 7708)) || (EqualSign(n, 7710)) || (EqualSign(n, 7712)) || (EqualSign(n, 7714)) || (EqualSign(n, 7716)) || (EqualSign(n, 7718)) || (EqualSign(n, 7720)) || (EqualSign(n, 7722)) || (EqualSign(n, 7724)) || (EqualSign(n, 7726)) || (EqualSign(n, 7728)) || (EqualSign(n, 7730)) || (EqualSign(n, 7732)) || (EqualSign(n, 7734)) || (EqualSign(n, 7736)) || (EqualSign(n, 7738)) || (EqualSign(n, 7740)) || (EqualSign(n, 7742)) || (EqualSign(n, 7744)) || (EqualSign(n, 7746)) || (EqualSign(n, 7748)) || (EqualSign(n, 7750)) || (EqualSign(n, 7752)) || (EqualSign(n, 7754)) || (EqualSign(n, 7756)) || (EqualSign(n, 7758)) || (EqualSign(n, 7760)) || (EqualSign(n, 7762)) || (EqualSign(n, 7764)) || (EqualSign(n, 7766)) || (EqualSign(n, 7768)) || (EqualSign(n, 7770)) || (EqualSign(n, 7772)) || (EqualSign(n, 7774)) || (EqualSign(n, 7776)) || (EqualSign(n, 7778)) || (EqualSign(n, 7780)) || (EqualSign(n, 7782)) || (EqualSign(n, 7784)) || (EqualSign(n, 7786)) || (EqualSign(n, 7788)) || (EqualSign(n, 7790)) || (EqualSign(n, 7792)) || (EqualSign(n, 7794)) || (EqualSign(n, 7796)) || (EqualSign(n, 7798)) || (EqualSign(n, 7800)) || (EqualSign(n, 7802)) || (EqualSign(n, 7804)) || (EqualSign(n, 7806)) || (EqualSign(n, 7808)) || (EqualSign(n, 7810)) || (EqualSign(n, 7812)) || (EqualSign(n, 7814)) || (EqualSign(n, 7816)) || (EqualSign(n, 7818)) || (EqualSign(n, 7820)) || (EqualSign(n, 7822)) || (EqualSign(n, 7824)) || (EqualSign(n, 7826)) || (EqualSign(n, 7828)) || (EqualSign(n, 7838)) || (EqualSign(n, 7840)) || (EqualSign(n, 7842)) || (EqualSign(n, 7844)) || (EqualSign(n, 7846)) || (EqualSign(n, 7848)) || (EqualSign(n, 7850)) || (EqualSign(n, 7852)) || (EqualSign(n, 7854)) || (EqualSign(n, 7856)) || (EqualSign(n, 7858)) || (EqualSign(n, 7860)) || (EqualSign(n, 7862)) || (EqualSign(n, 7864)) || (EqualSign(n, 7866)) || (EqualSign(n, 7868)) || (EqualSign(n, 7870)) || (EqualSign(n, 7872)) || (EqualSign(n, 7874)) || (EqualSign(n, 7876)) || (EqualSign(n, 7878)) || (EqualSign(n, 7880)) || (EqualSign(n, 7882)) || (EqualSign(n, 7884)) || (EqualSign(n, 7886)) || (EqualSign(n, 7888)) || (EqualSign(n, 7890)) || (EqualSign(n, 7892)) || (EqualSign(n, 7894)) || (EqualSign(n, 7896)) || (EqualSign(n, 7898)) || (EqualSign(n, 7900)) || (EqualSign(n, 7902)) || (EqualSign(n, 7904)) || (EqualSign(n, 7906)) || (EqualSign(n, 7908)) || (EqualSign(n, 7910)) || (EqualSign(n, 7912)) || (EqualSign(n, 7914)) || (EqualSign(n, 7916)) || (EqualSign(n, 7918)) || (EqualSign(n, 7920)) || (EqualSign(n, 7922)) || (EqualSign(n, 7924)) || (EqualSign(n, 7926)) || (EqualSign(n, 7928)) || (EqualSign(n, 7930)) || (EqualSign(n, 7932)) || (EqualSign(n, 7934)) || (LessThanEqualSign(7944, n, 7951)) || (LessThanEqualSign(7960, n, 7965)) || (LessThanEqualSign(7976, n, 7983)) || (LessThanEqualSign(7992, n, 7999)) || (LessThanEqualSign(8008, n, 8013)) || (EqualSign(n, 8025)) || (EqualSign(n, 8027)) || (EqualSign(n, 8029)) || (EqualSign(n, 8031)) || (LessThanEqualSign(8040, n, 8047)) || (LessThanEqualSign(8120, n, 8123)) || (LessThanEqualSign(8136, n, 8139)) || (LessThanEqualSign(8152, n, 8155)) || (LessThanEqualSign(8168, n, 8172)) || (LessThanEqualSign(8184, n, 8187)) || (EqualSign(n, 8450)) || (EqualSign(n, 8455)) || (LessThanEqualSign(8459, n, 8461)) || (LessThanEqualSign(8464, n, 8466)) || (EqualSign(n, 8469)) || (LessThanEqualSign(8473, n, 8477)) || (EqualSign(n, 8484)) || (EqualSign(n, 8486)) || (EqualSign(n, 8488)) || (LessThanEqualSign(8490, n, 8493)) || (LessThanEqualSign(8496, n, 8499)) || (LessThanEqualSign(8510, n, 8511)) || (EqualSign(n, 8517)) || (LessThanEqualSign(8544, n, 8559)) || (EqualSign(n, 8579)) || (LessThanEqualSign(9398, n, 9423)) || (LessThanEqualSign(11264, n, 11310)) || (EqualSign(n, 11360)) || (LessThanEqualSign(11362, n, 11364)) || (EqualSign(n, 11367)) || (EqualSign(n, 11369)) || (EqualSign(n, 11371)) || (LessThanEqualSign(11373, n, 11375)) || (EqualSign(n, 11378)) || (EqualSign(n, 11381)) || (EqualSign(n, 11392)) || (EqualSign(n, 11394)) || (EqualSign(n, 11396)) || (EqualSign(n, 11398)) || (EqualSign(n, 11400)) || (EqualSign(n, 11402)) || (EqualSign(n, 11404)) || (EqualSign(n, 11406)) || (EqualSign(n, 11408)) || (EqualSign(n, 11410)) || (EqualSign(n, 11412)) || (EqualSign(n, 11414)) || (EqualSign(n, 11416)) || (EqualSign(n, 11418)) || (EqualSign(n, 11420)) || (EqualSign(n, 11422)) || (EqualSign(n, 11424)) || (EqualSign(n, 11426)) || (EqualSign(n, 11428)) || (EqualSign(n, 11430)) || (EqualSign(n, 11432)) || (EqualSign(n, 11434)) || (EqualSign(n, 11436)) || (EqualSign(n, 11438)) || (EqualSign(n, 11440)) || (EqualSign(n, 11442)) || (EqualSign(n, 11444)) || (EqualSign(n, 11446)) || (EqualSign(n, 11448)) || (EqualSign(n, 11450)) || (EqualSign(n, 11452)) || (EqualSign(n, 11454)) || (EqualSign(n, 11456)) || (EqualSign(n, 11458)) || (EqualSign(n, 11460)) || (EqualSign(n, 11462)) || (EqualSign(n, 11464)) || (EqualSign(n, 11466)) || (EqualSign(n, 11468)) || (EqualSign(n, 11470)) || (EqualSign(n, 11472)) || (EqualSign(n, 11474)) || (EqualSign(n, 11476)) || (EqualSign(n, 11478)) || (EqualSign(n, 11480)) || (EqualSign(n, 11482)) || (EqualSign(n, 11484)) || (EqualSign(n, 11486)) || (EqualSign(n, 11488)) || (EqualSign(n, 11490)) || (EqualSign(n, 42560)) || (EqualSign(n, 42562)) || (EqualSign(n, 42564)) || (EqualSign(n, 42566)) || (EqualSign(n, 42568)) || (EqualSign(n, 42570)) || (EqualSign(n, 42572)) || (EqualSign(n, 42574)) || (EqualSign(n, 42576)) || (EqualSign(n, 42578)) || (EqualSign(n, 42580)) || (EqualSign(n, 42582)) || (EqualSign(n, 42584)) || (EqualSign(n, 42586)) || (EqualSign(n, 42588)) || (EqualSign(n, 42590)) || (EqualSign(n, 42594)) || (EqualSign(n, 42596)) || (EqualSign(n, 42598)) || (EqualSign(n, 42600)) || (EqualSign(n, 42602)) || (EqualSign(n, 42604)) || (EqualSign(n, 42624)) || (EqualSign(n, 42626)) || (EqualSign(n, 42628)) || (EqualSign(n, 42630)) || (EqualSign(n, 42632)) || (EqualSign(n, 42634)) || (EqualSign(n, 42636)) || (EqualSign(n, 42638)) || (EqualSign(n, 42640)) || (EqualSign(n, 42642)) || (EqualSign(n, 42644)) || (EqualSign(n, 42646)) || (EqualSign(n, 42786)) || (EqualSign(n, 42788)) || (EqualSign(n, 42790)) || (EqualSign(n, 42792)) || (EqualSign(n, 42794)) || (EqualSign(n, 42796)) || (EqualSign(n, 42798)) || (EqualSign(n, 42802)) || (EqualSign(n, 42804)) || (EqualSign(n, 42806)) || (EqualSign(n, 42808)) || (EqualSign(n, 42810)) || (EqualSign(n, 42812)) || (EqualSign(n, 42814)) || (EqualSign(n, 42816)) || (EqualSign(n, 42818)) || (EqualSign(n, 42820)) || (EqualSign(n, 42822)) || (EqualSign(n, 42824)) || (EqualSign(n, 42826)) || (EqualSign(n, 42828)) || (EqualSign(n, 42830)) || (EqualSign(n, 42832)) || (EqualSign(n, 42834)) || (EqualSign(n, 42836)) || (EqualSign(n, 42838)) || (EqualSign(n, 42840)) || (EqualSign(n, 42842)) || (EqualSign(n, 42844)) || (EqualSign(n, 42846)) || (EqualSign(n, 42848)) || (EqualSign(n, 42850)) || (EqualSign(n, 42852)) || (EqualSign(n, 42854)) || (EqualSign(n, 42856)) || (EqualSign(n, 42858)) || (EqualSign(n, 42860)) || (EqualSign(n, 42862)) || (EqualSign(n, 42873)) || (EqualSign(n, 42875)) || (LessThanEqualSign(42877, n, 42878)) || (EqualSign(n, 42880)) || (EqualSign(n, 42882)) || (EqualSign(n, 42884)) || (EqualSign(n, 42886)) || (EqualSign(n, 42891)) || (LessThanEqualSign(65313, n, 65338)) || (LessThanEqualSign(66560, n, 66599)) || (LessThanEqualSign(119808, n, 119833)) || (LessThanEqualSign(119860, n, 119885)) || (LessThanEqualSign(119912, n, 119937)) || (EqualSign(n, 119964)) || (LessThanEqualSign(119966, n, 119967)) || (EqualSign(n, 119970)) || (LessThanEqualSign(119973, n, 119974)) || (LessThanEqualSign(119977, n, 119980)) || (LessThanEqualSign(119982, n, 119989)) || (LessThanEqualSign(120016, n, 120041)) || (LessThanEqualSign(120068, n, 120069)) || (LessThanEqualSign(120071, n, 120074)) || (LessThanEqualSign(120077, n, 120084)) || (LessThanEqualSign(120086, n, 120092)) || (LessThanEqualSign(120120, n, 120121)) || (LessThanEqualSign(120123, n, 120126)) || (LessThanEqualSign(120128, n, 120132)) || (EqualSign(n, 120134)) || (LessThanEqualSign(120138, n, 120144)) || (LessThanEqualSign(120172, n, 120197)) || (LessThanEqualSign(120224, n, 120249)) || (LessThanEqualSign(120276, n, 120301)) || (LessThanEqualSign(120328, n, 120353)) || (LessThanEqualSign(120380, n, 120405)) || (LessThanEqualSign(120432, n, 120457)) || (LessThanEqualSign(120488, n, 120512)) || (LessThanEqualSign(120546, n, 120570)) || (LessThanEqualSign(120604, n, 120628)) || (LessThanEqualSign(120662, n, 120686)) || (LessThanEqualSign(120720, n, 120744)) || (EqualSign(n, 120778)));
});

function charDashVal(str) {
  this.str = str;
};
function makeDashCharDashVal(str) { return new charDashVal(str); };
function charDashValP(x) { return x instanceof charDashVal; };
function charDashValDashStr(x) { return x.str; };
function structDashVal(type, fields) {
  this.type = type;
this.fields = fields;
};
function makeDashStructDashVal(type, fields) { return new structDashVal(type, fields); };
function structDashValP(x) { return x instanceof structDashVal; };
function structDashValDashType(x) { return x.type; };
function structDashValDashFields(x) { return x.fields; };
function proc(arity, body, venv) {
  this.arity = arity;
this.body = body;
this.venv = venv;
};
function makeDashProc(arity, body, venv) { return new proc(arity, body, venv); };
function procP(x) { return x instanceof proc; };
function procDashArity(x) { return x.arity; };
function procDashBody(x) { return x.body; };
function procDashVenv(x) { return x.venv; };
function prim(name, func, inputs) {
  this.name = name;
this.func = func;
this.inputs = inputs;
};
function makeDashPrim(name, func, inputs) { return new prim(name, func, inputs); };
function primP(x) { return x instanceof prim; };
function primDashName(x) { return x.name; };
function primDashFunc(x) { return x.func; };
function primDashInputs(x) { return x.inputs; };
var liftDashStringDashRelation = (function (r) {
  return (function (c1, c2) {
  return r(charDashValDashStr(c1), charDashValDashStr(c2));
});
});

var liftDashStringDashFunction = (function (f) {
  return (function (c) {
  return f(charDashValDashStr(c));
});
});

var charDashValDashGreaterThanInteger = liftDashStringDashFunction(singletonDashStringDashCodeDashPoint);

var integerDashGreaterThanCharDashVal = (function (n) {
  return makeDashCharDashVal(integerDashGreaterThanSingletonDashString(n));
});

var charDashValDashDowncase = liftDashStringDashFunction((function (s) {
  return makeDashCharDashVal(singletonDashStringDashDowncase(s));
}));

var charDashValDashUpcase = liftDashStringDashFunction((function (s) {
  return makeDashCharDashVal(singletonDashStringDashUpcase(s));
}));

var charDashValLessThanEqualSignP = liftDashStringDashRelation(stringLessThanEqualSignP);

var charDashValLessThanP = liftDashStringDashRelation(stringLessThanP);

var charDashValEqualSignP = liftDashStringDashRelation(stringEqualSignP);

var charDashValGreaterThanEqualSignP = liftDashStringDashRelation(stringGreaterThanEqualSignP);

var charDashValGreaterThanP = liftDashStringDashRelation(stringGreaterThanP);

var charDashValDashCiLessThanEqualSignP = liftDashStringDashRelation(stringDashCiLessThanEqualSignP);

var charDashValDashCiLessThanP = liftDashStringDashRelation(stringDashCiLessThanP);

var charDashValDashCiEqualSignP = liftDashStringDashRelation(stringDashCiEqualSignP);

var charDashValDashCiGreaterThanEqualSignP = liftDashStringDashRelation(stringDashCiGreaterThanEqualSignP);

var charDashValDashCiGreaterThanP = liftDashStringDashRelation(stringDashCiGreaterThanP);

var liftDashCodeDashPredicate = (function (r) {
  return (function (c) {
  return r(singletonDashStringDashCodeDashPoint(charDashValDashStr(c)));
});
});

var charDashValDashWhitespaceP = liftDashCodeDashPredicate(intDashWhitespaceP);

var charDashValDashNumericP = liftDashCodeDashPredicate(intDashNumericP);

var charDashValDashAlphabeticP = liftDashCodeDashPredicate(intDashAlphabeticP);

var charDashValDashLowerDashCaseP = liftDashCodeDashPredicate(intDashLowerDashCaseP);

var charDashValDashUpperDashCaseP = liftDashCodeDashPredicate(intDashUpperDashCaseP);

var listDashCharDashValDashGreaterThanString = (function (cs) {
  return foldl((function (c, str) {
  return stringDashAppend(str, charDashValDashStr(c));
}), "", cs);
});

var stringDashGreaterThanCharDashValDashList = (function (s) {
  return (function () { var loop = (function (i, ls) {
  return zeroP(i) ? ls :
  loop(sub1(i), cons(makeDashCharDashVal(substring(s, sub1(i), i)), ls));
});

return loop(stringDashLength(s), []);
 })();
});

var makeDashStringDashCharDashVal = (function (n, c) {
  return (function () { var loop = (function (n, s) {
  return zeroP(n) ? s :
  loop(sub1(n), stringDashAppend(charDashValDashStr(c), s));
});

return loop(n, "");
 })();
});

var stringDashRefDashCharDashVal = (function (s, i) {
  return makeDashCharDashVal(substring(s, i, add1(i)));
});

var i = makeDashProc(1, new quote("<opaque>"), []);

var k = makeDashProc(2, new quote("<opaque>"), []);

var valDashGreaterThanString = (function (v) {
  return procP(v) ? procDashGreaterThanString(v) :
  primP(v) ? primDashGreaterThanString(v) :
  numberP(v) ? numberDashGreaterThanString(v) :
  booleanP(v) ? v ? "true" :
  "false" :
  stringP(v) ? stringDashAppend("\"", v, "\"") :
  symbolP(v) ? stringDashAppend("'", symbolDashGreaterThanString(v)) :
  consP(v) ? stringDashAppend("(list ", interpolateDashSpace(map(valDashGreaterThanString, v)), ")") :
  emptyP(v) ? "empty" :
  imgDashValP(v) ? "#(struct:object:image-snip% ... ...)" :
  format("[Val->String] Unknown Val ~a", v);
});

var typeDashAsDashString = (function (v) {
  return procP(v) ? "procedure" :
  primP(v) ? "procedure" :
  numberP(v) ? "number" :
  booleanP(v) ? "boolean" :
  stringP(v) ? "string" :
  symbolP(v) ? "symbol" :
  consP(v) ? "list" :
  emptyP(v) ? "list" :
  imgDashValP(v) ? "image" :
  format("[type-as-string] Unknown type for val: ~a", v);
});

var procDashGreaterThanString = (function (p) {
  return stringDashAppend("(lambda (", procDashVarsDashString(p), ") ...)");
});

var procDashVarsDashString = (function (p) {
  return interpolateDashSpace(buildDashList(procDashArity(p), (function (i) {
  return stringDashAppend("a", numberDashGreaterThanString(add1(i)));
})));
});

var interpolateDashSpace = (function (los) {
  return emptyP(los) ? "" :
  emptyP(rest(los)) ? first(los) :
  stringDashAppend(first(los), " ", interpolateDashSpace(rest(los)));
});

var valsDashAsDashString = (function (vals) {
  return interpolateDashSpace(map(valDashGreaterThanString, vals));
});

var primDashGreaterThanString = (function (p) {
  return symbolDashGreaterThanString(primDashName(p));
});

var errDashMsg = (function (s, msg) {
  return stringDashAppend(symbolDashGreaterThanString(s), ": ", msg);
});

var msgDashNotDashBool = (function (v) {
  return stringDashAppend("question result is not true or false: ", valDashGreaterThanString(v));
});

var msgDashNotDashProc = (function (op, args) {
  return stringDashAppend("expected procedure, given ", valDashGreaterThanString(op), "; arguments were: ", valsDashAsDashString(args));
});

var msgDashNotDashError = (function (v) {
  return stringDashAppend("expected an error, but instead recieved the value: ", valDashGreaterThanString(v));
});

var msgDashUndefn = (function (id) {
  return stringDashAppend("local variable used before its definition: ", symbolDashGreaterThanString(id));
});

var msgDashProcDashArity = (function (proc, vals) {
  return stringDashAppend("expects ", numberDashGreaterThanString(procDashArity(proc)), " argument", EqualSign(1, procDashArity(proc)) ? "" :
  "s", ", given ", numberDashGreaterThanString(length(vals)), zeroP(length(vals)) ? "" :
  ": ", valsDashAsDashString(vals));
});

var iDashNd = (function (i) {
  return EqualSign(1, i) ? "1st" :
  EqualSign(2, i) ? "2nd" :
  EqualSign(3, i) ? "3rd" :
  stringDashAppend(numberDashGreaterThanString(i), "th");
});

var msgDashType = (function (name, val, n, others) {
  return stringDashAppend("expects a ", symbolDashGreaterThanString(name), " as ", iDashNd(n), " argument, but given: ", valDashGreaterThanString(val), emptyP(others) ? "" :
  stringDashAppend("; other arguments were: ", valsDashAsDashString(others)));
});

var msgDashArityDashCommon = (function (atDashLeastP, n, vals) {
  return stringDashAppend("expects ", atDashLeastP ? "at least " :
  "", numberDashGreaterThanString(n), " argument", EqualSign(1, n) ? "" :
  "s", ", given ", numberDashGreaterThanString(length(vals)), zeroP(length(vals)) ? "" :
  ": ", valsDashAsDashString(vals));
});

var msgDashPrimDashVarDashArity = (function (n, vals) {
  return msgDashArityDashCommon(true, n, vals);
});

var msgDashPrimDashArity = (function (n, vals) {
  return msgDashArityDashCommon(false, n, vals);
});

var msgDashCondDashAllDashFalse = "all question results were false";

var msgDashListDashRef = (function (ls, i) {
  return stringDashAppend("index ", numberDashGreaterThanString(i), " too large for list: ", valDashGreaterThanString(ls));
});

var msgDashRedef = "this name was defined previously and cannot be re-defined";

var msgDashArgDashRedef = (function (id) {
  return stringDashAppend("found an argument name that is used more than once: ", symbolDashGreaterThanString(id));
});

var msgDashFieldDashRedef = (function (id) {
  return stringDashAppend("found an field name that is used more than once: ", symbolDashGreaterThanString(id));
});

var msgDashLocalDashRedef = (function (id) {
  return stringDashAppend("found a name that was defined locally more than once: ", symbolDashGreaterThanString(id));
});

var msgDashUndefDashId = (function (id) {
  return stringDashAppend("reference to undefined identifier: ", symbolDashGreaterThanString(id));
});

var msgDashRealDashProc = (function (val) {
  return stringDashAppend("expected argument of type <procedure that returns ", "real numbers>; given ", valDashGreaterThanString(val));
});

var msgDashCharDashProc = (function (p, x, i) {
  return stringDashAppend("second argument must be a <procedure> that produces a", " <char>, given ", valDashGreaterThanString(p), ", which produced ", valDashGreaterThanString(x), " for ", valDashGreaterThanString(i));
});

var msgDashIndexDashOutDashOfDashRange = (function (kind, index, left, right, val) {
  return stringDashAppend(kind, " index ", numberDashGreaterThanString(index), " out of range [", numberDashGreaterThanString(left), ", ", numberDashGreaterThanString(right), "] for ", typeDashAsDashString(val), ": ", valDashGreaterThanString(val));
});

var applyDashProc = (function (proc, vals, ret) {
  return EqualSign(procDashArity(proc), length(vals)) ? (function () { var v = procDashBody(proc)(cons(vals, procDashVenv(proc)), identity);

return errP(v) ? v :
  ret(tramp(v));
 })() :
  err(new quote("procedure"), msgDashProcDashArity(proc, vals));
});

function type(name, pred) {
  this.name = name;
this.pred = pred;
};
function makeDashType(name, pred) { return new type(name, pred); };
function typeP(x) { return x instanceof type; };
function typeDashName(x) { return x.name; };
function typeDashPred(x) { return x.pred; };
function varDashArity(types, restDashType) {
  this.types = types;
this.restDashType = restDashType;
};
function makeDashVarDashArity(types, restDashType) { return new varDashArity(types, restDashType); };
function varDashArityP(x) { return x instanceof varDashArity; };
function varDashArityDashTypes(x) { return x.types; };
function varDashArityDashRestDashType(x) { return x.restDashType; };
var extendDashType = (function (parent, name, proc) {
  return makeDashType(name, (function (x) {
  return ((typeDashPred(parent)(x)) && (proc(x)));
}));
});

var unionDashType = (function (name, lot) {
  return makeDashType(name, (function (x) {
  return ormap((function (type) {
  return typeDashPred(type)(x);
}), lot);
}));
});

var varDashArityDashMin = (function (va) {
  return length(varDashArityDashTypes(va));
});

///////////////////////////////// TYPES /////////////////////////////////////////
var anyDashType = makeDashType(new quote("any"), (function (x) {
  return true;
}));

var numberDashType = makeDashType(new quote("number"), numberP);

var booleanDashType = makeDashType(new quote("boolean"), booleanP);

var integerDashType = makeDashType(new quote("integer"), integerP);

var rationalDashType = makeDashType(new quote("rational"), (function (x) {
  return error(new quote("type"), stringDashAppend("Rational number typechecking ", "is unsupported"));
}));

var realDashType = makeDashType(new quote("real"), realP);

var symbolDashType = makeDashType(new quote("symbol"), symbolP);

var listDashType = makeDashType(new quote("list"), (function (x) {
  return ((emptyP(x)) || (consP(x)));
}));

var stringDashType = makeDashType(new quote("string"), stringP);

var pairDashType = makeDashType(new quote("pair"), consP);

var charDashType = makeDashType(new quote("char"), charDashValP);

var imageDashType = makeDashType(new quote("image"), imageP);

var positiveDashNumberDashType = extendDashType(numberDashType, new quote("positive number"), (function (x) {
  return GreaterThan(x, 0);
}));

var symbolSlashStringDashType = unionDashType(new quote("symbol or string"), [symbolDashType, stringDashType]);

var keyDashEventDashType = unionDashType(new quote("keyevent"), [symbolDashType, charDashType]);

var procDashType = makeDashType(new quote("procedure"), (function (x) {
  return ((procP(x)) || (primP(x)));
}));

var natDashType = makeDashType(new quote("non-negative-exact-integer"), (function (x) {
  return ((integerP(x)) && (GreaterThanEqualSign(x, 0)) && (not(negativeP(x))));
}));

var nonDashNegativeDashRealDashType = makeDashType(new quote("non-negative-real"), (function (x) {
  return ((realP(x)) && (not(negativeP(x))));
}));

var listDashCharDashType = makeDashType(new quote("list-of-character"), (function (x) {
  return ((emptyP(x)) || (((consP(x)) && (andmap(charDashValP, x)))));
}));

var indexable = (function (i) {
  return (function (x) {
  return emptyP(x) ? false :
  ((consP(x)) && (((zeroP(i)) || (indexable(sub1(i))(rest(x))))));
});
});

var cStarRDashAble = (function (ads) {
  return (function (x) {
  return emptyP(ads) ? true :
  ((consP(x)) && (symbolEqualSignP(new quote("a"), first(ads)) ? cStarRDashAble(rest(ads))(car(x)) :
  symbolEqualSignP(new quote("d"), first(ads)) ? cStarRDashAble(rest(ads))(cdr(x)) :
  err("cond", "all questions false")));
});
});

var cStarRDashAbleDashType = (function (ads) {
  return makeDashType(symbolDashAppend(append([new quote("c")], ads, [new quote("rable")])), cStarRDashAble(ads));
});

var indexableDashType = (function (i) {
  return makeDashType(symbolDashAppend([new quote("indexable-"), stringDashGreaterThanSymbol(numberDashGreaterThanString(i))]), indexable(i));
});

var symbolDashAppend = (function (los) {
  return stringDashGreaterThanSymbol(foldl((function (s, str) {
  return stringDashAppend(str, symbolDashGreaterThanString(s));
}), "", los));
});

var applyDashProcedure = (function (f, vs, err, ret) {
  return procP(f) ? applyDashProc(f, vs, ret) :
  primP(f) ? applyDashPrim(f, vs, err, ret) :
  err(new quote("procedure-application"), msgDashNotDashProc(f, vs));
});

var applyDashPrim = (function (prim, vals, err, ret) {
  return checkDashArity(prim, vals, err, (function (true1) {
  return checkDashTypes(prim, vals, err, (function (true2) {
  return primDashFunc(prim)(vals, err, ret);
}));
}));
});

var checkDashArity = (function (prim, vals, err, ret) {
  return (function () { var IN = primDashInputs(prim);

return varDashArityP(IN) ? LessThanEqualSign(length(varDashArityDashTypes(IN)), length(vals)) ? ret(true) :
  err(primDashName(prim), msgDashPrimDashVarDashArity(varDashArityDashMin(IN), vals)) :
  EqualSign(length(vals), length(IN)) ? ret(true) :
  err(primDashName(prim), msgDashPrimDashArity(length(IN), vals));
 })();
});

var checkDashTypes = (function (prim, vals, err, ret) {
  return (function () { var checkDashReqd = (function (types, vals, n, others) {
  return ((emptyP(types)) && (emptyP(vals))) ? ret(true) :
  emptyP(types) ? (function (_) {
  return checkDashRest(varDashArityDashRestDashType(primDashInputs(prim)), vals, n, others);
}) :
  typeDashPred(first(types))(first(vals)) ? (function (_) {
  return checkDashReqd(rest(types), rest(vals), add1(n), cons(first(vals), others));
}) :
  err(primDashName(prim), msgDashType(typeDashName(first(types)), first(vals), n, append(reverse(others), rest(vals))));
});

var checkDashRest = (function (type, vals, n, others) {
  return emptyP(vals) ? ret(true) :
  typeDashPred(type)(first(vals)) ? (function (_) {
  return checkDashRest(type, rest(vals), add1(n), cons(first(vals), others));
}) :
  err(primDashName(prim), msgDashType(typeDashName(type), first(vals), n, append(reverse(others), rest(vals))));
});

return checkDashReqd(primDashReqdDashTypes(prim), vals, 1, []);
 })();
});

var defDashStructDashPred = (function (d) {
  return symbolDashAppend([d.name, new quote("?")]);
});

var defDashStructDashCons = (function (d) {
  return symbolDashAppend([new quote("make-"), d.name]);
});

var defDashStructDashAcc = (function (d, fld) {
  return symbolDashAppend([d.name, new quote("-"), fld]);
});

var makeDashConsDashPrim = (function (id, d) {
  return makeDashPrim(defDashStructDashCons(d), (function (xs, err, ret) {
  return ret(makeDashStructDashVal(id, xs));
}), map((function (x) {
  return anyDashType;
}), d.fields));
});

var makeDashPredDashPrim = (function (id, d) {
  return makeDashPrim(defDashStructDashPred(d), (function (xs, err, ret) {
  return ret(((structDashValP(first(xs))) && (eqP(structDashValDashType(first(xs)), id))));
}), [anyDashType]);
});

var makeDashAccDashPrim = (function (id, d, i) {
  return makeDashPrim(defDashStructDashAcc(d, listDashRef(d.fields, i)), (function (xs, err, ret) {
  return ret(listDashRef(structDashValDashFields(first(xs)), i));
}), [makeDashType(symbolDashAppend([new quote("struct:"), d.name]), (function (x) {
  return ((structDashValP(x)) && (eqP(structDashValDashType(x), id)));
}))]);
});

var buildDashStructDashVframe = (function (d) {
  return (function () { var id = [d.name];

return append([makeDashConsDashPrim(id, d), makeDashPredDashPrim(id, d)], buildDashAccDashVbindings(id, d, makeDashAccDashPrim));
 })();
});

var buildDashAccDashVbindings = (function (id, d, makeDashAcc) {
  return (function () { var loop = (function (flds, i, a) {
  return emptyP(flds) ? a :
  loop(rest(flds), add1(i), cons(makeDashAcc(id, d, i), a));
});

return reverse(loop(d.fields, 0, []));
 })();
});

var buildDashStructDashNframe = (function (d) {
  return (function () { var id = [d.name];

return append([defDashStructDashCons(d), defDashStructDashPred(d)], map((function (f) {
  return symbolDashAppend([d.name, new quote("-"), f]);
}), d.fields));
 })();
});

var bindDashStructB = (function (def, env) {
  return (function () { var id = [def.name];

return (function () { var DO = bindDashReplaceB(defDashStructDashCons(def), makeDashConsDashPrim(id, def), env);

var do2 = bindDashReplaceB(defDashStructDashPred(def), makeDashPredDashPrim(id, def), env);

var do3 = map((function (pair) {
  return bindDashReplaceB(first(pair), second(pair), env);
}), makeDashAccDashBindings(id, def, makeDashAccDashPrim));

return env;
 })();
 })();
});

var makeDashAccDashBindings = (function (id, d, makeDashAcc) {
  return (function () { var loop = (function (flds, i, a) {
  return emptyP(flds) ? a :
  loop(rest(flds), add1(i), cons([defDashStructDashAcc(d, first(flds)), makeDashAcc(id, d, i)], a));
});

return loop(d.fields, 0, []);
 })();
});

var lookupDashPrim = (function (name) {
  return (function () { var lookupDashTable = (function (table) {
  return emptyP(table) ? error(new quote("lookup-prim"), symbolDashGreaterThanString(name)) :
  symbolEqualSignP(name, primDashName(first(table))) ? first(table) :
  lookupDashTable(rest(table));
});

return lookupDashTable(primDashTable);
 })();
});

var primDashReqdDashTypes = (function (prim) {
  return (function () { var IN = primDashInputs(prim);

return varDashArityP(IN) ? varDashArityDashTypes(IN) :
  IN;
 })();
});

var primDashNameP = (function (x) {
  return ((symbolP(x)) && (ormap((function (p) {
  return eqP(x, primDashName(p));
}), primDashTable)));
});

var joinDashArgs = (function (f, xs, err, ret) {
  return (function () { var loop = (function (xs, ls, i, k) {
  return emptyP(rest(xs)) ? (function () { var t = first(xs);

return ((emptyP(t)) || (consP(t))) ? applyDashProcedure(f, append(reverse(ls), t), err, k) :
  err(new quote("apply"), msgDashType(new quote("proper-list"), t, i, cons(f, reverse(ls))));
 })() :
  loop(rest(xs), cons(first(xs), ls), add1(i), k);
});

return loop(xs, [], 2, ret);
 })();
});

var checkDashRange = (function (start, end, i, type, val, err, k) {
  return ((LessThan(i, start)) || (GreaterThan(i, end))) ? err(new quote("substring"), msgDashIndexDashOutDashOfDashRange(type, i, start, end, val)) :
  k(true);
});

var primColonApply = (function (xs, err, ret) {
  return joinDashArgs(first(xs), rest(xs), err, ret);
});

var primColonAndmap = (function (xs, err, ret) {
  return (function () { var p = first(xs);

return (function () { var loop = (function (ls, k) {
  return emptyP(ls) ? k(true) :
  applyDashProcedure(p, [first(ls)], err, (function (v) {
  return booleanP(v) ? v ? loop(rest(ls), k) :
  k(false) :
  err(new quote("andmap"), "not a boolean");
}));
});

return loop(second(xs), ret);
 })();
 })();
});

var primColonFoldl = (function (xs, err, ret) {
  return (function () { var fold = (function (p, b, ls, k) {
  return emptyP(ls) ? k(b) :
  applyDashProcedure(p, [first(ls), b], err, (function (bStar) {
  return fold(p, bStar, rest(ls), k);
}));
});

return fold(first(xs), second(xs), third(xs), ret);
 })();
});

var primColonFoldr = (function (xs, err, ret) {
  return (function () { var fold = (function (p, b, ls, k) {
  return emptyP(ls) ? k(b) :
  fold(p, b, rest(ls), (function (rst) {
  return applyDashProcedure(p, [first(ls), rst], err, k);
}));
});

return fold(first(xs), second(xs), third(xs), ret);
 })();
});

var primColonMap = (function (xs, err, ret) {
  return (function () { var myDashMap = (function (p, lists, k) {
  return emptyP(first(lists)) ? k([]) :
  applyDashProcedure(p, map(first, lists), err, (function (x) {
  return myDashMap(p, map(rest, lists), (function (xs) {
  return k(cons(x, xs));
}));
}));
});

return myDashMap(first(xs), rest(xs), ret);
 })();
});

var primColonOrmap = (function (xs, err, ret) {
  return (function () { var p = first(xs);

return (function () { var loop = (function (ls, k) {
  return emptyP(ls) ? k(false) :
  applyDashProcedure(p, [first(ls)], err, (function (v) {
  return booleanP(v) ? v ? k(true) :
  loop(rest(ls), k) :
  err(new quote("ormap"), "not a boolean");
}));
});

return loop(second(xs), ret);
 })();
 })();
});

var primColonFilter = (function (xs, err, ret) {
  return (function () { var p = first(xs);

var ls = second(xs);

return foldrDashCps((function (x, xs, k) {
  return applyDashProcedure(p, [x], err, (function (b) {
  return k(falseP(b) ? xs :
  cons(x, xs));
}));
}), [], ls, ret);
 })();
});

var primColonBuildDashList = (function (xs, err, ret) {
  return (function () { var myDashBuildDashList = (function (i, p, k) {
  return GreaterThanEqualSign(i, first(xs)) ? k([]) :
  applyDashProcedure(p, [i], err, (function (x) {
  return myDashBuildDashList(add1(i), p, (function (xs) {
  return k(cons(x, xs));
}));
}));
});

return myDashBuildDashList(0, second(xs), ret);
 })();
});

var primColonBuildDashString = (function (xs, err, ret) {
  return (function () { var myDashBuildDashString = (function (i, p, k) {
  return GreaterThanEqualSign(i, first(xs)) ? k("") :
  applyDashProcedure(p, [i], err, (function (x) {
  return charDashValP(x) ? myDashBuildDashString(add1(i), p, (function (xs) {
  return k(stringDashAppend(charDashValDashStr(x), xs));
})) :
  err(new quote("build-string"), msgDashCharDashProc(p, x, i));
}));
});

return myDashBuildDashString(0, second(xs), ret);
 })();
});

var primColonArgmax = (function (xs, err, ret) {
  return (function () { var myDashArgmax = (function (p, ls, k) {
  return applyDashProcedure(p, [first(ls)], err, (function (x) {
  return realP(x) ? myDashArgmaxStar(p, rest(ls), [x, first(ls)], (function (x) {
  return k(second(x));
})) :
  err(new quote("argmax"), msgDashRealDashProc(p));
}));
});

var myDashArgmaxStar = (function (p, ls, acc, k) {
  return emptyP(ls) ? k(acc) :
  applyDashProcedure(p, [first(ls)], err, (function (x) {
  return realP(x) ? myDashArgmaxStar(p, rest(ls), GreaterThan(x, first(acc)) ? [x, first(ls)] :
  acc, k) :
  err(new quote("argmax"), msgDashRealDashProc(p));
}));
});

return consP(second(xs)) ? myDashArgmax(first(xs), second(xs), ret) :
  err(new quote("argmax"), format("expected argument of type <non-empty list>; given ~a", second(xs)));
 })();
});

var primColonArgmin = (function (xs, err, ret) {
  return (function () { var myDashArgmin = (function (p, ls, k) {
  return applyDashProcedure(p, [first(ls)], err, (function (x) {
  return realP(x) ? myDashArgminStar(p, rest(ls), [x, first(ls)], (function (x) {
  return k(second(x));
})) :
  err(new quote("argmax"), msgDashRealDashProc(p));
}));
});

var myDashArgminStar = (function (p, ls, acc, k) {
  return emptyP(ls) ? k(acc) :
  applyDashProcedure(p, [first(ls)], err, (function (x) {
  return realP(x) ? myDashArgminStar(p, rest(ls), LessThan(x, first(acc)) ? [x, first(ls)] :
  acc, k) :
  err(new quote("argmax"), msgDashRealDashProc(p));
}));
});

return consP(second(xs)) ? myDashArgmin(first(xs), second(xs), ret) :
  err(new quote("argmin"), format("expected argument of type <non-empty list>; given ~a", second(xs)));
 })();
});

var primColonCompose = (function (xs, err, ret) {
  return composeDashInputs(xs, err, (function (inputs) {
  return ret(makeDashPrim(new quote("#<procedure>"), composeDashProcs(xs), inputs));
}));
});

var composeDashInputs = (function (procs, err, k) {
  return (function () { var head = first(reverse(procs));

return procP(head) ? k(buildDashList(procDashArity(head), (function (x) {
  return anyDashType;
}))) :
  primP(head) ? k(primDashInputs(head)) :
  err("cond", "all questions false");
 })();
});

var composeDashProcs = (function (procs) {
  return (function (xs, err, ret) {
  return (function () { var loop = (function (procs, inputs, k) {
  return emptyP(procs) ? k(first(inputs)) :
  applyDashProcedure(first(procs), inputs, err, (function (output) {
  return loop(rest(procs), [output], k);
}));
});

return loop(reverse(procs), xs, ret);
 })();
});
});

var primColonForDashEach = (function (xs, err, ret) {
  return primColonMap(xs, err, (function (v) {
  return ret(forDashEach(add1, []));
}));
});

var primColonMemf = (function (xs, err, ret) {
  return (function () { var myDashMemf = (function (proc, ls, k) {
  return emptyP(ls) ? k(false) :
  applyDashProcedure(proc, [first(ls)], err, (function (bool) {
  return falseP(bool) ? myDashMemf(proc, rest(ls), k) :
  k(ls);
}));
});

return myDashMemf(first(xs), second(xs), ret);
 })();
});

var primColonQuicksort = (function (xs, err, ret) {
  return (function () { var myDashQuicksort = (function (ls, proc, k) {
  return LessThanEqualSign(length(ls), 1) ? k(ls) :
  (function () { var pivot = first(ls);

return filterDashCps((function (x, k) {
  return applyDashProcedure(proc, [x, pivot], err, k);
}), rest(ls), (function (lowers) {
  return filterDashCps((function (x, k) {
  return applyDashProcedure(proc, [x, pivot], err, (function (y) {
  return k(falseP(y));
}));
}), rest(ls), (function (uppers) {
  return myDashQuicksort(lowers, proc, (function (sortedDashLowers) {
  return myDashQuicksort(uppers, proc, (function (sortedDashUppers) {
  return k(append(sortedDashLowers, [pivot], sortedDashUppers));
}));
}));
}));
}));
 })();
});

return myDashQuicksort(first(xs), second(xs), ret);
 })();
});

var primColonDash = (function (xs, err, ret) {
  return ret(emptyP(rest(xs)) ? times(-1, first(xs)) :
  foldl((function (x, y) {
  return minus(y, x);
}), first(xs), rest(xs)));
});

var primColonSlash = (function (xs, err, ret) {
  return ormap(zeroP, rest(xs)) ? err(new quote("/"), "division by zero") :
  ret(foldl((function (x, y) {
  return divide(y, x);
}), first(xs), rest(xs)));
});

var primColonEqualP = (function (xs, err, ret) {
  return ret(equalDashRecP(first(xs), second(xs), EqualSign));
});

var primColonEqualTildeP = (function (xs, err, ret) {
  return ret(equalDashRecP(first(xs), second(xs), (function (x1, x2) {
  return EqualSignTilde(x1, x2, third(xs));
})));
});

var equalDashRecP = (function (x1, x2, numberDashProc) {
  return (function () { var andmapStar = (function (p, ls1, ls2) {
  return emptyP(ls1) ? true :
  falseP(p(first(ls1), first(ls2))) ? false :
  andmapStar(p, rest(ls1), rest(ls2));
});

return ((eqP(x1, x2)) || (numberP(x1) ? ((numberP(x2)) && (numberDashProc(x1, x2))) :
  stringP(x1) ? ((stringP(x2)) && (stringEqualSignP(x1, x2))) :
  booleanP(x1) ? ((booleanP(x2)) && (booleanEqualSignP(x1, x2))) :
  charDashValP(x1) ? ((charDashValP(x2)) && (charDashValEqualSignP(x1, x2))) :
  emptyP(x1) ? emptyP(x2) :
  consP(x1) ? ((consP(x2)) && (EqualSign(length(x1), length(x2))) && (andmapStar((function (x, y) {
  return equalDashRecP(x, y, numberDashProc);
}), x1, x2))) :
  structDashValP(x1) ? ((structDashValP(x2)) && (eqP(structDashValDashType(x1), structDashValDashType(x2))) && (andmapStar((function (x, y) {
  return equalDashRecP(x, y, numberDashProc);
}), structDashValDashFields(x1), structDashValDashFields(x2)))) :
  imgDashValP(x1) ? ((imgDashValP(x2)) && (stringEqualSignP(imgDashValDashEncoding(x1), imgDashValDashEncoding(x2)))) :
  false));
 })();
});

var primColonExit = (function (xs, err, ret) {
  return exit();
});

var primColonSubstring = (function (xs, err, ret) {
  return (function () { var str = first(xs);

var i = second(xs);

var j = third(xs);

var end = stringDashLength(str);

return checkDashRange(0, end, i, "starting", str, err, (function (t1) {
  return checkDashRange(i, end, j, "ending", str, err, (function (t2) {
  return ret(substring(str, i, j));
}));
}));
 })();
});

var primColonStringDashRefDashCharDashVal = (function (xs, err, ret) {
  return (function () { var str = first(xs);

var i = second(xs);

return checkDashRange(0, sub1(stringDashLength(str)), i, "", str, err, (function (t) {
  return ret(stringDashRefDashCharDashVal(str, i));
}));
 })();
});

var primColonListDashRef = (function (xs, err, ret) {
  return (function () { var ls = first(xs);

var i = second(xs);

return checkDashRange(0, sub1(length(ls)), i, "", ls, err, (function (t) {
  return ret(listDashRef(ls, i));
}));
 })();
});

var primColonListStar = (function (xs, err, ret) {
  return (function () { var revDashXs = reverse(xs);

var tail = first(revDashXs);

var args = reverse(rest(revDashXs));

return ((consP(tail)) || (emptyP(tail))) ? ret(foldr(cons, tail, args)) :
  err(new quote("list*"), msgDashType(new quote("list"), tail, length(args), args));
 })();
});

var primColonImageEqualSignP = (function (xs, err, ret) {
  return (function () { var i1 = first(xs);

var i2 = second(xs);

return ((imgDashValP(i1)) && (imgDashValP(i2)) && (stringEqualSignP(imgDashValDashEncoding(i1), imgDashValDashEncoding(i2))));
 })();
});

var idColonPosn = [new quote("posn")];

var structColonPosn = makeDashDefDashStruct(new quote("posn"), [new quote("x"), new quote("y")]);

var notDashImplemented = (function (name) {
  return (function (xs, err, ret) {
  return err(name, "not implemented");
});
});

var mkDashPrim = (function (n, f, i) {
  return makeDashPrim(n, (function (xs, err, ret) {
  return ret(apply(f, xs));
}), i);
});

var mkDashPrim0 = (function (n, f, i) {
  return makeDashPrim(n, (function (xs, err, ret) {
  return ret(f());
}), i);
});

var mkDashPrim1 = (function (n, f, i) {
  return makeDashPrim(n, (function (xs, err, ret) {
  return ret(f(first(xs)));
}), i);
});

var mkDashPrim2 = (function (n, f, i) {
  return makeDashPrim(n, (function (xs, err, ret) {
  return ret(f(first(xs), second(xs)));
}), i);
});

var mkDashPrim3 = (function (n, f, i) {
  return makeDashPrim(n, (function (xs, err, ret) {
  return ret(f(first(xs), second(xs), third(xs)));
}), i);
});

var mkDashPrim4 = (function (n, f, i) {
  return makeDashPrim(n, (function (xs, err, ret) {
  return ret(f(first(xs), second(xs), third(xs), fourth(xs)));
}), i);
});

var mkDashPrim5 = (function (n, f, i) {
  return makeDashPrim(n, (function (xs, err, ret) {
  return ret(f(first(xs), second(xs), third(xs), fourth(xs), fifth(xs)));
}), i);
});

var mkDashPrim6 = (function (n, f, i) {
  return makeDashPrim(n, (function (xs, err, ret) {
  return ret(f(first(xs), second(xs), third(xs), fourth(xs), fifth(xs), sixth(xs)));
}), i);
});

var liftDashOrder = (function (f) {
  return (function (xs, err, ret) {
  return ret((function () { var loop = (function (x, xs) {
  return emptyP(xs) ? true :
  ((f(x, first(xs))) && (loop(first(xs), rest(xs))));
});

return loop(first(xs), rest(xs));
 })());
});
});

var idColonColor = [new quote("color")];

var structColonColor = makeDashDefDashStruct(new quote("color"), [new quote("red"), new quote("green"), new quote("blue")]);

var primColonOverlaySlashXy = (function (i1, dx, dy, i2) {
  return overlay(i1, moveDashPinhole(i2, minus(dx), minus(dy)));
});

var primDashTable = [makeDashPrim(new quote("*"), (function (xs, err, ret) {
  return ret(foldl(times, 1, xs));
}), makeDashVarDashArity([numberDashType, numberDashType], numberDashType)), makeDashPrim(new quote("+"), (function (xs, err, ret) {
  return ret(foldl(plus, 0, xs));
}), makeDashVarDashArity([numberDashType, numberDashType], numberDashType)), makeDashPrim(new quote("-"), primColonDash, makeDashVarDashArity([numberDashType], numberDashType)), makeDashPrim(new quote("/"), primColonSlash, makeDashVarDashArity([numberDashType, numberDashType], numberDashType)), makeDashPrim(new quote("<"), liftDashOrder(LessThan), makeDashVarDashArity([numberDashType, numberDashType], numberDashType)), makeDashPrim(new quote("<="), liftDashOrder(LessThanEqualSign), makeDashVarDashArity([numberDashType, numberDashType], numberDashType)), makeDashPrim(new quote("="), liftDashOrder(EqualSign), makeDashVarDashArity([numberDashType, numberDashType], numberDashType)), makeDashPrim(new quote(">"), liftDashOrder(GreaterThan), makeDashVarDashArity([numberDashType, numberDashType], numberDashType)), makeDashPrim(new quote(">="), liftDashOrder(GreaterThanEqualSign), makeDashVarDashArity([numberDashType, numberDashType], numberDashType)), mkDashPrim1(new quote("abs"), abs, [numberDashType]), mkDashPrim1(new quote("acos"), acos, [extendDashType(numberDashType, new quote("number on the range [-1,1]"), (function (x) {
  return ((GreaterThanEqualSign(x, -1)) && (LessThanEqualSign(x, 1)));
}))]), mkDashPrim1(new quote("add1"), add1, [numberDashType]), makeDashPrim(new quote("angle"), notDashImplemented(new quote("angle")), [numberDashType]), mkDashPrim1(new quote("asin"), asin, [extendDashType(numberDashType, new quote("number on the range [-1,1]"), (function (x) {
  return ((GreaterThanEqualSign(x, -1)) && (LessThanEqualSign(x, 1)));
}))]), mkDashPrim1(new quote("atan"), atan, [numberDashType]), mkDashPrim1(new quote("ceiling"), ceiling, [numberDashType]), makeDashPrim(new quote("complex?"), notDashImplemented(new quote("complex?")), [anyDashType]), makeDashPrim(new quote("conjugate"), notDashImplemented(new quote("conjugate")), [numberDashType]), mkDashPrim1(new quote("cos"), cos, [numberDashType]), mkDashPrim1(new quote("cosh"), cosh, [numberDashType]), mkDashPrim0(new quote("current-seconds"), currentDashSeconds, []), makeDashPrim(new quote("denominator"), notDashImplemented(new quote("denominator")), [rationalDashType]), mkDashPrim1(new quote("even?"), evenP, [numberDashType]), makeDashPrim(new quote("exact->inexact"), notDashImplemented(new quote("exact->inexact")), [numberDashType]), makeDashPrim(new quote("exact?"), notDashImplemented(new quote("exact?")), [anyDashType]), mkDashPrim1(new quote("exp"), exp, [numberDashType]), mkDashPrim2(new quote("expt"), expt, [numberDashType, numberDashType]), mkDashPrim1(new quote("floor"), floor, [numberDashType]), makeDashPrim(new quote("gcd"), (function (xs, err, ret) {
  return ret(foldl(lcm, 1, xs));
}), makeDashVarDashArity([], numberDashType)), makeDashPrim(new quote("imag-part"), notDashImplemented(new quote("imag-part")), [numberDashType]), makeDashPrim(new quote("inexact->exact"), notDashImplemented(new quote("inexact->exact")), [numberDashType]), makeDashPrim(new quote("inexact?"), notDashImplemented(new quote("inexact?")), [numberDashType]), mkDashPrim1(new quote("integer->char"), integerDashGreaterThanCharDashVal, [makeDashType(new quote("integer-in-0-x10ffff-not-in-xd800-xdfff"), (function (x) {
  return ((integerP(x)) && (LessThanEqualSign(0, x, 1114111)) && (not(LessThanEqualSign(55296, x, 57343))));
}))]), mkDashPrim1(new quote("integer?"), integerP, [anyDashType]), makeDashPrim(new quote("lcm"), (function (xs, err, ret) {
  return ret(foldl(lcm, 1, xs));
}), makeDashVarDashArity([], numberDashType)), mkDashPrim1(new quote("log"), log, [numberDashType]), makeDashPrim(new quote("magnitude"), notDashImplemented(new quote("magnitude")), [numberDashType]), makeDashPrim(new quote("make-polar"), notDashImplemented(new quote("make-polar")), [realDashType, realDashType]), makeDashPrim(new quote("max"), (function (xs, err, ret) {
  return ret(foldl(max, first(xs), rest(xs)));
}), makeDashVarDashArity([realDashType], realDashType)), makeDashPrim(new quote("min"), (function (xs, err, ret) {
  return ret(foldl(min, first(xs), rest(xs)));
}), makeDashVarDashArity([realDashType], realDashType)), mkDashPrim2(new quote("modulo"), modulo, [numberDashType, extendDashType(numberDashType, new quote("non-zero integer"), (function (x) {
  return not(zeroP(x));
}))]), mkDashPrim1(new quote("negative?"), negativeP, [realDashType]), mkDashPrim1(new quote("number->string"), numberDashGreaterThanString, [numberDashType]), mkDashPrim1(new quote("number?"), numberP, [anyDashType]), makeDashPrim(new quote("numerator"), notDashImplemented(new quote("numerator")), [rationalDashType]), mkDashPrim1(new quote("odd?"), oddP, [numberDashType]), mkDashPrim1(new quote("positive?"), positiveP, [realDashType]), mkDashPrim2(new quote("quotient"), quotient, [numberDashType, extendDashType(numberDashType, new quote("non-zero integer"), (function (x) {
  return not(zeroP(x));
}))]), mkDashPrim1(new quote("random"), random, [numberDashType]), makeDashPrim(new quote("rational?"), notDashImplemented(new quote("rational?")), [anyDashType]), mkDashPrim1(new quote("real?"), realP, [anyDashType]), mkDashPrim2(new quote("remainder"), remainder, [numberDashType, extendDashType(numberDashType, new quote("non-zero integer"), (function (x) {
  return not(zeroP(x));
}))]), mkDashPrim1(new quote("round"), round, [realDashType]), mkDashPrim1(new quote("sgn"), sgn, [realDashType]), mkDashPrim1(new quote("sin"), sin, [numberDashType]), mkDashPrim1(new quote("sinh"), sinh, [numberDashType]), mkDashPrim1(new quote("sqr"), sqr, [numberDashType]), mkDashPrim1(new quote("sqrt"), sqrt, [extendDashType(numberDashType, new quote("positive integer"), (function (x) {
  return GreaterThanEqualSign(x, 0);
}))]), mkDashPrim1(new quote("sub1"), sub1, [numberDashType]), mkDashPrim1(new quote("tan"), tan, [numberDashType]), mkDashPrim1(new quote("zero?"), zeroP, [realDashType]), mkDashPrim2(new quote("boolean=?"), booleanEqualSignP, [booleanDashType, booleanDashType]), mkDashPrim1(new quote("boolean?"), booleanP, [anyDashType]), mkDashPrim1(new quote("false?"), falseP, [anyDashType]), mkDashPrim1(new quote("not"), not, [booleanDashType]), mkDashPrim1(new quote("symbol->string"), symbolDashGreaterThanString, [symbolDashType]), mkDashPrim2(new quote("symbol=?"), symbolEqualSignP, [symbolDashType, symbolDashType]), mkDashPrim1(new quote("symbol?"), symbolP, [anyDashType]), makeDashPrim(new quote("append"), (function (xs, err, ret) {
  return ret(foldr(append, [], xs));
}), makeDashVarDashArity([listDashType, listDashType], listDashType)), mkDashPrim2(new quote("assq"), assq, [anyDashType, listDashType]), mkDashPrim1(new quote("car"), car, [pairDashType]), mkDashPrim1(new quote("cdr"), cdr, [pairDashType]), mkDashPrim1(new quote("caar"), caar, cStarRDashAbleDashType([new quote("a"), new quote("a")])), mkDashPrim1(new quote("cadr"), cadr, cStarRDashAbleDashType([new quote("a"), new quote("d")])), mkDashPrim1(new quote("cdar"), cdar, cStarRDashAbleDashType([new quote("d"), new quote("a")])), mkDashPrim1(new quote("cddr"), cddr, cStarRDashAbleDashType([new quote("d"), new quote("d")])), mkDashPrim1(new quote("caaar"), caaar, cStarRDashAbleDashType([new quote("a"), new quote("a"), new quote("a")])), mkDashPrim1(new quote("caadr"), caadr, cStarRDashAbleDashType([new quote("a"), new quote("a"), new quote("d")])), mkDashPrim1(new quote("cadar"), cadar, cStarRDashAbleDashType([new quote("a"), new quote("d"), new quote("a")])), mkDashPrim1(new quote("caddr"), caddr, cStarRDashAbleDashType([new quote("a"), new quote("d"), new quote("d")])), mkDashPrim1(new quote("cdaar"), cdaar, cStarRDashAbleDashType([new quote("d"), new quote("a"), new quote("a")])), mkDashPrim1(new quote("cdadr"), cdadr, cStarRDashAbleDashType([new quote("d"), new quote("a"), new quote("d")])), mkDashPrim1(new quote("cddar"), cddar, cStarRDashAbleDashType([new quote("d"), new quote("d"), new quote("a")])), mkDashPrim1(new quote("cdddr"), cdddr, cStarRDashAbleDashType([new quote("d"), new quote("d"), new quote("d")])), mkDashPrim2(new quote("cons"), cons, [anyDashType, listDashType]), mkDashPrim1(new quote("cons?"), consP, [anyDashType]), mkDashPrim1(new quote("eighth"), eighth, [indexableDashType(7)]), mkDashPrim1(new quote("empty?"), emptyP, [anyDashType]), mkDashPrim1(new quote("fifth"), fifth, [indexableDashType(4)]), mkDashPrim1(new quote("first"), first, [pairDashType]), mkDashPrim1(new quote("fourth"), fourth, [indexableDashType(3)]), mkDashPrim1(new quote("length"), length, [listDashType]), makeDashPrim(new quote("list"), (function (xs, err, ret) {
  return ret(xs);
}), makeDashVarDashArity([], anyDashType)), mkDashPrim(new quote("list*"), primColonListStar, makeDashVarDashArity([], anyDashType)), makeDashPrim(new quote("list-ref"), primColonListDashRef, [listDashType, natDashType]), mkDashPrim2(new quote("member"), member, [anyDashType, listDashType]), mkDashPrim2(new quote("memq"), memq, [anyDashType, listDashType]), mkDashPrim2(new quote("memv"), memv, [anyDashType, listDashType]), mkDashPrim1(new quote("null?"), nullP, [anyDashType]), mkDashPrim1(new quote("rest"), rest, [pairDashType]), mkDashPrim1(new quote("reverse"), reverse, [listDashType]), mkDashPrim1(new quote("second"), second, [indexableDashType(1)]), mkDashPrim1(new quote("seventh"), seventh, [indexableDashType(6)]), mkDashPrim1(new quote("sixth"), sixth, [indexableDashType(5)]), mkDashPrim1(new quote("third"), third, [indexableDashType(2)]), makeDashConsDashPrim(idColonPosn, structColonPosn), makeDashPredDashPrim(idColonPosn, structColonPosn), makeDashAccDashPrim(idColonPosn, structColonPosn, 0), makeDashAccDashPrim(idColonPosn, structColonPosn, 1), mkDashPrim1(new quote("char->integer"), charDashValDashGreaterThanInteger, [charDashType]), mkDashPrim1(new quote("char-alphabetic?"), charDashValDashAlphabeticP, [charDashType]), makeDashPrim(new quote("char-ci<=?"), liftDashOrder(charDashValDashCiLessThanEqualSignP), makeDashVarDashArity([charDashType, charDashType], charDashType)), makeDashPrim(new quote("char-ci<?"), liftDashOrder(charDashValDashCiLessThanP), makeDashVarDashArity([charDashType, charDashType], charDashType)), makeDashPrim(new quote("char-ci=?"), liftDashOrder(charDashValDashCiEqualSignP), makeDashVarDashArity([charDashType, charDashType], charDashType)), makeDashPrim(new quote("char-ci>=?"), liftDashOrder(charDashValDashCiGreaterThanEqualSignP), makeDashVarDashArity([charDashType, charDashType], charDashType)), makeDashPrim(new quote("char-ci>?"), liftDashOrder(charDashValDashCiGreaterThanP), makeDashVarDashArity([charDashType, charDashType], charDashType)), mkDashPrim1(new quote("char-downcase"), charDashValDashDowncase, [charDashType]), mkDashPrim1(new quote("char-lower-case?"), charDashValDashLowerDashCaseP, [charDashType]), mkDashPrim1(new quote("char-numeric?"), charDashValDashNumericP, [charDashType]), mkDashPrim1(new quote("char-upcase"), charDashValDashUpcase, [charDashType]), mkDashPrim1(new quote("char-upper-case?"), charDashValDashUpperDashCaseP, [charDashType]), mkDashPrim1(new quote("char-whitespace?"), charDashValDashWhitespaceP, [charDashType]), makeDashPrim(new quote("char<=?"), liftDashOrder(charDashValLessThanEqualSignP), makeDashVarDashArity([charDashType, charDashType], charDashType)), makeDashPrim(new quote("char<?"), liftDashOrder(charDashValLessThanP), makeDashVarDashArity([charDashType, charDashType], charDashType)), makeDashPrim(new quote("char=?"), liftDashOrder(charDashValEqualSignP), makeDashVarDashArity([charDashType, charDashType], charDashType)), makeDashPrim(new quote("char>=?"), liftDashOrder(charDashValGreaterThanEqualSignP), makeDashVarDashArity([charDashType, charDashType], charDashType)), makeDashPrim(new quote("char>?"), liftDashOrder(charDashValGreaterThanP), makeDashVarDashArity([charDashType, charDashType], charDashType)), mkDashPrim1(new quote("char?"), charDashValP, [anyDashType]), mkDashPrim(new quote("format"), format, makeDashVarDashArity([stringDashType], anyDashType)), mkDashPrim1(new quote("list->string"), listDashCharDashValDashGreaterThanString, [listDashCharDashType]), mkDashPrim2(new quote("make-string"), makeDashStringDashCharDashVal, [natDashType, charDashType]), makeDashPrim(new quote("string"), (function (xs, err, ret) {
  return ret(listDashCharDashValDashGreaterThanString(xs));
}), makeDashVarDashArity([], charDashType)), mkDashPrim1(new quote("string->list"), stringDashGreaterThanCharDashValDashList, [stringDashType]), mkDashPrim1(new quote("string->number"), stringDashGreaterThanNumber, [stringDashType]), mkDashPrim1(new quote("string->symbol"), stringDashGreaterThanSymbol, [stringDashType]), makeDashPrim(new quote("string-append"), (function (xs, err, ret) {
  return ret(foldr(stringDashAppend, "", xs));
}), makeDashVarDashArity([], stringDashType)), makeDashPrim(new quote("string-ci<=?"), liftDashOrder(stringDashCiLessThanEqualSignP), makeDashVarDashArity([stringDashType, stringDashType], stringDashType)), makeDashPrim(new quote("string-ci<?"), liftDashOrder(stringDashCiLessThanP), makeDashVarDashArity([stringDashType, stringDashType], stringDashType)), makeDashPrim(new quote("string-ci=?"), liftDashOrder(stringDashCiEqualSignP), makeDashVarDashArity([stringDashType, stringDashType], stringDashType)), makeDashPrim(new quote("string-ci>=?"), liftDashOrder(stringDashCiGreaterThanEqualSignP), makeDashVarDashArity([stringDashType, stringDashType], stringDashType)), makeDashPrim(new quote("string-ci>?"), liftDashOrder(stringDashCiGreaterThanP), makeDashVarDashArity([stringDashType, stringDashType], stringDashType)), mkDashPrim1(new quote("string-copy"), identity, [stringDashType]), mkDashPrim1(new quote("string-length"), stringDashLength, [stringDashType]), makeDashPrim(new quote("string-ref"), primColonStringDashRefDashCharDashVal, [stringDashType, natDashType]), makeDashPrim(new quote("string<=?"), liftDashOrder(stringLessThanEqualSignP), makeDashVarDashArity([stringDashType, stringDashType], stringDashType)), makeDashPrim(new quote("string<?"), liftDashOrder(stringLessThanP), makeDashVarDashArity([stringDashType, stringDashType], stringDashType)), makeDashPrim(new quote("string=?"), liftDashOrder(stringEqualSignP), makeDashVarDashArity([stringDashType, stringDashType], stringDashType)), makeDashPrim(new quote("string>=?"), liftDashOrder(stringGreaterThanEqualSignP), makeDashVarDashArity([stringDashType, stringDashType], stringDashType)), makeDashPrim(new quote("string>?"), liftDashOrder(stringGreaterThanP), makeDashVarDashArity([stringDashType, stringDashType], stringDashType)), mkDashPrim1(new quote("string?"), string, [anyDashType]), makeDashPrim(new quote("substring"), primColonSubstring, [stringDashType, natDashType, natDashType]), makeDashPrim(new quote("image=?"), primColonImageEqualSignP, [imageDashType, imageDashType]), mkDashPrim1(new quote("image?"), imgDashValP, [anyDashType]), mkDashPrim3(new quote("=~"), (function (x, y, z) {
  return LessThanEqualSign(abs(minus(x, y)), z);
}), [realDashType, realDashType, nonDashNegativeDashRealDashType]), makeDashPrim(new quote("eof-object?"), notDashImplemented(new quote("eof-object?")), [anyDashType]), mkDashPrim2(new quote("eq?"), eqP, [anyDashType, anyDashType]), makeDashPrim(new quote("equal?"), primColonEqualP, [anyDashType, anyDashType]), makeDashPrim(new quote("equal~?"), primColonEqualTildeP, [anyDashType, anyDashType, nonDashNegativeDashRealDashType]), mkDashPrim2(new quote("eqv?"), eqvP, [anyDashType, anyDashType]), makeDashPrim(new quote("error"), (function (xs, err, ret) {
  return err(first(xs), second(xs));
}), [symbolDashType, stringDashType]), makeDashPrim(new quote("exit"), notDashImplemented(new quote("exit")), []), mkDashPrim1(new quote("identity"), identity, [anyDashType]), makeDashPrim(new quote("apply"), primColonApply, makeDashVarDashArity([procDashType, anyDashType], anyDashType)), makeDashPrim(new quote("andmap"), primColonAndmap, [procDashType, listDashType]), makeDashPrim(new quote("foldl"), primColonFoldl, [procDashType, anyDashType, listDashType]), makeDashPrim(new quote("foldr"), primColonFoldr, [procDashType, anyDashType, listDashType]), makeDashPrim(new quote("map"), primColonMap, makeDashVarDashArity([procDashType], listDashType)), makeDashPrim(new quote("ormap"), primColonOrmap, [procDashType, listDashType]), makeDashPrim(new quote("filter"), primColonFilter, [procDashType, listDashType]), makeDashPrim(new quote("build-list"), primColonBuildDashList, [natDashType, procDashType]), makeDashPrim(new quote("argmax"), primColonArgmax, [procDashType, listDashType]), makeDashPrim(new quote("argmin"), primColonArgmin, [procDashType, listDashType]), makeDashPrim(new quote("build-string"), primColonBuildDashString, [natDashType, procDashType]), makeDashPrim(new quote("compose"), primColonCompose, makeDashVarDashArity([], procDashType)), makeDashPrim(new quote("for-each"), primColonForDashEach, [procDashType, listDashType]), makeDashPrim(new quote("memf"), primColonMemf, [procDashType, listDashType]), makeDashPrim(new quote("quicksort"), primColonQuicksort, [listDashType, procDashType]), makeDashPrim(new quote("sort"), primColonQuicksort, [listDashType, procDashType]), mkDashPrim1(new quote("procedure?"), (function (x) {
  return ((procP(x)) || (primP(x)));
}), [anyDashType]), makeDashConsDashPrim(idColonColor, structColonColor), makeDashPredDashPrim(idColonColor, structColonColor), makeDashAccDashPrim(idColonColor, structColonColor, 0), makeDashAccDashPrim(idColonColor, structColonColor, 1), makeDashAccDashPrim(idColonColor, structColonColor, 2), makeDashPrim(new quote("image-color?"), (function (xs, err, ret) {
  return ret(((structDashValP(first(xs))) && (eqP(structDashValDashType(first(xs)), idColonColor))));
}), [anyDashType]), mkDashPrim1(new quote("image-width"), imageDashWidth, [imageDashType]), mkDashPrim1(new quote("image-height"), imageDashHeight, [imageDashType]), mkDashPrim1(new quote("pinhole-x"), pinholeDashX, [imageDashType]), mkDashPrim1(new quote("pinhole-y"), pinholeDashY, [imageDashType]), mkDashPrim3(new quote("put-pinhole"), putDashPinhole, [imageDashType, numberDashType, numberDashType]), mkDashPrim3(new quote("move-pinhole"), moveDashPinhole, [imageDashType, numberDashType, numberDashType]), mkDashPrim4(new quote("rectangle"), rectangle, [numberDashType, numberDashType, symbolSlashStringDashType, symbolSlashStringDashType]), mkDashPrim3(new quote("circle"), circle, [numberDashType, symbolSlashStringDashType, symbolSlashStringDashType]), mkDashPrim4(new quote("ellipse"), ellipse, [numberDashType, numberDashType, symbolSlashStringDashType, symbolSlashStringDashType]), mkDashPrim3(new quote("triangle"), triangle, [numberDashType, symbolSlashStringDashType, symbolSlashStringDashType]), mkDashPrim5(new quote("star"), star, (function () { var numGreaterThanEqualSign1 = extendDashType(numberDashType, new quote("number greater than or equal to 1"), (function (x) {
  return GreaterThanEqualSign(x, 1);
}));

return [extendDashType(numberDashType, new quote("number greater than or equal to 2"), (function (x) {
  return GreaterThanEqualSign(x, 2);
})), numGreaterThanEqualSign1, numGreaterThanEqualSign1, symbolSlashStringDashType, symbolSlashStringDashType];
 })()), mkDashPrim5(new quote("regular-polygon"), regularDashPolygon, (function () { var numGreaterThanEqualSign3 = extendDashType(numberDashType, new quote("positive integer bigger than or equal to 3"), (function (x) {
  return GreaterThanEqualSign(x, 3);
}));

return makeDashVarDashArity([numGreaterThanEqualSign3, positiveDashNumberDashType, symbolSlashStringDashType, symbolSlashStringDashType], realDashType);
 })()), mkDashPrim3(new quote("line"), line, [numberDashType, numberDashType, symbolSlashStringDashType]), mkDashPrim3(new quote("text"), text, [stringDashType, positiveDashNumberDashType, symbolSlashStringDashType]), mkDashPrim2(new quote("overlay"), overlay, [imageDashType, imageDashType]), mkDashPrim4(new quote("place-image"), placeDashImage, [imageDashType, numberDashType, numberDashType, imageDashType]), mkDashPrim6(new quote("add-line"), (function (i, x, y, z, u, c) {
  return primColonOverlaySlashXy(putDashPinhole(i, 0, 0), x, y, putDashPinhole(line(z, u, c), 0, 0));
}), [imageDashType, numberDashType, numberDashType, numberDashType, numberDashType, symbolSlashStringDashType]), mkDashPrim2(new quote("overlay"), overlay, [imageDashType, imageDashType]), mkDashPrim4(new quote("overlay/xy"), primColonOverlaySlashXy, [imageDashType, numberDashType, numberDashType, imageDashType]), mkDashPrim1(new quote("scene?"), (function (something) {
  return ((imageDashValP(something)) && (EqualSign(pinholeDashX(something), 0)) && (EqualSign(pinholeDashY(something), 0)));
}), [anyDashType]), mkDashPrim4(new quote("big-bang"), bigDashBang, [anyDashType, anyDashType, numberDashType, anyDashType]), mkDashPrim1(new quote("on-tick-event"), (function (x) {
  return onDashTickDashEvent((function (w) {
  return (function () { var res = applyDashProcedure(x, [w], err, (function (x) {
  return x;
}));

return errP(res) ? errDashGreaterThanError(res) :
  res;
 })();
}));
}), [procDashType]), mkDashPrim1(new quote("on-redraw"), (function (x) {
  return onDashRedraw((function (w) {
  return (function () { var res = applyDashProcedure(x, [w], err, (function (x) {
  return x;
}));

return errP(res) ? errDashGreaterThanError(res) :
  res;
 })();
}));
}), [procDashType]), mkDashPrim1(new quote("on-key-event"), (function (x) {
  return onDashKeyDashEvent((function (w, k) {
  return (function () { var res = applyDashProcedure(x, [w, k], err, (function (x) {
  return x;
}));

return errP(res) ? errDashGreaterThanError(res) :
  res;
 })();
}));
}), [procDashType]), mkDashPrim4(new quote("place-image"), placeDashImage, [anyDashType, numberDashType, numberDashType, anyDashType]), mkDashPrim2(new quote("empty-scene"), emptyDashScene, [numberDashType, numberDashType]), mkDashPrim2(new quote("key=?"), keyEqualSignP, [keyDashEventDashType, keyDashEventDashType]), mkDashPrim1(new quote("on-mouse-event"), (function (handler) {
  return onDashMouseDashEvent((function (w, x, y, e) {
  return (function () { var res = applyDashProcedure(handler, [w, x, y, e], err, (function (x) {
  return x;
}));

return errP(res) ? errDashGreaterThanError(res) :
  res;
 })();
}));
}), [procDashType]), mkDashPrim1(new quote("stop-when"), (function (handler) {
  return stopDashWhen((function (w) {
  return (function () { var res = applyDashProcedure(handler, [w], err, (function (x) {
  return x;
}));

return errP(res) ? errDashGreaterThanError(res) :
  res;
 })();
}));
}), [procDashType]), mkDashPrim4(new quote("nw:rectangle"), (function (x, y, z, a) {
  return putDashPinhole(rectangle(x, y, z, a), 0, 0);
}), [numberDashType, numberDashType, symbolSlashStringDashType, symbolSlashStringDashType]), mkDashPrim6(new quote("scene+line"), (function (i, x, y, z, u, c) {
  return primColonOverlaySlashXy(putDashPinhole(i, 0, 0), x, y, putDashPinhole(line(z, u, c), 0, 0));
}), [imageDashType, numberDashType, numberDashType, numberDashType, numberDashType, symbolSlashStringDashType])];

var imageDashTpSlashPrimDashTable = [makeDashConsDashPrim(idColonColor, structColonColor), makeDashPredDashPrim(idColonColor, structColonColor), makeDashAccDashPrim(idColonColor, structColonColor, 0), makeDashAccDashPrim(idColonColor, structColonColor, 1), makeDashAccDashPrim(idColonColor, structColonColor, 2), makeDashPrim(new quote("image-color?"), (function (xs, err, ret) {
  return ret(((structDashValP(first(xs))) && (eqP(structDashValDashType(first(xs)), new quote("image")))));
}), [anyDashType]), mkDashPrim1(new quote("image-width"), imgDashValDashWidth, [imageDashType]), mkDashPrim1(new quote("image-height"), imgDashValDashHeight, [imageDashType]), mkDashPrim1(new quote("pinhole-x"), imgDashValDashX, [imageDashType]), mkDashPrim1(new quote("pinhole-y"), imgDashValDashY, [imageDashType]), mkDashPrim3(new quote("put-pinhole"), putDashPinhole, [imageDashType, numberDashType, numberDashType]), mkDashPrim3(new quote("move-pinhole"), moveDashPinhole, [imageDashType, numberDashType, numberDashType]), mkDashPrim4(new quote("rectangle"), rectangle, [numberDashType, numberDashType, symbolSlashStringDashType, symbolSlashStringDashType]), mkDashPrim3(new quote("circle"), circle, [numberDashType, symbolSlashStringDashType, symbolSlashStringDashType]), mkDashPrim4(new quote("ellipse"), ellipse, [numberDashType, numberDashType, symbolSlashStringDashType, symbolSlashStringDashType]), mkDashPrim3(new quote("triangle"), triangle, [numberDashType, symbolSlashStringDashType, symbolSlashStringDashType]), mkDashPrim5(new quote("star"), star, (function () { var numGreaterThanEqualSign1 = extendDashType(numberDashType, new quote("number greater than or equal to 1"), (function (x) {
  return GreaterThanEqualSign(x, 1);
}));

return [extendDashType(numberDashType, new quote("number greater than or equal to 2"), (function (x) {
  return GreaterThanEqualSign(x, 2);
})), numGreaterThanEqualSign1, numGreaterThanEqualSign1, symbolSlashStringDashType, symbolSlashStringDashType];
 })()), mkDashPrim5(new quote("regular-polygon"), regularDashPolygon, (function () { var numGreaterThanEqualSign3 = extendDashType(numberDashType, new quote("positive integer bigger than or equal to 3"), (function (x) {
  return GreaterThanEqualSign(x, 3);
}));

return makeDashVarDashArity([numGreaterThanEqualSign3, positiveDashNumberDashType, symbolSlashStringDashType, symbolSlashStringDashType], realDashType);
 })()), mkDashPrim3(new quote("line"), line, [numberDashType, numberDashType, symbolSlashStringDashType]), mkDashPrim3(new quote("text"), text, [stringDashType, positiveDashNumberDashType, symbolSlashStringDashType]), mkDashPrim2(new quote("overlay"), overlay, [imageDashType, imageDashType]), mkDashPrim4(new quote("place-image"), placeDashImage, [imageDashType, numberDashType, numberDashType, imageDashType])];