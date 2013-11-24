
/////////////  BASIC MACHINE STRUCTURES AND OPERATIONS /////////////
function aBox(x)  { this.x = x; }
function box(x)   { return new aBox(x); }
function unbox(b) { return b.x; }
function boxP(b)  { return b instanceof aBox; }
function setBoxB(b, x) { b.x = x; }

var empty = [];

function structVal(type,fields) {
  this.type = type;
  this.fields = fields;
}
function makeStructVal(type,fields) {
  return new structVal(type,fields);
}
function structValP(x) { return x instanceof structVal; }
function structValType(x) { return x.type; }
function structValFields(x) { return x.fields; }
structVal.prototype.toString =
  function () {
    var str = "#(struct:" + this.type.toString();
    for(var i=0;i<this.fields.length;i++)
      str += " " + this.fields[i].toString();
    return str + ")";
  };

function charVal(str) {
  this.str = str;
};
function makeCharVal(str) { return new charVal(str); };
function charValP(x) { return x instanceof charVal; };
function charValStr(x) { return x.str; };

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
function eofObjectP(x) { return x instanceof eofObject; }

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
function allDefinedOut() {
  return "alldefinedout";
}
function checkExpect(x) {
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

function makePosn(x, y) {
  return new __posn(x, y);
}

function posnP(x) {
  return x instanceof __posn;
}

function posnX(posn) {
  return posn.x;
}

function posnY(posn) {
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
function currentSeconds() {
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

// integerGreaterThanChar : Number -> Char
function integerGreaterThanChar(x) {
  return new chr(String.fromCharCode(x));
}

// integerSqrt : Number -> Number
// returns the floor of the number's sqrt
function integerSqrt(x) {
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

// numberGreaterThanString : Number -> String
function numberGreaterThanString(x) { return x.toString(); };

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

// listRef : [ListOf X] Number -> X
function listRef(ls, x) {
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

// intGreaterThanString : Integer -> String
function intGreaterThanString(n) {
  return String.fromCharCode(n);
}

// listGreaterThanString : [ListOf Char] -> String
function listGreaterThanString(ls) {
  return foldl(function (x,xs) {
               return xs + chrVal(x);
               },
               "",
               ls);
}

// makeString : Number Char -> String
function makeString(n, ch) {
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

// stringGreaterThanInt : String -> Integer
function stringGreaterThanInt(str) {
  return str.charCodeAt(0);
}

// stringGreaterThanList : String -> [ListOf Char]
function stringGreaterThanList(str) {
  var arr = [];
  for(var i=0; i<str.length; i++)
    arr[i] = new chr(str.charAt(i));
  return arr;
}

// stringGreaterThanNumber : String -> (U Number false)
function stringGreaterThanNumber(str) {
  var num = new Number(str);
  return isNaN(num) ? false : num;
}

// stringGreaterThanSymbol : String -> Symbol
function stringGreaterThanSymbol(str) {
  return new quote(str);
}

// stringAlphabeticP : String -> Boolean
function stringAlphabeticP(str) {
  return stringOnlyContains(str, /[A-Z]*/i);
}

// stringAppend : String ... -> String
function stringAppend() {
  return foldl(function (x, xs) {
               return xs + x;
               },
               "",
               arguments);
}

// stringCiLessThanEqualSignP : String String ... -> Boolean
function stringCiLessThanEqualSignP() {
  return compareStringsCi(arguments, function(x,y) { return x<=y; });
}
function stringCiLessThanP() {
  return compareStringsCi(arguments, function(x,y) { return x<y; });
}
function stringCiEqualSignP() {
  return compareStringsCi(arguments, function(x,y) { return x==y; });
}
function stringCiGreaterThanEqualSignP() {
  return compareStringsCi(arguments, function(x,y) { return x>=y; });
}
function stringCiGreaterThanP() {
  return compareStringsCi(arguments, function(x,y) { return x>y; });
}

// stringCopy : String -> String
function stringCopy(str) {
  return str.slice(0);
}

// stringLength : String -> Number
function stringLength(str) {
  return str.length;
}

// stringRef : String Number -> Char
function stringRef(str, i) {
  return new chr(str.charAt(i));
}

// stringLowerCaseP : String -> Boolean
function stringLowerCaseP(str) {
  return str==str.toLowerCase();
}

// stringNumericP : String -> Boolean
function stringNumericP(str) {
  return stringOnlyContains(str, /[0-9]*/i);
}

// stringUpperCaseP : String -> Boolean
function stringUpperCaseP(str) {
  return str==str.toUpperCase();
}

// stringWhitespaceP : String -> Boolean
function stringWhitespaceP(str) {
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
  return (x instanceof Constant && types.isString(x.val));
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

// symbolGreaterThanString : Quote -> String
function symbolGreaterThanString(s) {
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

// buildList : Nat (Nat -> X) -> [ListOf X]
function buildList(x, proc) {
  var arr = [];
  for(var i=0; i<x; i++) {
    arr[i] = proc(i);
  }
  return arr;
}

// buildString : Nat (Nat -> Char) -> String
function buildString(x, proc) {
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

// forEach : (Any ... -> Any) [ListOf Any] ... -> Void
function forEach(proc) {
  var lists = Array.prototype.slice.call(arguments,1);
  
  if(!andmap(function(x) { return x.length === lists[0].length; }, lists))
    throw new Error("for: lists must all be of the same length!");
  
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
function singletonStringCodePoint(s) {
  return s.charCodeAt(0);
};

function singletonStringDowncase(s) {
  return s.toLowerCase();
};

function singletonStringUpcase(s) {
  return s.toUpperCase();
};

function integerGreaterThanSingletonString(n) {
  return String.fromCharCode(n);
}

function variableArityLambda(proc) {
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
function compileReq(req) {
  var uri = reqUri(req);
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
      return [loadNdefs(parsedFile, []),
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
		  return k([makeProgRes([],false,false,[]), [], []]);
		};
	      }];
    }
  }

  alert("WARNING: compile-req: " + uri + " is an unsupported require type");
  return [[], function (venv, k) { return function (_) {
                                     return [makeProgRes([],false,
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
  var compiled = compileExpr(sexp)(mtEnv, identity);
  return tramp(compiled);
});

var primOpList = [new quote("*"), new quote("+"), new quote("-"), new quote("/"), new quote("<"), new quote("<="), new quote("="), new quote(">"), new quote(">="), new quote("abs"), new quote("acos"), new quote("add1"), new quote("angle"), new quote("asin"), new quote("atan"), new quote("ceiling"), new quote("complex?"), new quote("conjugate"), new quote("cos"), new quote("cosh"), new quote("current-seconds"), new quote("denominator"), new quote("even?"), new quote("exact->inexact"), new quote("exact?"), new quote("exp"), new quote("expt"), new quote("floor"), new quote("gcd"), new quote("imag-part"), new quote("inexact->exact"), new quote("inexact?"), new quote("integer->char"), new quote("integer-sqrt"), new quote("integer?"), new quote("lcm"), new quote("log"), new quote("magnitude"), new quote("make-polar"), new quote("make-rectangular"), new quote("max"), new quote("min"), new quote("modulo"), new quote("negative?"), new quote("number->string"), new quote("number?"), new quote("numerator"), new quote("odd?"), new quote("positive?"), new quote("quotient"), new quote("random"), new quote("rational?"), new quote("real?"), new quote("remainder"), new quote("round"), new quote("sgn"), new quote("sin"), new quote("sinh"), new quote("sqr"), new quote("sqrt"), new quote("sub1"), new quote("tan"), new quote("zero?"), new quote("boolean=?"), new quote("boolean?"), new quote("false?"), new quote("not"), new quote("symbol->string"), new quote("symbol=?"), new quote("symbol?"), new quote("append"), new quote("assq"), new quote("car"), new quote("cdr"), new quote("caar"), new quote("cadr"), new quote("cdar"), new quote("cddr"), new quote("caaar"), new quote("caadr"), new quote("cadar"), new quote("caddr"), new quote("cdaar"), new quote("cdadr"), new quote("cddar"), new quote("cdddr"), new quote("cons"), new quote("cons?"), new quote("eighth"), new quote("empty?"), new quote("fifth"), new quote("first"), new quote("fourth"), new quote("list"), new quote("list*"), new quote("list-ref"), new quote("member"), new quote("memq"), new quote("memv"), new quote("null?"), new quote("rest"), new quote("reverse"), new quote("second"), new quote("seventh"), new quote("sixth"), new quote("third"), new quote("make-posn"), new quote("posn?"), new quote("posn-x"), new quote("posn-y"), new quote("char->integer"), new quote("char-alphabetic?"), new quote("char-ci<=?"), new quote("char-ci<?"), new quote("char-ci=?"), new quote("char-ci>=?"), new quote("char-ci>?"), new quote("char-downcase"), new quote("char-lower-case?"), new quote("char-numeric?"), new quote("char-upcase"), new quote("char-upper-case?"), new quote("char-whitespace?"), new quote("char<=?"), new quote("char<?"), new quote("char=?"), new quote("char>=?"), new quote("char>?"), new quote("char?"), new quote("format"), new quote("list->string"), new quote("make-string"), new quote("string"), new quote("string->list"), new quote("string->number"), new quote("string->symbol"), new quote("string-append"), new quote("string-ci<=?"), new quote("string-ci<?"), new quote("string-ci=?"), new quote("string-ci>=?"), new quote("string-ci>?"), new quote("string-copy"), new quote("string-length"), new quote("string-ref"), new quote("string<=?"), new quote("string<?"), new quote("string=?"), new quote("string>=?"), new quote("string>?"), new quote("string?"), new quote("substring"), new quote("image=?"), new quote("image?"), new quote("=~"), new quote("eof-object?"), new quote("eq?"), new quote("equal?"), new quote("equal~?"), new quote("eqv?"), new quote("error"), new quote("exit"), new quote("identity"), new quote("andmap"), new quote("apply"), new quote("argmax"), new quote("argmin"), new quote("build-list"), new quote("build-string"), new quote("compose"), new quote("filter"), new quote("foldl"), new quote("foldr"), new quote("for-each"), new quote("map"), new quote("memf"), new quote("ormap"), new quote("procedure?"), new quote("quicksort"), new quote("sort")];

function exception(proc, msg) {
  this.proc = proc;
  this.msg = msg;
};
function makeException(proc, msg) { return new exception(proc, msg); };
function exceptionP(x) { return x instanceof exception; };
function exceptionProc(x) { return x.proc; };
function exceptionMsg(x) { return x.msg; };
var err = (function (sym, str) {
  return makeException(sym, str);
});

var errP = (function (x) {
  return exceptionP(x);
});

var errGreaterThanString = (function (err) {
  return stringAppend(symbolGreaterThanString(exceptionProc(err)), ": ", exceptionMsg(err));
});

var errGreaterThanError = (function (err) {
  return error(exceptionProc(err), exceptionMsg(err));
});

// basic names and values included in all enivronments
var initNenv = [[new quote("e"), new quote("pi"), new quote("eof")]];
var initVenv = [[2.718281828459045, 3.141592653589793, eof]];

function recFrame(ids) {
  this.ids = ids;
};
function makeRecFrame(ids) { return new recFrame(ids); };
function recFrameP(x) { return x instanceof recFrame; };
function recFrameIds(x) { return x.ids; };
function boxedAddr(i, j) {
  this.i = i;
this.j = j;
};
function makeBoxedAddr(i, j) { return new boxedAddr(i, j); };
function boxedAddrP(x) { return x instanceof boxedAddr; };
function boxedAddrI(x) { return x.i; };
function boxedAddrJ(x) { return x.j; };
function unboxedAddr(i, j) {
  this.i = i;
this.j = j;
};
function makeUnboxedAddr(i, j) { return new unboxedAddr(i, j); };
function unboxedAddrP(x) { return x instanceof unboxedAddr; };
function unboxedAddrI(x) { return x.i; };
function unboxedAddrJ(x) { return x.j; };
var address = (function (id, nenv) {
  return addressStar(id, nenv, 0, identity);
});

var addressStar = (function (id, nenv, i, k) {
  return (function () { var findUnboxed = (function (f, j, k) {
  return emptyP(f) ? addressStar(id, rest(nenv), add1(i), k) :
  symbolEqualSignP(id, first(f)) ? k(makeUnboxedAddr(i, j)) :
  findUnboxed(rest(f), add1(j), k);
});

var findBoxed = (function (f, j, k) {
  return emptyP(f) ? addressStar(id, rest(nenv), add1(i), k) :
  symbolEqualSignP(id, first(f)) ? k(makeBoxedAddr(i, j)) :
  findBoxed(rest(f), add1(j), k);
});

return emptyP(nenv) ? err(new quote("lookup"), symbolGreaterThanString(id)) :
  recFrameP(first(nenv)) ? findBoxed(recFrameIds(first(nenv)), 0, k) :
  findUnboxed(first(nenv), 0, k);
 })();
});

var valueof = (function (i, j, venv) {
  return listRef(listRef(venv, i), j);
});

function _undefined() {
  };
function makeUndefined() { return new _undefined(); };
function undefinedP(x) { return x instanceof _undefined; };
var mtEnv = [];

var undefn = makeUndefined();

var makeIdPlusVal = (function (id, val) {
  return [id, val];
});

var frameId = (function (frame) {
  return first(frame);
});

var frameVal = (function (frame) {
  return second(frame);
});

var boxBind = (function (id, val, env) {
  return cons(box([[id, val]]), env);
});

var extend = (function (frame, env) {
  return cons(frame, env);
});

var letExtend = (function (lhs, rhs, env) {
  return extend(zip(lhs, rhs), env);
});

var envRecurB = (function (env, vals) {
  return (function () { var frame = first(env);

return (function () { var DO = setBoxB(frame, map(list, map(first, unbox(frame)), vals));

return env;
 })();
 })();
});

var bindReplaceB = (function (id, val, env) {
  return emptyP(env) ? error(new quote("bind-replace!"), format("did not find undefined name (~a) to replace. Val was: ~a", id, val)) :
  boxP(first(env)) ? (function () { var frame = unbox(first(env));

return consP(memf((function (x) {
  return ((eqP(id, first(x))) && (undefinedP(second(x))));
}), frame)) ? (function () { var DO = setBoxB(first(env), map((function (x) {
  return ((eqP(id, first(x))) && (undefinedP(second(x)))) ? [id, val] :
  x;
}), frame));

return env;
 })() :
  cons(first(env), bindReplaceB(id, val, rest(env)));
 })() :
  cons(first(env), bindReplaceB(id, val, rest(env)));
});

var freshName = (function (env) {
  return (function () { var TRY = (function (i) {
  return (function () { var s = stringGreaterThanSymbol(stringAppend("g", numberGreaterThanString(i)));

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

return find(emptyP(env) ? error(new quote("lookup"), symbolGreaterThanString(id)) :
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

return emptyP(env) ? err(new quote("lookup"), symbolGreaterThanString(id)) :
  boxP(first(env)) ? find(unbox(first(env)), ret) :
  find(first(env), ret);
 })();
});

var zip = (function (ls1, ls2) {
  return emptyP(ls1) ? [] :
  cons([first(ls1), first(ls2)], zip(rest(ls1), rest(ls2)));
});

var intWhitespaceP = (function (n) {
  return ((LessThanEqualSign(9, n, 13)) || (EqualSign(n, 32)) || (EqualSign(n, 133)) || (EqualSign(n, 160)) || (EqualSign(n, 5760)) || (EqualSign(n, 6158)) || (LessThanEqualSign(8192, n, 8202)) || (EqualSign(n, 8232)) || (EqualSign(n, 8233)) || (EqualSign(n, 8239)) || (EqualSign(n, 8287)) || (EqualSign(n, 12288)));
});

var intNumericP = (function (n) {
  return ((LessThanEqualSign(48, n, 57)) || (LessThanEqualSign(178, n, 179)) || (EqualSign(n, 185)) || (LessThanEqualSign(188, n, 190)) || (LessThanEqualSign(1632, n, 1641)) || (LessThanEqualSign(1776, n, 1785)) || (LessThanEqualSign(1984, n, 1993)) || (LessThanEqualSign(2406, n, 2415)) || (LessThanEqualSign(2534, n, 2543)) || (LessThanEqualSign(2548, n, 2551)) || (EqualSign(n, 2553)) || (LessThanEqualSign(2662, n, 2671)) || (LessThanEqualSign(2790, n, 2799)) || (LessThanEqualSign(2918, n, 2927)) || (LessThanEqualSign(3046, n, 3058)) || (LessThanEqualSign(3174, n, 3183)) || (LessThanEqualSign(3192, n, 3198)) || (LessThanEqualSign(3302, n, 3311)) || (LessThanEqualSign(3430, n, 3445)) || (LessThanEqualSign(3664, n, 3673)) || (LessThanEqualSign(3792, n, 3801)) || (LessThanEqualSign(3872, n, 3891)) || (LessThanEqualSign(4160, n, 4169)) || (LessThanEqualSign(4240, n, 4249)) || (LessThanEqualSign(4969, n, 4988)) || (LessThanEqualSign(5870, n, 5872)) || (LessThanEqualSign(6112, n, 6121)) || (LessThanEqualSign(6128, n, 6137)) || (LessThanEqualSign(6160, n, 6169)) || (LessThanEqualSign(6470, n, 6479)) || (LessThanEqualSign(6608, n, 6617)) || (LessThanEqualSign(6992, n, 7001)) || (LessThanEqualSign(7088, n, 7097)) || (LessThanEqualSign(7232, n, 7241)) || (LessThanEqualSign(7248, n, 7257)) || (EqualSign(n, 8304)) || (LessThanEqualSign(8308, n, 8313)) || (LessThanEqualSign(8320, n, 8329)) || (LessThanEqualSign(8531, n, 8578)) || (LessThanEqualSign(8581, n, 8584)) || (LessThanEqualSign(9312, n, 9371)) || (LessThanEqualSign(9450, n, 9471)) || (LessThanEqualSign(10102, n, 10131)) || (EqualSign(n, 11517)) || (EqualSign(n, 12295)) || (LessThanEqualSign(12321, n, 12329)) || (LessThanEqualSign(12344, n, 12346)) || (LessThanEqualSign(12690, n, 12693)) || (LessThanEqualSign(12832, n, 12841)) || (LessThanEqualSign(12881, n, 12895)) || (LessThanEqualSign(12928, n, 12937)) || (LessThanEqualSign(12977, n, 12991)) || (LessThanEqualSign(42528, n, 42537)) || (LessThanEqualSign(43216, n, 43225)) || (LessThanEqualSign(43264, n, 43273)) || (LessThanEqualSign(43600, n, 43609)) || (EqualSign(n, 63851)) || (EqualSign(n, 63859)) || (EqualSign(n, 63864)) || (EqualSign(n, 63922)) || (EqualSign(n, 63953)) || (EqualSign(n, 63955)) || (EqualSign(n, 63997)) || (LessThanEqualSign(65296, n, 65305)) || (LessThanEqualSign(65799, n, 65843)) || (LessThanEqualSign(65856, n, 65912)) || (EqualSign(n, 65930)) || (LessThanEqualSign(66336, n, 66339)) || (EqualSign(n, 66369)) || (EqualSign(n, 66378)) || (LessThanEqualSign(66513, n, 66517)) || (LessThanEqualSign(66720, n, 66729)) || (LessThanEqualSign(67862, n, 67865)) || (LessThanEqualSign(68160, n, 68167)) || (LessThanEqualSign(74752, n, 74801)) || (LessThanEqualSign(74804, n, 74837)) || (LessThanEqualSign(74840, n, 74850)) || (LessThanEqualSign(119648, n, 119665)) || (LessThanEqualSign(120782, n, 120831)) || (EqualSign(n, 194704)));
});

var intAlphabeticP = (function (n) {
  return ((LessThanEqualSign(65, n, 90)) || (LessThanEqualSign(97, n, 122)) || (EqualSign(n, 170)) || (EqualSign(n, 181)) || (EqualSign(n, 186)) || (LessThanEqualSign(192, n, 214)) || (LessThanEqualSign(216, n, 246)) || (LessThanEqualSign(248, n, 442)) || (EqualSign(n, 443)) || (LessThanEqualSign(444, n, 447)) || (LessThanEqualSign(448, n, 451)) || (LessThanEqualSign(452, n, 659)) || (EqualSign(n, 660)) || (LessThanEqualSign(661, n, 687)) || (LessThanEqualSign(688, n, 705)) || (LessThanEqualSign(710, n, 721)) || (LessThanEqualSign(736, n, 740)) || (EqualSign(n, 748)) || (EqualSign(n, 750)) || (EqualSign(n, 837)) || (LessThanEqualSign(880, n, 883)) || (EqualSign(n, 884)) || (LessThanEqualSign(886, n, 887)) || (EqualSign(n, 890)) || (LessThanEqualSign(891, n, 893)) || (EqualSign(n, 902)) || (LessThanEqualSign(904, n, 906)) || (EqualSign(n, 908)) || (LessThanEqualSign(910, n, 929)) || (LessThanEqualSign(931, n, 1013)) || (LessThanEqualSign(1015, n, 1153)) || (LessThanEqualSign(1162, n, 1315)) || (LessThanEqualSign(1329, n, 1366)) || (EqualSign(n, 1369)) || (LessThanEqualSign(1377, n, 1415)) || (LessThanEqualSign(1456, n, 1469)) || (EqualSign(n, 1471)) || (LessThanEqualSign(1473, n, 1474)) || (LessThanEqualSign(1476, n, 1477)) || (EqualSign(n, 1479)) || (LessThanEqualSign(1488, n, 1514)) || (LessThanEqualSign(1520, n, 1522)) || (LessThanEqualSign(1552, n, 1562)) || (LessThanEqualSign(1569, n, 1599)) || (EqualSign(n, 1600)) || (LessThanEqualSign(1601, n, 1610)) || (LessThanEqualSign(1611, n, 1623)) || (LessThanEqualSign(1625, n, 1630)) || (LessThanEqualSign(1646, n, 1647)) || (EqualSign(n, 1648)) || (LessThanEqualSign(1649, n, 1747)) || (EqualSign(n, 1749)) || (LessThanEqualSign(1750, n, 1756)) || (LessThanEqualSign(1761, n, 1764)) || (LessThanEqualSign(1765, n, 1766)) || (LessThanEqualSign(1767, n, 1768)) || (EqualSign(n, 1773)) || (LessThanEqualSign(1774, n, 1775)) || (LessThanEqualSign(1786, n, 1788)) || (EqualSign(n, 1791)) || (EqualSign(n, 1808)) || (EqualSign(n, 1809)) || (LessThanEqualSign(1810, n, 1839)) || (LessThanEqualSign(1840, n, 1855)) || (LessThanEqualSign(1869, n, 1957)) || (LessThanEqualSign(1958, n, 1968)) || (EqualSign(n, 1969)) || (LessThanEqualSign(1994, n, 2026)) || (LessThanEqualSign(2036, n, 2037)) || (EqualSign(n, 2042)) || (LessThanEqualSign(2305, n, 2306)) || (EqualSign(n, 2307)) || (LessThanEqualSign(2308, n, 2361)) || (EqualSign(n, 2365)) || (LessThanEqualSign(2366, n, 2368)) || (LessThanEqualSign(2369, n, 2376)) || (LessThanEqualSign(2377, n, 2380)) || (EqualSign(n, 2384)) || (LessThanEqualSign(2392, n, 2401)) || (LessThanEqualSign(2402, n, 2403)) || (EqualSign(n, 2417)) || (EqualSign(n, 2418)) || (LessThanEqualSign(2427, n, 2431)) || (EqualSign(n, 2433)) || (LessThanEqualSign(2434, n, 2435)) || (LessThanEqualSign(2437, n, 2444)) || (LessThanEqualSign(2447, n, 2448)) || (LessThanEqualSign(2451, n, 2472)) || (LessThanEqualSign(2474, n, 2480)) || (EqualSign(n, 2482)) || (LessThanEqualSign(2486, n, 2489)) || (EqualSign(n, 2493)) || (LessThanEqualSign(2494, n, 2496)) || (LessThanEqualSign(2497, n, 2500)) || (LessThanEqualSign(2503, n, 2504)) || (LessThanEqualSign(2507, n, 2508)) || (EqualSign(n, 2510)) || (EqualSign(n, 2519)) || (LessThanEqualSign(2524, n, 2525)) || (LessThanEqualSign(2527, n, 2529)) || (LessThanEqualSign(2530, n, 2531)) || (LessThanEqualSign(2544, n, 2545)) || (LessThanEqualSign(2561, n, 2562)) || (EqualSign(n, 2563)) || (LessThanEqualSign(2565, n, 2570)) || (LessThanEqualSign(2575, n, 2576)) || (LessThanEqualSign(2579, n, 2600)) || (LessThanEqualSign(2602, n, 2608)) || (LessThanEqualSign(2610, n, 2611)) || (LessThanEqualSign(2613, n, 2614)) || (LessThanEqualSign(2616, n, 2617)) || (LessThanEqualSign(2622, n, 2624)) || (LessThanEqualSign(2625, n, 2626)) || (LessThanEqualSign(2631, n, 2632)) || (LessThanEqualSign(2635, n, 2636)) || (EqualSign(n, 2641)) || (LessThanEqualSign(2649, n, 2652)) || (EqualSign(n, 2654)) || (LessThanEqualSign(2672, n, 2673)) || (LessThanEqualSign(2674, n, 2676)) || (EqualSign(n, 2677)) || (LessThanEqualSign(2689, n, 2690)) || (EqualSign(n, 2691)) || (LessThanEqualSign(2693, n, 2701)) || (LessThanEqualSign(2703, n, 2705)) || (LessThanEqualSign(2707, n, 2728)) || (LessThanEqualSign(2730, n, 2736)) || (LessThanEqualSign(2738, n, 2739)) || (LessThanEqualSign(2741, n, 2745)) || (EqualSign(n, 2749)) || (LessThanEqualSign(2750, n, 2752)) || (LessThanEqualSign(2753, n, 2757)) || (LessThanEqualSign(2759, n, 2760)) || (EqualSign(n, 2761)) || (LessThanEqualSign(2763, n, 2764)) || (EqualSign(n, 2768)) || (LessThanEqualSign(2784, n, 2785)) || (LessThanEqualSign(2786, n, 2787)) || (EqualSign(n, 2817)) || (LessThanEqualSign(2818, n, 2819)) || (LessThanEqualSign(2821, n, 2828)) || (LessThanEqualSign(2831, n, 2832)) || (LessThanEqualSign(2835, n, 2856)) || (LessThanEqualSign(2858, n, 2864)) || (LessThanEqualSign(2866, n, 2867)) || (LessThanEqualSign(2869, n, 2873)) || (EqualSign(n, 2877)) || (EqualSign(n, 2878)) || (EqualSign(n, 2879)) || (EqualSign(n, 2880)) || (LessThanEqualSign(2881, n, 2884)) || (LessThanEqualSign(2887, n, 2888)) || (LessThanEqualSign(2891, n, 2892)) || (EqualSign(n, 2902)) || (EqualSign(n, 2903)) || (LessThanEqualSign(2908, n, 2909)) || (LessThanEqualSign(2911, n, 2913)) || (LessThanEqualSign(2914, n, 2915)) || (EqualSign(n, 2929)) || (EqualSign(n, 2946)) || (EqualSign(n, 2947)) || (LessThanEqualSign(2949, n, 2954)) || (LessThanEqualSign(2958, n, 2960)) || (LessThanEqualSign(2962, n, 2965)) || (LessThanEqualSign(2969, n, 2970)) || (EqualSign(n, 2972)) || (LessThanEqualSign(2974, n, 2975)) || (LessThanEqualSign(2979, n, 2980)) || (LessThanEqualSign(2984, n, 2986)) || (LessThanEqualSign(2990, n, 3001)) || (LessThanEqualSign(3006, n, 3007)) || (EqualSign(n, 3008)) || (LessThanEqualSign(3009, n, 3010)) || (LessThanEqualSign(3014, n, 3016)) || (LessThanEqualSign(3018, n, 3020)) || (EqualSign(n, 3024)) || (EqualSign(n, 3031)) || (LessThanEqualSign(3073, n, 3075)) || (LessThanEqualSign(3077, n, 3084)) || (LessThanEqualSign(3086, n, 3088)) || (LessThanEqualSign(3090, n, 3112)) || (LessThanEqualSign(3114, n, 3123)) || (LessThanEqualSign(3125, n, 3129)) || (EqualSign(n, 3133)) || (LessThanEqualSign(3134, n, 3136)) || (LessThanEqualSign(3137, n, 3140)) || (LessThanEqualSign(3142, n, 3144)) || (LessThanEqualSign(3146, n, 3148)) || (LessThanEqualSign(3157, n, 3158)) || (LessThanEqualSign(3160, n, 3161)) || (LessThanEqualSign(3168, n, 3169)) || (LessThanEqualSign(3170, n, 3171)) || (LessThanEqualSign(3202, n, 3203)) || (LessThanEqualSign(3205, n, 3212)) || (LessThanEqualSign(3214, n, 3216)) || (LessThanEqualSign(3218, n, 3240)) || (LessThanEqualSign(3242, n, 3251)) || (LessThanEqualSign(3253, n, 3257)) || (EqualSign(n, 3261)) || (EqualSign(n, 3262)) || (EqualSign(n, 3263)) || (LessThanEqualSign(3264, n, 3268)) || (EqualSign(n, 3270)) || (LessThanEqualSign(3271, n, 3272)) || (LessThanEqualSign(3274, n, 3275)) || (EqualSign(n, 3276)) || (LessThanEqualSign(3285, n, 3286)) || (EqualSign(n, 3294)) || (LessThanEqualSign(3296, n, 3297)) || (LessThanEqualSign(3298, n, 3299)) || (LessThanEqualSign(3330, n, 3331)) || (LessThanEqualSign(3333, n, 3340)) || (LessThanEqualSign(3342, n, 3344)) || (LessThanEqualSign(3346, n, 3368)) || (LessThanEqualSign(3370, n, 3385)) || (EqualSign(n, 3389)) || (LessThanEqualSign(3390, n, 3392)) || (LessThanEqualSign(3393, n, 3396)) || (LessThanEqualSign(3398, n, 3400)) || (LessThanEqualSign(3402, n, 3404)) || (EqualSign(n, 3415)) || (LessThanEqualSign(3424, n, 3425)) || (LessThanEqualSign(3426, n, 3427)) || (LessThanEqualSign(3450, n, 3455)) || (LessThanEqualSign(3458, n, 3459)) || (LessThanEqualSign(3461, n, 3478)) || (LessThanEqualSign(3482, n, 3505)) || (LessThanEqualSign(3507, n, 3515)) || (EqualSign(n, 3517)) || (LessThanEqualSign(3520, n, 3526)) || (LessThanEqualSign(3535, n, 3537)) || (LessThanEqualSign(3538, n, 3540)) || (EqualSign(n, 3542)) || (LessThanEqualSign(3544, n, 3551)) || (LessThanEqualSign(3570, n, 3571)) || (LessThanEqualSign(3585, n, 3632)) || (EqualSign(n, 3633)) || (LessThanEqualSign(3634, n, 3635)) || (LessThanEqualSign(3636, n, 3642)) || (LessThanEqualSign(3648, n, 3653)) || (EqualSign(n, 3654)) || (EqualSign(n, 3661)) || (LessThanEqualSign(3713, n, 3714)) || (EqualSign(n, 3716)) || (LessThanEqualSign(3719, n, 3720)) || (EqualSign(n, 3722)) || (EqualSign(n, 3725)) || (LessThanEqualSign(3732, n, 3735)) || (LessThanEqualSign(3737, n, 3743)) || (LessThanEqualSign(3745, n, 3747)) || (EqualSign(n, 3749)) || (EqualSign(n, 3751)) || (LessThanEqualSign(3754, n, 3755)) || (LessThanEqualSign(3757, n, 3760)) || (EqualSign(n, 3761)) || (LessThanEqualSign(3762, n, 3763)) || (LessThanEqualSign(3764, n, 3769)) || (LessThanEqualSign(3771, n, 3772)) || (EqualSign(n, 3773)) || (LessThanEqualSign(3776, n, 3780)) || (EqualSign(n, 3782)) || (EqualSign(n, 3789)) || (LessThanEqualSign(3804, n, 3805)) || (EqualSign(n, 3840)) || (LessThanEqualSign(3904, n, 3911)) || (LessThanEqualSign(3913, n, 3948)) || (LessThanEqualSign(3953, n, 3966)) || (EqualSign(n, 3967)) || (LessThanEqualSign(3968, n, 3969)) || (LessThanEqualSign(3976, n, 3979)) || (LessThanEqualSign(3984, n, 3991)) || (LessThanEqualSign(3993, n, 4028)) || (LessThanEqualSign(4096, n, 4138)) || (LessThanEqualSign(4139, n, 4140)) || (LessThanEqualSign(4141, n, 4144)) || (EqualSign(n, 4145)) || (LessThanEqualSign(4146, n, 4150)) || (EqualSign(n, 4152)) || (LessThanEqualSign(4155, n, 4156)) || (LessThanEqualSign(4157, n, 4158)) || (EqualSign(n, 4159)) || (LessThanEqualSign(4176, n, 4181)) || (LessThanEqualSign(4182, n, 4183)) || (LessThanEqualSign(4184, n, 4185)) || (LessThanEqualSign(4186, n, 4189)) || (LessThanEqualSign(4190, n, 4192)) || (EqualSign(n, 4193)) || (EqualSign(n, 4194)) || (LessThanEqualSign(4197, n, 4198)) || (LessThanEqualSign(4199, n, 4200)) || (LessThanEqualSign(4206, n, 4208)) || (LessThanEqualSign(4209, n, 4212)) || (LessThanEqualSign(4213, n, 4225)) || (EqualSign(n, 4226)) || (LessThanEqualSign(4227, n, 4228)) || (LessThanEqualSign(4229, n, 4230)) || (EqualSign(n, 4238)) || (LessThanEqualSign(4256, n, 4293)) || (LessThanEqualSign(4304, n, 4346)) || (EqualSign(n, 4348)) || (LessThanEqualSign(4352, n, 4441)) || (LessThanEqualSign(4447, n, 4514)) || (LessThanEqualSign(4520, n, 4601)) || (LessThanEqualSign(4608, n, 4680)) || (LessThanEqualSign(4682, n, 4685)) || (LessThanEqualSign(4688, n, 4694)) || (EqualSign(n, 4696)) || (LessThanEqualSign(4698, n, 4701)) || (LessThanEqualSign(4704, n, 4744)) || (LessThanEqualSign(4746, n, 4749)) || (LessThanEqualSign(4752, n, 4784)) || (LessThanEqualSign(4786, n, 4789)) || (LessThanEqualSign(4792, n, 4798)) || (EqualSign(n, 4800)) || (LessThanEqualSign(4802, n, 4805)) || (LessThanEqualSign(4808, n, 4822)) || (LessThanEqualSign(4824, n, 4880)) || (LessThanEqualSign(4882, n, 4885)) || (LessThanEqualSign(4888, n, 4954)) || (EqualSign(n, 4959)) || (LessThanEqualSign(4992, n, 5007)) || (LessThanEqualSign(5024, n, 5108)) || (LessThanEqualSign(5121, n, 5740)) || (LessThanEqualSign(5743, n, 5750)) || (LessThanEqualSign(5761, n, 5786)) || (LessThanEqualSign(5792, n, 5866)) || (LessThanEqualSign(5870, n, 5872)) || (LessThanEqualSign(5888, n, 5900)) || (LessThanEqualSign(5902, n, 5905)) || (LessThanEqualSign(5906, n, 5907)) || (LessThanEqualSign(5920, n, 5937)) || (LessThanEqualSign(5938, n, 5939)) || (LessThanEqualSign(5952, n, 5969)) || (LessThanEqualSign(5970, n, 5971)) || (LessThanEqualSign(5984, n, 5996)) || (LessThanEqualSign(5998, n, 6000)) || (LessThanEqualSign(6002, n, 6003)) || (LessThanEqualSign(6016, n, 6067)) || (EqualSign(n, 6070)) || (LessThanEqualSign(6071, n, 6077)) || (LessThanEqualSign(6078, n, 6085)) || (EqualSign(n, 6086)) || (LessThanEqualSign(6087, n, 6088)) || (EqualSign(n, 6103)) || (EqualSign(n, 6108)) || (LessThanEqualSign(6176, n, 6210)) || (EqualSign(n, 6211)) || (LessThanEqualSign(6212, n, 6263)) || (LessThanEqualSign(6272, n, 6312)) || (EqualSign(n, 6313)) || (EqualSign(n, 6314)) || (LessThanEqualSign(6400, n, 6428)) || (LessThanEqualSign(6432, n, 6434)) || (LessThanEqualSign(6435, n, 6438)) || (LessThanEqualSign(6439, n, 6440)) || (LessThanEqualSign(6441, n, 6443)) || (LessThanEqualSign(6448, n, 6449)) || (EqualSign(n, 6450)) || (LessThanEqualSign(6451, n, 6456)) || (LessThanEqualSign(6480, n, 6509)) || (LessThanEqualSign(6512, n, 6516)) || (LessThanEqualSign(6528, n, 6569)) || (LessThanEqualSign(6576, n, 6592)) || (LessThanEqualSign(6593, n, 6599)) || (LessThanEqualSign(6600, n, 6601)) || (LessThanEqualSign(6656, n, 6678)) || (LessThanEqualSign(6679, n, 6680)) || (LessThanEqualSign(6681, n, 6683)) || (LessThanEqualSign(6912, n, 6915)) || (EqualSign(n, 6916)) || (LessThanEqualSign(6917, n, 6963)) || (EqualSign(n, 6965)) || (LessThanEqualSign(6966, n, 6970)) || (EqualSign(n, 6971)) || (EqualSign(n, 6972)) || (LessThanEqualSign(6973, n, 6977)) || (EqualSign(n, 6978)) || (EqualSign(n, 6979)) || (LessThanEqualSign(6981, n, 6987)) || (LessThanEqualSign(7040, n, 7041)) || (EqualSign(n, 7042)) || (LessThanEqualSign(7043, n, 7072)) || (EqualSign(n, 7073)) || (LessThanEqualSign(7074, n, 7077)) || (LessThanEqualSign(7078, n, 7079)) || (LessThanEqualSign(7080, n, 7081)) || (LessThanEqualSign(7086, n, 7087)) || (LessThanEqualSign(7168, n, 7203)) || (LessThanEqualSign(7204, n, 7211)) || (LessThanEqualSign(7212, n, 7219)) || (LessThanEqualSign(7220, n, 7221)) || (LessThanEqualSign(7245, n, 7247)) || (LessThanEqualSign(7258, n, 7287)) || (LessThanEqualSign(7288, n, 7293)) || (LessThanEqualSign(7424, n, 7467)) || (LessThanEqualSign(7468, n, 7521)) || (LessThanEqualSign(7522, n, 7543)) || (EqualSign(n, 7544)) || (LessThanEqualSign(7545, n, 7578)) || (LessThanEqualSign(7579, n, 7615)) || (LessThanEqualSign(7680, n, 7957)) || (LessThanEqualSign(7960, n, 7965)) || (LessThanEqualSign(7968, n, 8005)) || (LessThanEqualSign(8008, n, 8013)) || (LessThanEqualSign(8016, n, 8023)) || (EqualSign(n, 8025)) || (EqualSign(n, 8027)) || (EqualSign(n, 8029)) || (LessThanEqualSign(8031, n, 8061)) || (LessThanEqualSign(8064, n, 8116)) || (LessThanEqualSign(8118, n, 8124)) || (EqualSign(n, 8126)) || (LessThanEqualSign(8130, n, 8132)) || (LessThanEqualSign(8134, n, 8140)) || (LessThanEqualSign(8144, n, 8147)) || (LessThanEqualSign(8150, n, 8155)) || (LessThanEqualSign(8160, n, 8172)) || (LessThanEqualSign(8178, n, 8180)) || (LessThanEqualSign(8182, n, 8188)) || (EqualSign(n, 8305)) || (EqualSign(n, 8319)) || (LessThanEqualSign(8336, n, 8340)) || (EqualSign(n, 8450)) || (EqualSign(n, 8455)) || (LessThanEqualSign(8458, n, 8467)) || (EqualSign(n, 8469)) || (LessThanEqualSign(8473, n, 8477)) || (EqualSign(n, 8484)) || (EqualSign(n, 8486)) || (EqualSign(n, 8488)) || (LessThanEqualSign(8490, n, 8493)) || (LessThanEqualSign(8495, n, 8500)) || (LessThanEqualSign(8501, n, 8504)) || (EqualSign(n, 8505)) || (LessThanEqualSign(8508, n, 8511)) || (LessThanEqualSign(8517, n, 8521)) || (EqualSign(n, 8526)) || (LessThanEqualSign(8544, n, 8578)) || (LessThanEqualSign(8579, n, 8580)) || (LessThanEqualSign(8581, n, 8584)) || (LessThanEqualSign(9398, n, 9449)) || (LessThanEqualSign(11264, n, 11310)) || (LessThanEqualSign(11312, n, 11358)) || (LessThanEqualSign(11360, n, 11375)) || (LessThanEqualSign(11377, n, 11388)) || (EqualSign(n, 11389)) || (LessThanEqualSign(11392, n, 11492)) || (LessThanEqualSign(11520, n, 11557)) || (LessThanEqualSign(11568, n, 11621)) || (EqualSign(n, 11631)) || (LessThanEqualSign(11648, n, 11670)) || (LessThanEqualSign(11680, n, 11686)) || (LessThanEqualSign(11688, n, 11694)) || (LessThanEqualSign(11696, n, 11702)) || (LessThanEqualSign(11704, n, 11710)) || (LessThanEqualSign(11712, n, 11718)) || (LessThanEqualSign(11720, n, 11726)) || (LessThanEqualSign(11728, n, 11734)) || (LessThanEqualSign(11736, n, 11742)) || (LessThanEqualSign(11744, n, 11775)) || (EqualSign(n, 11823)) || (EqualSign(n, 12293)) || (EqualSign(n, 12294)) || (EqualSign(n, 12295)) || (LessThanEqualSign(12321, n, 12329)) || (LessThanEqualSign(12337, n, 12341)) || (LessThanEqualSign(12344, n, 12346)) || (EqualSign(n, 12347)) || (EqualSign(n, 12348)) || (LessThanEqualSign(12353, n, 12438)) || (LessThanEqualSign(12445, n, 12446)) || (EqualSign(n, 12447)) || (LessThanEqualSign(12449, n, 12538)) || (LessThanEqualSign(12540, n, 12542)) || (EqualSign(n, 12543)) || (LessThanEqualSign(12549, n, 12589)) || (LessThanEqualSign(12593, n, 12686)) || (LessThanEqualSign(12704, n, 12727)) || (LessThanEqualSign(12784, n, 12799)) || (LessThanEqualSign(13312, n, 19893)) || (LessThanEqualSign(19968, n, 40899)) || (LessThanEqualSign(40960, n, 40980)) || (EqualSign(n, 40981)) || (LessThanEqualSign(40982, n, 42124)) || (LessThanEqualSign(42240, n, 42507)) || (EqualSign(n, 42508)) || (LessThanEqualSign(42512, n, 42527)) || (LessThanEqualSign(42538, n, 42539)) || (LessThanEqualSign(42560, n, 42591)) || (LessThanEqualSign(42594, n, 42605)) || (EqualSign(n, 42606)) || (EqualSign(n, 42623)) || (LessThanEqualSign(42624, n, 42647)) || (LessThanEqualSign(42775, n, 42783)) || (LessThanEqualSign(42786, n, 42863)) || (EqualSign(n, 42864)) || (LessThanEqualSign(42865, n, 42887)) || (EqualSign(n, 42888)) || (LessThanEqualSign(42891, n, 42892)) || (LessThanEqualSign(43003, n, 43009)) || (LessThanEqualSign(43011, n, 43013)) || (LessThanEqualSign(43015, n, 43018)) || (LessThanEqualSign(43020, n, 43042)) || (LessThanEqualSign(43043, n, 43044)) || (LessThanEqualSign(43045, n, 43046)) || (EqualSign(n, 43047)) || (LessThanEqualSign(43072, n, 43123)) || (LessThanEqualSign(43136, n, 43137)) || (LessThanEqualSign(43138, n, 43187)) || (LessThanEqualSign(43188, n, 43203)) || (LessThanEqualSign(43274, n, 43301)) || (LessThanEqualSign(43302, n, 43306)) || (LessThanEqualSign(43312, n, 43334)) || (LessThanEqualSign(43335, n, 43345)) || (EqualSign(n, 43346)) || (LessThanEqualSign(43520, n, 43560)) || (LessThanEqualSign(43561, n, 43566)) || (LessThanEqualSign(43567, n, 43568)) || (LessThanEqualSign(43569, n, 43570)) || (LessThanEqualSign(43571, n, 43572)) || (LessThanEqualSign(43573, n, 43574)) || (LessThanEqualSign(43584, n, 43586)) || (EqualSign(n, 43587)) || (LessThanEqualSign(43588, n, 43595)) || (EqualSign(n, 43596)) || (EqualSign(n, 43597)) || (LessThanEqualSign(44032, n, 55203)) || (LessThanEqualSign(63744, n, 64045)) || (LessThanEqualSign(64048, n, 64106)) || (LessThanEqualSign(64112, n, 64217)) || (LessThanEqualSign(64256, n, 64262)) || (LessThanEqualSign(64275, n, 64279)) || (EqualSign(n, 64285)) || (EqualSign(n, 64286)) || (LessThanEqualSign(64287, n, 64296)) || (LessThanEqualSign(64298, n, 64310)) || (LessThanEqualSign(64312, n, 64316)) || (EqualSign(n, 64318)) || (LessThanEqualSign(64320, n, 64321)) || (LessThanEqualSign(64323, n, 64324)) || (LessThanEqualSign(64326, n, 64433)) || (LessThanEqualSign(64467, n, 64829)) || (LessThanEqualSign(64848, n, 64911)) || (LessThanEqualSign(64914, n, 64967)) || (LessThanEqualSign(65008, n, 65019)) || (LessThanEqualSign(65136, n, 65140)) || (LessThanEqualSign(65142, n, 65276)) || (LessThanEqualSign(65313, n, 65338)) || (LessThanEqualSign(65345, n, 65370)) || (LessThanEqualSign(65382, n, 65391)) || (EqualSign(n, 65392)) || (LessThanEqualSign(65393, n, 65437)) || (LessThanEqualSign(65438, n, 65439)) || (LessThanEqualSign(65440, n, 65470)) || (LessThanEqualSign(65474, n, 65479)) || (LessThanEqualSign(65482, n, 65487)) || (LessThanEqualSign(65490, n, 65495)) || (LessThanEqualSign(65498, n, 65500)) || (LessThanEqualSign(65536, n, 65547)) || (LessThanEqualSign(65549, n, 65574)) || (LessThanEqualSign(65576, n, 65594)) || (LessThanEqualSign(65596, n, 65597)) || (LessThanEqualSign(65599, n, 65613)) || (LessThanEqualSign(65616, n, 65629)) || (LessThanEqualSign(65664, n, 65786)) || (LessThanEqualSign(65856, n, 65908)) || (LessThanEqualSign(66176, n, 66204)) || (LessThanEqualSign(66208, n, 66256)) || (LessThanEqualSign(66304, n, 66334)) || (LessThanEqualSign(66352, n, 66368)) || (EqualSign(n, 66369)) || (LessThanEqualSign(66370, n, 66377)) || (EqualSign(n, 66378)) || (LessThanEqualSign(66432, n, 66461)) || (LessThanEqualSign(66464, n, 66499)) || (LessThanEqualSign(66504, n, 66511)) || (LessThanEqualSign(66513, n, 66517)) || (LessThanEqualSign(66560, n, 66639)) || (LessThanEqualSign(66640, n, 66717)) || (LessThanEqualSign(67584, n, 67589)) || (EqualSign(n, 67592)) || (LessThanEqualSign(67594, n, 67637)) || (LessThanEqualSign(67639, n, 67640)) || (EqualSign(n, 67644)) || (EqualSign(n, 67647)) || (LessThanEqualSign(67840, n, 67861)) || (LessThanEqualSign(67872, n, 67897)) || (EqualSign(n, 68096)) || (LessThanEqualSign(68097, n, 68099)) || (LessThanEqualSign(68101, n, 68102)) || (LessThanEqualSign(68108, n, 68111)) || (LessThanEqualSign(68112, n, 68115)) || (LessThanEqualSign(68117, n, 68119)) || (LessThanEqualSign(68121, n, 68147)) || (LessThanEqualSign(73728, n, 74606)) || (LessThanEqualSign(74752, n, 74850)) || (LessThanEqualSign(119808, n, 119892)) || (LessThanEqualSign(119894, n, 119964)) || (LessThanEqualSign(119966, n, 119967)) || (EqualSign(n, 119970)) || (LessThanEqualSign(119973, n, 119974)) || (LessThanEqualSign(119977, n, 119980)) || (LessThanEqualSign(119982, n, 119993)) || (EqualSign(n, 119995)) || (LessThanEqualSign(119997, n, 120003)) || (LessThanEqualSign(120005, n, 120069)) || (LessThanEqualSign(120071, n, 120074)) || (LessThanEqualSign(120077, n, 120084)) || (LessThanEqualSign(120086, n, 120092)) || (LessThanEqualSign(120094, n, 120121)) || (LessThanEqualSign(120123, n, 120126)) || (LessThanEqualSign(120128, n, 120132)) || (EqualSign(n, 120134)) || (LessThanEqualSign(120138, n, 120144)) || (LessThanEqualSign(120146, n, 120485)) || (LessThanEqualSign(120488, n, 120512)) || (LessThanEqualSign(120514, n, 120538)) || (LessThanEqualSign(120540, n, 120570)) || (LessThanEqualSign(120572, n, 120596)) || (LessThanEqualSign(120598, n, 120628)) || (LessThanEqualSign(120630, n, 120654)) || (LessThanEqualSign(120656, n, 120686)) || (LessThanEqualSign(120688, n, 120712)) || (LessThanEqualSign(120714, n, 120744)) || (LessThanEqualSign(120746, n, 120770)) || (LessThanEqualSign(120772, n, 120779)) || (LessThanEqualSign(131072, n, 173782)) || (LessThanEqualSign(194560, n, 195101)));
});

var intLowerCaseP = (function (n) {
  return ((LessThanEqualSign(97, n, 122)) || (EqualSign(n, 170)) || (EqualSign(n, 181)) || (EqualSign(n, 186)) || (LessThanEqualSign(223, n, 246)) || (LessThanEqualSign(248, n, 255)) || (EqualSign(n, 257)) || (EqualSign(n, 259)) || (EqualSign(n, 261)) || (EqualSign(n, 263)) || (EqualSign(n, 265)) || (EqualSign(n, 267)) || (EqualSign(n, 269)) || (EqualSign(n, 271)) || (EqualSign(n, 273)) || (EqualSign(n, 275)) || (EqualSign(n, 277)) || (EqualSign(n, 279)) || (EqualSign(n, 281)) || (EqualSign(n, 283)) || (EqualSign(n, 285)) || (EqualSign(n, 287)) || (EqualSign(n, 289)) || (EqualSign(n, 291)) || (EqualSign(n, 293)) || (EqualSign(n, 295)) || (EqualSign(n, 297)) || (EqualSign(n, 299)) || (EqualSign(n, 301)) || (EqualSign(n, 303)) || (EqualSign(n, 305)) || (EqualSign(n, 307)) || (EqualSign(n, 309)) || (LessThanEqualSign(311, n, 312)) || (EqualSign(n, 314)) || (EqualSign(n, 316)) || (EqualSign(n, 318)) || (EqualSign(n, 320)) || (EqualSign(n, 322)) || (EqualSign(n, 324)) || (EqualSign(n, 326)) || (LessThanEqualSign(328, n, 329)) || (EqualSign(n, 331)) || (EqualSign(n, 333)) || (EqualSign(n, 335)) || (EqualSign(n, 337)) || (EqualSign(n, 339)) || (EqualSign(n, 341)) || (EqualSign(n, 343)) || (EqualSign(n, 345)) || (EqualSign(n, 347)) || (EqualSign(n, 349)) || (EqualSign(n, 351)) || (EqualSign(n, 353)) || (EqualSign(n, 355)) || (EqualSign(n, 357)) || (EqualSign(n, 359)) || (EqualSign(n, 361)) || (EqualSign(n, 363)) || (EqualSign(n, 365)) || (EqualSign(n, 367)) || (EqualSign(n, 369)) || (EqualSign(n, 371)) || (EqualSign(n, 373)) || (EqualSign(n, 375)) || (EqualSign(n, 378)) || (EqualSign(n, 380)) || (LessThanEqualSign(382, n, 384)) || (EqualSign(n, 387)) || (EqualSign(n, 389)) || (EqualSign(n, 392)) || (LessThanEqualSign(396, n, 397)) || (EqualSign(n, 402)) || (EqualSign(n, 405)) || (LessThanEqualSign(409, n, 411)) || (EqualSign(n, 414)) || (EqualSign(n, 417)) || (EqualSign(n, 419)) || (EqualSign(n, 421)) || (EqualSign(n, 424)) || (LessThanEqualSign(426, n, 427)) || (EqualSign(n, 429)) || (EqualSign(n, 432)) || (EqualSign(n, 436)) || (EqualSign(n, 438)) || (LessThanEqualSign(441, n, 442)) || (LessThanEqualSign(445, n, 447)) || (EqualSign(n, 454)) || (EqualSign(n, 457)) || (EqualSign(n, 460)) || (EqualSign(n, 462)) || (EqualSign(n, 464)) || (EqualSign(n, 466)) || (EqualSign(n, 468)) || (EqualSign(n, 470)) || (EqualSign(n, 472)) || (EqualSign(n, 474)) || (LessThanEqualSign(476, n, 477)) || (EqualSign(n, 479)) || (EqualSign(n, 481)) || (EqualSign(n, 483)) || (EqualSign(n, 485)) || (EqualSign(n, 487)) || (EqualSign(n, 489)) || (EqualSign(n, 491)) || (EqualSign(n, 493)) || (LessThanEqualSign(495, n, 496)) || (EqualSign(n, 499)) || (EqualSign(n, 501)) || (EqualSign(n, 505)) || (EqualSign(n, 507)) || (EqualSign(n, 509)) || (EqualSign(n, 511)) || (EqualSign(n, 513)) || (EqualSign(n, 515)) || (EqualSign(n, 517)) || (EqualSign(n, 519)) || (EqualSign(n, 521)) || (EqualSign(n, 523)) || (EqualSign(n, 525)) || (EqualSign(n, 527)) || (EqualSign(n, 529)) || (EqualSign(n, 531)) || (EqualSign(n, 533)) || (EqualSign(n, 535)) || (EqualSign(n, 537)) || (EqualSign(n, 539)) || (EqualSign(n, 541)) || (EqualSign(n, 543)) || (EqualSign(n, 545)) || (EqualSign(n, 547)) || (EqualSign(n, 549)) || (EqualSign(n, 551)) || (EqualSign(n, 553)) || (EqualSign(n, 555)) || (EqualSign(n, 557)) || (EqualSign(n, 559)) || (EqualSign(n, 561)) || (LessThanEqualSign(563, n, 569)) || (EqualSign(n, 572)) || (LessThanEqualSign(575, n, 576)) || (EqualSign(n, 578)) || (EqualSign(n, 583)) || (EqualSign(n, 585)) || (EqualSign(n, 587)) || (EqualSign(n, 589)) || (LessThanEqualSign(591, n, 659)) || (LessThanEqualSign(661, n, 687)) || (LessThanEqualSign(688, n, 696)) || (LessThanEqualSign(704, n, 705)) || (LessThanEqualSign(736, n, 740)) || (EqualSign(n, 837)) || (EqualSign(n, 881)) || (EqualSign(n, 883)) || (EqualSign(n, 887)) || (EqualSign(n, 890)) || (LessThanEqualSign(891, n, 893)) || (EqualSign(n, 912)) || (LessThanEqualSign(940, n, 974)) || (LessThanEqualSign(976, n, 977)) || (LessThanEqualSign(981, n, 983)) || (EqualSign(n, 985)) || (EqualSign(n, 987)) || (EqualSign(n, 989)) || (EqualSign(n, 991)) || (EqualSign(n, 993)) || (EqualSign(n, 995)) || (EqualSign(n, 997)) || (EqualSign(n, 999)) || (EqualSign(n, 1001)) || (EqualSign(n, 1003)) || (EqualSign(n, 1005)) || (LessThanEqualSign(1007, n, 1011)) || (EqualSign(n, 1013)) || (EqualSign(n, 1016)) || (LessThanEqualSign(1019, n, 1020)) || (LessThanEqualSign(1072, n, 1119)) || (EqualSign(n, 1121)) || (EqualSign(n, 1123)) || (EqualSign(n, 1125)) || (EqualSign(n, 1127)) || (EqualSign(n, 1129)) || (EqualSign(n, 1131)) || (EqualSign(n, 1133)) || (EqualSign(n, 1135)) || (EqualSign(n, 1137)) || (EqualSign(n, 1139)) || (EqualSign(n, 1141)) || (EqualSign(n, 1143)) || (EqualSign(n, 1145)) || (EqualSign(n, 1147)) || (EqualSign(n, 1149)) || (EqualSign(n, 1151)) || (EqualSign(n, 1153)) || (EqualSign(n, 1163)) || (EqualSign(n, 1165)) || (EqualSign(n, 1167)) || (EqualSign(n, 1169)) || (EqualSign(n, 1171)) || (EqualSign(n, 1173)) || (EqualSign(n, 1175)) || (EqualSign(n, 1177)) || (EqualSign(n, 1179)) || (EqualSign(n, 1181)) || (EqualSign(n, 1183)) || (EqualSign(n, 1185)) || (EqualSign(n, 1187)) || (EqualSign(n, 1189)) || (EqualSign(n, 1191)) || (EqualSign(n, 1193)) || (EqualSign(n, 1195)) || (EqualSign(n, 1197)) || (EqualSign(n, 1199)) || (EqualSign(n, 1201)) || (EqualSign(n, 1203)) || (EqualSign(n, 1205)) || (EqualSign(n, 1207)) || (EqualSign(n, 1209)) || (EqualSign(n, 1211)) || (EqualSign(n, 1213)) || (EqualSign(n, 1215)) || (EqualSign(n, 1218)) || (EqualSign(n, 1220)) || (EqualSign(n, 1222)) || (EqualSign(n, 1224)) || (EqualSign(n, 1226)) || (EqualSign(n, 1228)) || (LessThanEqualSign(1230, n, 1231)) || (EqualSign(n, 1233)) || (EqualSign(n, 1235)) || (EqualSign(n, 1237)) || (EqualSign(n, 1239)) || (EqualSign(n, 1241)) || (EqualSign(n, 1243)) || (EqualSign(n, 1245)) || (EqualSign(n, 1247)) || (EqualSign(n, 1249)) || (EqualSign(n, 1251)) || (EqualSign(n, 1253)) || (EqualSign(n, 1255)) || (EqualSign(n, 1257)) || (EqualSign(n, 1259)) || (EqualSign(n, 1261)) || (EqualSign(n, 1263)) || (EqualSign(n, 1265)) || (EqualSign(n, 1267)) || (EqualSign(n, 1269)) || (EqualSign(n, 1271)) || (EqualSign(n, 1273)) || (EqualSign(n, 1275)) || (EqualSign(n, 1277)) || (EqualSign(n, 1279)) || (EqualSign(n, 1281)) || (EqualSign(n, 1283)) || (EqualSign(n, 1285)) || (EqualSign(n, 1287)) || (EqualSign(n, 1289)) || (EqualSign(n, 1291)) || (EqualSign(n, 1293)) || (EqualSign(n, 1295)) || (EqualSign(n, 1297)) || (EqualSign(n, 1299)) || (EqualSign(n, 1301)) || (EqualSign(n, 1303)) || (EqualSign(n, 1305)) || (EqualSign(n, 1307)) || (EqualSign(n, 1309)) || (EqualSign(n, 1311)) || (EqualSign(n, 1313)) || (EqualSign(n, 1315)) || (LessThanEqualSign(1377, n, 1415)) || (LessThanEqualSign(7424, n, 7467)) || (LessThanEqualSign(7468, n, 7521)) || (LessThanEqualSign(7522, n, 7543)) || (EqualSign(n, 7544)) || (LessThanEqualSign(7545, n, 7578)) || (LessThanEqualSign(7579, n, 7615)) || (EqualSign(n, 7681)) || (EqualSign(n, 7683)) || (EqualSign(n, 7685)) || (EqualSign(n, 7687)) || (EqualSign(n, 7689)) || (EqualSign(n, 7691)) || (EqualSign(n, 7693)) || (EqualSign(n, 7695)) || (EqualSign(n, 7697)) || (EqualSign(n, 7699)) || (EqualSign(n, 7701)) || (EqualSign(n, 7703)) || (EqualSign(n, 7705)) || (EqualSign(n, 7707)) || (EqualSign(n, 7709)) || (EqualSign(n, 7711)) || (EqualSign(n, 7713)) || (EqualSign(n, 7715)) || (EqualSign(n, 7717)) || (EqualSign(n, 7719)) || (EqualSign(n, 7721)) || (EqualSign(n, 7723)) || (EqualSign(n, 7725)) || (EqualSign(n, 7727)) || (EqualSign(n, 7729)) || (EqualSign(n, 7731)) || (EqualSign(n, 7733)) || (EqualSign(n, 7735)) || (EqualSign(n, 7737)) || (EqualSign(n, 7739)) || (EqualSign(n, 7741)) || (EqualSign(n, 7743)) || (EqualSign(n, 7745)) || (EqualSign(n, 7747)) || (EqualSign(n, 7749)) || (EqualSign(n, 7751)) || (EqualSign(n, 7753)) || (EqualSign(n, 7755)) || (EqualSign(n, 7757)) || (EqualSign(n, 7759)) || (EqualSign(n, 7761)) || (EqualSign(n, 7763)) || (EqualSign(n, 7765)) || (EqualSign(n, 7767)) || (EqualSign(n, 7769)) || (EqualSign(n, 7771)) || (EqualSign(n, 7773)) || (EqualSign(n, 7775)) || (EqualSign(n, 7777)) || (EqualSign(n, 7779)) || (EqualSign(n, 7781)) || (EqualSign(n, 7783)) || (EqualSign(n, 7785)) || (EqualSign(n, 7787)) || (EqualSign(n, 7789)) || (EqualSign(n, 7791)) || (EqualSign(n, 7793)) || (EqualSign(n, 7795)) || (EqualSign(n, 7797)) || (EqualSign(n, 7799)) || (EqualSign(n, 7801)) || (EqualSign(n, 7803)) || (EqualSign(n, 7805)) || (EqualSign(n, 7807)) || (EqualSign(n, 7809)) || (EqualSign(n, 7811)) || (EqualSign(n, 7813)) || (EqualSign(n, 7815)) || (EqualSign(n, 7817)) || (EqualSign(n, 7819)) || (EqualSign(n, 7821)) || (EqualSign(n, 7823)) || (EqualSign(n, 7825)) || (EqualSign(n, 7827)) || (LessThanEqualSign(7829, n, 7837)) || (EqualSign(n, 7839)) || (EqualSign(n, 7841)) || (EqualSign(n, 7843)) || (EqualSign(n, 7845)) || (EqualSign(n, 7847)) || (EqualSign(n, 7849)) || (EqualSign(n, 7851)) || (EqualSign(n, 7853)) || (EqualSign(n, 7855)) || (EqualSign(n, 7857)) || (EqualSign(n, 7859)) || (EqualSign(n, 7861)) || (EqualSign(n, 7863)) || (EqualSign(n, 7865)) || (EqualSign(n, 7867)) || (EqualSign(n, 7869)) || (EqualSign(n, 7871)) || (EqualSign(n, 7873)) || (EqualSign(n, 7875)) || (EqualSign(n, 7877)) || (EqualSign(n, 7879)) || (EqualSign(n, 7881)) || (EqualSign(n, 7883)) || (EqualSign(n, 7885)) || (EqualSign(n, 7887)) || (EqualSign(n, 7889)) || (EqualSign(n, 7891)) || (EqualSign(n, 7893)) || (EqualSign(n, 7895)) || (EqualSign(n, 7897)) || (EqualSign(n, 7899)) || (EqualSign(n, 7901)) || (EqualSign(n, 7903)) || (EqualSign(n, 7905)) || (EqualSign(n, 7907)) || (EqualSign(n, 7909)) || (EqualSign(n, 7911)) || (EqualSign(n, 7913)) || (EqualSign(n, 7915)) || (EqualSign(n, 7917)) || (EqualSign(n, 7919)) || (EqualSign(n, 7921)) || (EqualSign(n, 7923)) || (EqualSign(n, 7925)) || (EqualSign(n, 7927)) || (EqualSign(n, 7929)) || (EqualSign(n, 7931)) || (EqualSign(n, 7933)) || (LessThanEqualSign(7935, n, 7943)) || (LessThanEqualSign(7952, n, 7957)) || (LessThanEqualSign(7968, n, 7975)) || (LessThanEqualSign(7984, n, 7991)) || (LessThanEqualSign(8000, n, 8005)) || (LessThanEqualSign(8016, n, 8023)) || (LessThanEqualSign(8032, n, 8039)) || (LessThanEqualSign(8048, n, 8061)) || (LessThanEqualSign(8064, n, 8071)) || (LessThanEqualSign(8080, n, 8087)) || (LessThanEqualSign(8096, n, 8103)) || (LessThanEqualSign(8112, n, 8116)) || (LessThanEqualSign(8118, n, 8119)) || (EqualSign(n, 8126)) || (LessThanEqualSign(8130, n, 8132)) || (LessThanEqualSign(8134, n, 8135)) || (LessThanEqualSign(8144, n, 8147)) || (LessThanEqualSign(8150, n, 8151)) || (LessThanEqualSign(8160, n, 8167)) || (LessThanEqualSign(8178, n, 8180)) || (LessThanEqualSign(8182, n, 8183)) || (EqualSign(n, 8305)) || (EqualSign(n, 8319)) || (LessThanEqualSign(8336, n, 8340)) || (EqualSign(n, 8458)) || (LessThanEqualSign(8462, n, 8463)) || (EqualSign(n, 8467)) || (EqualSign(n, 8495)) || (EqualSign(n, 8500)) || (EqualSign(n, 8505)) || (LessThanEqualSign(8508, n, 8509)) || (LessThanEqualSign(8518, n, 8521)) || (EqualSign(n, 8526)) || (LessThanEqualSign(8560, n, 8575)) || (EqualSign(n, 8580)) || (LessThanEqualSign(9424, n, 9449)) || (LessThanEqualSign(11312, n, 11358)) || (EqualSign(n, 11361)) || (LessThanEqualSign(11365, n, 11366)) || (EqualSign(n, 11368)) || (EqualSign(n, 11370)) || (EqualSign(n, 11372)) || (EqualSign(n, 11377)) || (LessThanEqualSign(11379, n, 11380)) || (LessThanEqualSign(11382, n, 11388)) || (EqualSign(n, 11389)) || (EqualSign(n, 11393)) || (EqualSign(n, 11395)) || (EqualSign(n, 11397)) || (EqualSign(n, 11399)) || (EqualSign(n, 11401)) || (EqualSign(n, 11403)) || (EqualSign(n, 11405)) || (EqualSign(n, 11407)) || (EqualSign(n, 11409)) || (EqualSign(n, 11411)) || (EqualSign(n, 11413)) || (EqualSign(n, 11415)) || (EqualSign(n, 11417)) || (EqualSign(n, 11419)) || (EqualSign(n, 11421)) || (EqualSign(n, 11423)) || (EqualSign(n, 11425)) || (EqualSign(n, 11427)) || (EqualSign(n, 11429)) || (EqualSign(n, 11431)) || (EqualSign(n, 11433)) || (EqualSign(n, 11435)) || (EqualSign(n, 11437)) || (EqualSign(n, 11439)) || (EqualSign(n, 11441)) || (EqualSign(n, 11443)) || (EqualSign(n, 11445)) || (EqualSign(n, 11447)) || (EqualSign(n, 11449)) || (EqualSign(n, 11451)) || (EqualSign(n, 11453)) || (EqualSign(n, 11455)) || (EqualSign(n, 11457)) || (EqualSign(n, 11459)) || (EqualSign(n, 11461)) || (EqualSign(n, 11463)) || (EqualSign(n, 11465)) || (EqualSign(n, 11467)) || (EqualSign(n, 11469)) || (EqualSign(n, 11471)) || (EqualSign(n, 11473)) || (EqualSign(n, 11475)) || (EqualSign(n, 11477)) || (EqualSign(n, 11479)) || (EqualSign(n, 11481)) || (EqualSign(n, 11483)) || (EqualSign(n, 11485)) || (EqualSign(n, 11487)) || (EqualSign(n, 11489)) || (LessThanEqualSign(11491, n, 11492)) || (LessThanEqualSign(11520, n, 11557)) || (EqualSign(n, 42561)) || (EqualSign(n, 42563)) || (EqualSign(n, 42565)) || (EqualSign(n, 42567)) || (EqualSign(n, 42569)) || (EqualSign(n, 42571)) || (EqualSign(n, 42573)) || (EqualSign(n, 42575)) || (EqualSign(n, 42577)) || (EqualSign(n, 42579)) || (EqualSign(n, 42581)) || (EqualSign(n, 42583)) || (EqualSign(n, 42585)) || (EqualSign(n, 42587)) || (EqualSign(n, 42589)) || (EqualSign(n, 42591)) || (EqualSign(n, 42595)) || (EqualSign(n, 42597)) || (EqualSign(n, 42599)) || (EqualSign(n, 42601)) || (EqualSign(n, 42603)) || (EqualSign(n, 42605)) || (EqualSign(n, 42625)) || (EqualSign(n, 42627)) || (EqualSign(n, 42629)) || (EqualSign(n, 42631)) || (EqualSign(n, 42633)) || (EqualSign(n, 42635)) || (EqualSign(n, 42637)) || (EqualSign(n, 42639)) || (EqualSign(n, 42641)) || (EqualSign(n, 42643)) || (EqualSign(n, 42645)) || (EqualSign(n, 42647)) || (EqualSign(n, 42787)) || (EqualSign(n, 42789)) || (EqualSign(n, 42791)) || (EqualSign(n, 42793)) || (EqualSign(n, 42795)) || (EqualSign(n, 42797)) || (LessThanEqualSign(42799, n, 42801)) || (EqualSign(n, 42803)) || (EqualSign(n, 42805)) || (EqualSign(n, 42807)) || (EqualSign(n, 42809)) || (EqualSign(n, 42811)) || (EqualSign(n, 42813)) || (EqualSign(n, 42815)) || (EqualSign(n, 42817)) || (EqualSign(n, 42819)) || (EqualSign(n, 42821)) || (EqualSign(n, 42823)) || (EqualSign(n, 42825)) || (EqualSign(n, 42827)) || (EqualSign(n, 42829)) || (EqualSign(n, 42831)) || (EqualSign(n, 42833)) || (EqualSign(n, 42835)) || (EqualSign(n, 42837)) || (EqualSign(n, 42839)) || (EqualSign(n, 42841)) || (EqualSign(n, 42843)) || (EqualSign(n, 42845)) || (EqualSign(n, 42847)) || (EqualSign(n, 42849)) || (EqualSign(n, 42851)) || (EqualSign(n, 42853)) || (EqualSign(n, 42855)) || (EqualSign(n, 42857)) || (EqualSign(n, 42859)) || (EqualSign(n, 42861)) || (EqualSign(n, 42863)) || (EqualSign(n, 42864)) || (LessThanEqualSign(42865, n, 42872)) || (EqualSign(n, 42874)) || (EqualSign(n, 42876)) || (EqualSign(n, 42879)) || (EqualSign(n, 42881)) || (EqualSign(n, 42883)) || (EqualSign(n, 42885)) || (EqualSign(n, 42887)) || (EqualSign(n, 42892)) || (LessThanEqualSign(64256, n, 64262)) || (LessThanEqualSign(64275, n, 64279)) || (LessThanEqualSign(65345, n, 65370)) || (LessThanEqualSign(66600, n, 66639)) || (LessThanEqualSign(119834, n, 119859)) || (LessThanEqualSign(119886, n, 119892)) || (LessThanEqualSign(119894, n, 119911)) || (LessThanEqualSign(119938, n, 119963)) || (LessThanEqualSign(119990, n, 119993)) || (EqualSign(n, 119995)) || (LessThanEqualSign(119997, n, 120003)) || (LessThanEqualSign(120005, n, 120015)) || (LessThanEqualSign(120042, n, 120067)) || (LessThanEqualSign(120094, n, 120119)) || (LessThanEqualSign(120146, n, 120171)) || (LessThanEqualSign(120198, n, 120223)) || (LessThanEqualSign(120250, n, 120275)) || (LessThanEqualSign(120302, n, 120327)) || (LessThanEqualSign(120354, n, 120379)) || (LessThanEqualSign(120406, n, 120431)) || (LessThanEqualSign(120458, n, 120485)) || (LessThanEqualSign(120514, n, 120538)) || (LessThanEqualSign(120540, n, 120545)) || (LessThanEqualSign(120572, n, 120596)) || (LessThanEqualSign(120598, n, 120603)) || (LessThanEqualSign(120630, n, 120654)) || (LessThanEqualSign(120656, n, 120661)) || (LessThanEqualSign(120688, n, 120712)) || (LessThanEqualSign(120714, n, 120719)) || (LessThanEqualSign(120746, n, 120770)) || (LessThanEqualSign(120772, n, 120777)) || (EqualSign(n, 120779)));
});

var intUpperCaseP = (function (n) {
  return ((LessThanEqualSign(65, n, 90)) || (LessThanEqualSign(192, n, 214)) || (LessThanEqualSign(216, n, 222)) || (EqualSign(n, 256)) || (EqualSign(n, 258)) || (EqualSign(n, 260)) || (EqualSign(n, 262)) || (EqualSign(n, 264)) || (EqualSign(n, 266)) || (EqualSign(n, 268)) || (EqualSign(n, 270)) || (EqualSign(n, 272)) || (EqualSign(n, 274)) || (EqualSign(n, 276)) || (EqualSign(n, 278)) || (EqualSign(n, 280)) || (EqualSign(n, 282)) || (EqualSign(n, 284)) || (EqualSign(n, 286)) || (EqualSign(n, 288)) || (EqualSign(n, 290)) || (EqualSign(n, 292)) || (EqualSign(n, 294)) || (EqualSign(n, 296)) || (EqualSign(n, 298)) || (EqualSign(n, 300)) || (EqualSign(n, 302)) || (EqualSign(n, 304)) || (EqualSign(n, 306)) || (EqualSign(n, 308)) || (EqualSign(n, 310)) || (EqualSign(n, 313)) || (EqualSign(n, 315)) || (EqualSign(n, 317)) || (EqualSign(n, 319)) || (EqualSign(n, 321)) || (EqualSign(n, 323)) || (EqualSign(n, 325)) || (EqualSign(n, 327)) || (EqualSign(n, 330)) || (EqualSign(n, 332)) || (EqualSign(n, 334)) || (EqualSign(n, 336)) || (EqualSign(n, 338)) || (EqualSign(n, 340)) || (EqualSign(n, 342)) || (EqualSign(n, 344)) || (EqualSign(n, 346)) || (EqualSign(n, 348)) || (EqualSign(n, 350)) || (EqualSign(n, 352)) || (EqualSign(n, 354)) || (EqualSign(n, 356)) || (EqualSign(n, 358)) || (EqualSign(n, 360)) || (EqualSign(n, 362)) || (EqualSign(n, 364)) || (EqualSign(n, 366)) || (EqualSign(n, 368)) || (EqualSign(n, 370)) || (EqualSign(n, 372)) || (EqualSign(n, 374)) || (LessThanEqualSign(376, n, 377)) || (EqualSign(n, 379)) || (EqualSign(n, 381)) || (LessThanEqualSign(385, n, 386)) || (EqualSign(n, 388)) || (LessThanEqualSign(390, n, 391)) || (LessThanEqualSign(393, n, 395)) || (LessThanEqualSign(398, n, 401)) || (LessThanEqualSign(403, n, 404)) || (LessThanEqualSign(406, n, 408)) || (LessThanEqualSign(412, n, 413)) || (LessThanEqualSign(415, n, 416)) || (EqualSign(n, 418)) || (EqualSign(n, 420)) || (LessThanEqualSign(422, n, 423)) || (EqualSign(n, 425)) || (EqualSign(n, 428)) || (LessThanEqualSign(430, n, 431)) || (LessThanEqualSign(433, n, 435)) || (EqualSign(n, 437)) || (LessThanEqualSign(439, n, 440)) || (EqualSign(n, 444)) || (EqualSign(n, 452)) || (EqualSign(n, 455)) || (EqualSign(n, 458)) || (EqualSign(n, 461)) || (EqualSign(n, 463)) || (EqualSign(n, 465)) || (EqualSign(n, 467)) || (EqualSign(n, 469)) || (EqualSign(n, 471)) || (EqualSign(n, 473)) || (EqualSign(n, 475)) || (EqualSign(n, 478)) || (EqualSign(n, 480)) || (EqualSign(n, 482)) || (EqualSign(n, 484)) || (EqualSign(n, 486)) || (EqualSign(n, 488)) || (EqualSign(n, 490)) || (EqualSign(n, 492)) || (EqualSign(n, 494)) || (EqualSign(n, 497)) || (EqualSign(n, 500)) || (LessThanEqualSign(502, n, 504)) || (EqualSign(n, 506)) || (EqualSign(n, 508)) || (EqualSign(n, 510)) || (EqualSign(n, 512)) || (EqualSign(n, 514)) || (EqualSign(n, 516)) || (EqualSign(n, 518)) || (EqualSign(n, 520)) || (EqualSign(n, 522)) || (EqualSign(n, 524)) || (EqualSign(n, 526)) || (EqualSign(n, 528)) || (EqualSign(n, 530)) || (EqualSign(n, 532)) || (EqualSign(n, 534)) || (EqualSign(n, 536)) || (EqualSign(n, 538)) || (EqualSign(n, 540)) || (EqualSign(n, 542)) || (EqualSign(n, 544)) || (EqualSign(n, 546)) || (EqualSign(n, 548)) || (EqualSign(n, 550)) || (EqualSign(n, 552)) || (EqualSign(n, 554)) || (EqualSign(n, 556)) || (EqualSign(n, 558)) || (EqualSign(n, 560)) || (EqualSign(n, 562)) || (LessThanEqualSign(570, n, 571)) || (LessThanEqualSign(573, n, 574)) || (EqualSign(n, 577)) || (LessThanEqualSign(579, n, 582)) || (EqualSign(n, 584)) || (EqualSign(n, 586)) || (EqualSign(n, 588)) || (EqualSign(n, 590)) || (EqualSign(n, 880)) || (EqualSign(n, 882)) || (EqualSign(n, 886)) || (EqualSign(n, 902)) || (LessThanEqualSign(904, n, 906)) || (EqualSign(n, 908)) || (LessThanEqualSign(910, n, 911)) || (LessThanEqualSign(913, n, 929)) || (LessThanEqualSign(931, n, 939)) || (EqualSign(n, 975)) || (LessThanEqualSign(978, n, 980)) || (EqualSign(n, 984)) || (EqualSign(n, 986)) || (EqualSign(n, 988)) || (EqualSign(n, 990)) || (EqualSign(n, 992)) || (EqualSign(n, 994)) || (EqualSign(n, 996)) || (EqualSign(n, 998)) || (EqualSign(n, 1000)) || (EqualSign(n, 1002)) || (EqualSign(n, 1004)) || (EqualSign(n, 1006)) || (EqualSign(n, 1012)) || (EqualSign(n, 1015)) || (LessThanEqualSign(1017, n, 1018)) || (LessThanEqualSign(1021, n, 1071)) || (EqualSign(n, 1120)) || (EqualSign(n, 1122)) || (EqualSign(n, 1124)) || (EqualSign(n, 1126)) || (EqualSign(n, 1128)) || (EqualSign(n, 1130)) || (EqualSign(n, 1132)) || (EqualSign(n, 1134)) || (EqualSign(n, 1136)) || (EqualSign(n, 1138)) || (EqualSign(n, 1140)) || (EqualSign(n, 1142)) || (EqualSign(n, 1144)) || (EqualSign(n, 1146)) || (EqualSign(n, 1148)) || (EqualSign(n, 1150)) || (EqualSign(n, 1152)) || (EqualSign(n, 1162)) || (EqualSign(n, 1164)) || (EqualSign(n, 1166)) || (EqualSign(n, 1168)) || (EqualSign(n, 1170)) || (EqualSign(n, 1172)) || (EqualSign(n, 1174)) || (EqualSign(n, 1176)) || (EqualSign(n, 1178)) || (EqualSign(n, 1180)) || (EqualSign(n, 1182)) || (EqualSign(n, 1184)) || (EqualSign(n, 1186)) || (EqualSign(n, 1188)) || (EqualSign(n, 1190)) || (EqualSign(n, 1192)) || (EqualSign(n, 1194)) || (EqualSign(n, 1196)) || (EqualSign(n, 1198)) || (EqualSign(n, 1200)) || (EqualSign(n, 1202)) || (EqualSign(n, 1204)) || (EqualSign(n, 1206)) || (EqualSign(n, 1208)) || (EqualSign(n, 1210)) || (EqualSign(n, 1212)) || (EqualSign(n, 1214)) || (LessThanEqualSign(1216, n, 1217)) || (EqualSign(n, 1219)) || (EqualSign(n, 1221)) || (EqualSign(n, 1223)) || (EqualSign(n, 1225)) || (EqualSign(n, 1227)) || (EqualSign(n, 1229)) || (EqualSign(n, 1232)) || (EqualSign(n, 1234)) || (EqualSign(n, 1236)) || (EqualSign(n, 1238)) || (EqualSign(n, 1240)) || (EqualSign(n, 1242)) || (EqualSign(n, 1244)) || (EqualSign(n, 1246)) || (EqualSign(n, 1248)) || (EqualSign(n, 1250)) || (EqualSign(n, 1252)) || (EqualSign(n, 1254)) || (EqualSign(n, 1256)) || (EqualSign(n, 1258)) || (EqualSign(n, 1260)) || (EqualSign(n, 1262)) || (EqualSign(n, 1264)) || (EqualSign(n, 1266)) || (EqualSign(n, 1268)) || (EqualSign(n, 1270)) || (EqualSign(n, 1272)) || (EqualSign(n, 1274)) || (EqualSign(n, 1276)) || (EqualSign(n, 1278)) || (EqualSign(n, 1280)) || (EqualSign(n, 1282)) || (EqualSign(n, 1284)) || (EqualSign(n, 1286)) || (EqualSign(n, 1288)) || (EqualSign(n, 1290)) || (EqualSign(n, 1292)) || (EqualSign(n, 1294)) || (EqualSign(n, 1296)) || (EqualSign(n, 1298)) || (EqualSign(n, 1300)) || (EqualSign(n, 1302)) || (EqualSign(n, 1304)) || (EqualSign(n, 1306)) || (EqualSign(n, 1308)) || (EqualSign(n, 1310)) || (EqualSign(n, 1312)) || (EqualSign(n, 1314)) || (LessThanEqualSign(1329, n, 1366)) || (LessThanEqualSign(4256, n, 4293)) || (EqualSign(n, 7680)) || (EqualSign(n, 7682)) || (EqualSign(n, 7684)) || (EqualSign(n, 7686)) || (EqualSign(n, 7688)) || (EqualSign(n, 7690)) || (EqualSign(n, 7692)) || (EqualSign(n, 7694)) || (EqualSign(n, 7696)) || (EqualSign(n, 7698)) || (EqualSign(n, 7700)) || (EqualSign(n, 7702)) || (EqualSign(n, 7704)) || (EqualSign(n, 7706)) || (EqualSign(n, 7708)) || (EqualSign(n, 7710)) || (EqualSign(n, 7712)) || (EqualSign(n, 7714)) || (EqualSign(n, 7716)) || (EqualSign(n, 7718)) || (EqualSign(n, 7720)) || (EqualSign(n, 7722)) || (EqualSign(n, 7724)) || (EqualSign(n, 7726)) || (EqualSign(n, 7728)) || (EqualSign(n, 7730)) || (EqualSign(n, 7732)) || (EqualSign(n, 7734)) || (EqualSign(n, 7736)) || (EqualSign(n, 7738)) || (EqualSign(n, 7740)) || (EqualSign(n, 7742)) || (EqualSign(n, 7744)) || (EqualSign(n, 7746)) || (EqualSign(n, 7748)) || (EqualSign(n, 7750)) || (EqualSign(n, 7752)) || (EqualSign(n, 7754)) || (EqualSign(n, 7756)) || (EqualSign(n, 7758)) || (EqualSign(n, 7760)) || (EqualSign(n, 7762)) || (EqualSign(n, 7764)) || (EqualSign(n, 7766)) || (EqualSign(n, 7768)) || (EqualSign(n, 7770)) || (EqualSign(n, 7772)) || (EqualSign(n, 7774)) || (EqualSign(n, 7776)) || (EqualSign(n, 7778)) || (EqualSign(n, 7780)) || (EqualSign(n, 7782)) || (EqualSign(n, 7784)) || (EqualSign(n, 7786)) || (EqualSign(n, 7788)) || (EqualSign(n, 7790)) || (EqualSign(n, 7792)) || (EqualSign(n, 7794)) || (EqualSign(n, 7796)) || (EqualSign(n, 7798)) || (EqualSign(n, 7800)) || (EqualSign(n, 7802)) || (EqualSign(n, 7804)) || (EqualSign(n, 7806)) || (EqualSign(n, 7808)) || (EqualSign(n, 7810)) || (EqualSign(n, 7812)) || (EqualSign(n, 7814)) || (EqualSign(n, 7816)) || (EqualSign(n, 7818)) || (EqualSign(n, 7820)) || (EqualSign(n, 7822)) || (EqualSign(n, 7824)) || (EqualSign(n, 7826)) || (EqualSign(n, 7828)) || (EqualSign(n, 7838)) || (EqualSign(n, 7840)) || (EqualSign(n, 7842)) || (EqualSign(n, 7844)) || (EqualSign(n, 7846)) || (EqualSign(n, 7848)) || (EqualSign(n, 7850)) || (EqualSign(n, 7852)) || (EqualSign(n, 7854)) || (EqualSign(n, 7856)) || (EqualSign(n, 7858)) || (EqualSign(n, 7860)) || (EqualSign(n, 7862)) || (EqualSign(n, 7864)) || (EqualSign(n, 7866)) || (EqualSign(n, 7868)) || (EqualSign(n, 7870)) || (EqualSign(n, 7872)) || (EqualSign(n, 7874)) || (EqualSign(n, 7876)) || (EqualSign(n, 7878)) || (EqualSign(n, 7880)) || (EqualSign(n, 7882)) || (EqualSign(n, 7884)) || (EqualSign(n, 7886)) || (EqualSign(n, 7888)) || (EqualSign(n, 7890)) || (EqualSign(n, 7892)) || (EqualSign(n, 7894)) || (EqualSign(n, 7896)) || (EqualSign(n, 7898)) || (EqualSign(n, 7900)) || (EqualSign(n, 7902)) || (EqualSign(n, 7904)) || (EqualSign(n, 7906)) || (EqualSign(n, 7908)) || (EqualSign(n, 7910)) || (EqualSign(n, 7912)) || (EqualSign(n, 7914)) || (EqualSign(n, 7916)) || (EqualSign(n, 7918)) || (EqualSign(n, 7920)) || (EqualSign(n, 7922)) || (EqualSign(n, 7924)) || (EqualSign(n, 7926)) || (EqualSign(n, 7928)) || (EqualSign(n, 7930)) || (EqualSign(n, 7932)) || (EqualSign(n, 7934)) || (LessThanEqualSign(7944, n, 7951)) || (LessThanEqualSign(7960, n, 7965)) || (LessThanEqualSign(7976, n, 7983)) || (LessThanEqualSign(7992, n, 7999)) || (LessThanEqualSign(8008, n, 8013)) || (EqualSign(n, 8025)) || (EqualSign(n, 8027)) || (EqualSign(n, 8029)) || (EqualSign(n, 8031)) || (LessThanEqualSign(8040, n, 8047)) || (LessThanEqualSign(8120, n, 8123)) || (LessThanEqualSign(8136, n, 8139)) || (LessThanEqualSign(8152, n, 8155)) || (LessThanEqualSign(8168, n, 8172)) || (LessThanEqualSign(8184, n, 8187)) || (EqualSign(n, 8450)) || (EqualSign(n, 8455)) || (LessThanEqualSign(8459, n, 8461)) || (LessThanEqualSign(8464, n, 8466)) || (EqualSign(n, 8469)) || (LessThanEqualSign(8473, n, 8477)) || (EqualSign(n, 8484)) || (EqualSign(n, 8486)) || (EqualSign(n, 8488)) || (LessThanEqualSign(8490, n, 8493)) || (LessThanEqualSign(8496, n, 8499)) || (LessThanEqualSign(8510, n, 8511)) || (EqualSign(n, 8517)) || (LessThanEqualSign(8544, n, 8559)) || (EqualSign(n, 8579)) || (LessThanEqualSign(9398, n, 9423)) || (LessThanEqualSign(11264, n, 11310)) || (EqualSign(n, 11360)) || (LessThanEqualSign(11362, n, 11364)) || (EqualSign(n, 11367)) || (EqualSign(n, 11369)) || (EqualSign(n, 11371)) || (LessThanEqualSign(11373, n, 11375)) || (EqualSign(n, 11378)) || (EqualSign(n, 11381)) || (EqualSign(n, 11392)) || (EqualSign(n, 11394)) || (EqualSign(n, 11396)) || (EqualSign(n, 11398)) || (EqualSign(n, 11400)) || (EqualSign(n, 11402)) || (EqualSign(n, 11404)) || (EqualSign(n, 11406)) || (EqualSign(n, 11408)) || (EqualSign(n, 11410)) || (EqualSign(n, 11412)) || (EqualSign(n, 11414)) || (EqualSign(n, 11416)) || (EqualSign(n, 11418)) || (EqualSign(n, 11420)) || (EqualSign(n, 11422)) || (EqualSign(n, 11424)) || (EqualSign(n, 11426)) || (EqualSign(n, 11428)) || (EqualSign(n, 11430)) || (EqualSign(n, 11432)) || (EqualSign(n, 11434)) || (EqualSign(n, 11436)) || (EqualSign(n, 11438)) || (EqualSign(n, 11440)) || (EqualSign(n, 11442)) || (EqualSign(n, 11444)) || (EqualSign(n, 11446)) || (EqualSign(n, 11448)) || (EqualSign(n, 11450)) || (EqualSign(n, 11452)) || (EqualSign(n, 11454)) || (EqualSign(n, 11456)) || (EqualSign(n, 11458)) || (EqualSign(n, 11460)) || (EqualSign(n, 11462)) || (EqualSign(n, 11464)) || (EqualSign(n, 11466)) || (EqualSign(n, 11468)) || (EqualSign(n, 11470)) || (EqualSign(n, 11472)) || (EqualSign(n, 11474)) || (EqualSign(n, 11476)) || (EqualSign(n, 11478)) || (EqualSign(n, 11480)) || (EqualSign(n, 11482)) || (EqualSign(n, 11484)) || (EqualSign(n, 11486)) || (EqualSign(n, 11488)) || (EqualSign(n, 11490)) || (EqualSign(n, 42560)) || (EqualSign(n, 42562)) || (EqualSign(n, 42564)) || (EqualSign(n, 42566)) || (EqualSign(n, 42568)) || (EqualSign(n, 42570)) || (EqualSign(n, 42572)) || (EqualSign(n, 42574)) || (EqualSign(n, 42576)) || (EqualSign(n, 42578)) || (EqualSign(n, 42580)) || (EqualSign(n, 42582)) || (EqualSign(n, 42584)) || (EqualSign(n, 42586)) || (EqualSign(n, 42588)) || (EqualSign(n, 42590)) || (EqualSign(n, 42594)) || (EqualSign(n, 42596)) || (EqualSign(n, 42598)) || (EqualSign(n, 42600)) || (EqualSign(n, 42602)) || (EqualSign(n, 42604)) || (EqualSign(n, 42624)) || (EqualSign(n, 42626)) || (EqualSign(n, 42628)) || (EqualSign(n, 42630)) || (EqualSign(n, 42632)) || (EqualSign(n, 42634)) || (EqualSign(n, 42636)) || (EqualSign(n, 42638)) || (EqualSign(n, 42640)) || (EqualSign(n, 42642)) || (EqualSign(n, 42644)) || (EqualSign(n, 42646)) || (EqualSign(n, 42786)) || (EqualSign(n, 42788)) || (EqualSign(n, 42790)) || (EqualSign(n, 42792)) || (EqualSign(n, 42794)) || (EqualSign(n, 42796)) || (EqualSign(n, 42798)) || (EqualSign(n, 42802)) || (EqualSign(n, 42804)) || (EqualSign(n, 42806)) || (EqualSign(n, 42808)) || (EqualSign(n, 42810)) || (EqualSign(n, 42812)) || (EqualSign(n, 42814)) || (EqualSign(n, 42816)) || (EqualSign(n, 42818)) || (EqualSign(n, 42820)) || (EqualSign(n, 42822)) || (EqualSign(n, 42824)) || (EqualSign(n, 42826)) || (EqualSign(n, 42828)) || (EqualSign(n, 42830)) || (EqualSign(n, 42832)) || (EqualSign(n, 42834)) || (EqualSign(n, 42836)) || (EqualSign(n, 42838)) || (EqualSign(n, 42840)) || (EqualSign(n, 42842)) || (EqualSign(n, 42844)) || (EqualSign(n, 42846)) || (EqualSign(n, 42848)) || (EqualSign(n, 42850)) || (EqualSign(n, 42852)) || (EqualSign(n, 42854)) || (EqualSign(n, 42856)) || (EqualSign(n, 42858)) || (EqualSign(n, 42860)) || (EqualSign(n, 42862)) || (EqualSign(n, 42873)) || (EqualSign(n, 42875)) || (LessThanEqualSign(42877, n, 42878)) || (EqualSign(n, 42880)) || (EqualSign(n, 42882)) || (EqualSign(n, 42884)) || (EqualSign(n, 42886)) || (EqualSign(n, 42891)) || (LessThanEqualSign(65313, n, 65338)) || (LessThanEqualSign(66560, n, 66599)) || (LessThanEqualSign(119808, n, 119833)) || (LessThanEqualSign(119860, n, 119885)) || (LessThanEqualSign(119912, n, 119937)) || (EqualSign(n, 119964)) || (LessThanEqualSign(119966, n, 119967)) || (EqualSign(n, 119970)) || (LessThanEqualSign(119973, n, 119974)) || (LessThanEqualSign(119977, n, 119980)) || (LessThanEqualSign(119982, n, 119989)) || (LessThanEqualSign(120016, n, 120041)) || (LessThanEqualSign(120068, n, 120069)) || (LessThanEqualSign(120071, n, 120074)) || (LessThanEqualSign(120077, n, 120084)) || (LessThanEqualSign(120086, n, 120092)) || (LessThanEqualSign(120120, n, 120121)) || (LessThanEqualSign(120123, n, 120126)) || (LessThanEqualSign(120128, n, 120132)) || (EqualSign(n, 120134)) || (LessThanEqualSign(120138, n, 120144)) || (LessThanEqualSign(120172, n, 120197)) || (LessThanEqualSign(120224, n, 120249)) || (LessThanEqualSign(120276, n, 120301)) || (LessThanEqualSign(120328, n, 120353)) || (LessThanEqualSign(120380, n, 120405)) || (LessThanEqualSign(120432, n, 120457)) || (LessThanEqualSign(120488, n, 120512)) || (LessThanEqualSign(120546, n, 120570)) || (LessThanEqualSign(120604, n, 120628)) || (LessThanEqualSign(120662, n, 120686)) || (LessThanEqualSign(120720, n, 120744)) || (EqualSign(n, 120778)));
});

function charVal(str) {
  this.str = str;
};
function makeCharVal(str) { return new charVal(str); };
function charValP(x) { return x instanceof charVal; };
function charValStr(x) { return x.str; };
function structVal(type, fields) {
  this.type = type;
this.fields = fields;
};
function makeStructVal(type, fields) { return new structVal(type, fields); };
function structValP(x) { return x instanceof structVal; };
function structValType(x) { return x.type; };
function structValFields(x) { return x.fields; };
function proc(arity, body, venv) {
  this.arity = arity;
this.body = body;
this.venv = venv;
};
function makeProc(arity, body, venv) { return new proc(arity, body, venv); };
function procP(x) { return x instanceof proc; };
function procArity(x) { return x.arity; };
function procBody(x) { return x.body; };
function procVenv(x) { return x.venv; };
function prim(name, func, inputs) {
  this.name = name;
this.func = func;
this.inputs = inputs;
};
function makePrim(name, func, inputs) { return new prim(name, func, inputs); };
function primP(x) { return x instanceof prim; };
function primName(x) { return x.name; };
function primFunc(x) { return x.func; };
function primInputs(x) { return x.inputs; };
var liftStringRelation = (function (r) {
  return (function (c1, c2) {
  return r(charValStr(c1), charValStr(c2));
});
});

var liftStringFunction = (function (f) {
  return (function (c) {
  return f(charValStr(c));
});
});

var charValGreaterThanInteger = liftStringFunction(singletonStringCodePoint);

var integerGreaterThanCharVal = (function (n) {
  return makeCharVal(integerGreaterThanSingletonString(n));
});

var charValDowncase = liftStringFunction((function (s) {
  return makeCharVal(singletonStringDowncase(s));
}));

var charValUpcase = liftStringFunction((function (s) {
  return makeCharVal(singletonStringUpcase(s));
}));

var charValLessThanEqualSignP = liftStringRelation(stringLessThanEqualSignP);

var charValLessThanP = liftStringRelation(stringLessThanP);

var charValEqualSignP = liftStringRelation(stringEqualSignP);

var charValGreaterThanEqualSignP = liftStringRelation(stringGreaterThanEqualSignP);

var charValGreaterThanP = liftStringRelation(stringGreaterThanP);

var charValCiLessThanEqualSignP = liftStringRelation(stringCiLessThanEqualSignP);

var charValCiLessThanP = liftStringRelation(stringCiLessThanP);

var charValCiEqualSignP = liftStringRelation(stringCiEqualSignP);

var charValCiGreaterThanEqualSignP = liftStringRelation(stringCiGreaterThanEqualSignP);

var charValCiGreaterThanP = liftStringRelation(stringCiGreaterThanP);

var liftCodePredicate = (function (r) {
  return (function (c) {
  return r(singletonStringCodePoint(charValStr(c)));
});
});

var charValWhitespaceP = liftCodePredicate(intWhitespaceP);

var charValNumericP = liftCodePredicate(intNumericP);

var charValAlphabeticP = liftCodePredicate(intAlphabeticP);

var charValLowerCaseP = liftCodePredicate(intLowerCaseP);

var charValUpperCaseP = liftCodePredicate(intUpperCaseP);

var listCharValGreaterThanString = (function (cs) {
  return foldl((function (c, str) {
  return stringAppend(str, charValStr(c));
}), "", cs);
});

var stringGreaterThanCharValList = (function (s) {
  return (function () { var loop = (function (i, ls) {
  return zeroP(i) ? ls :
  loop(sub1(i), cons(makeCharVal(substring(s, sub1(i), i)), ls));
});

return loop(stringLength(s), []);
 })();
});

var makeStringCharVal = (function (n, c) {
  return (function () { var loop = (function (n, s) {
  return zeroP(n) ? s :
  loop(sub1(n), stringAppend(charValStr(c), s));
});

return loop(n, "");
 })();
});

var stringRefCharVal = (function (s, i) {
  return makeCharVal(substring(s, i, add1(i)));
});

var i = makeProc(1, new quote("<opaque>"), []);

var k = makeProc(2, new quote("<opaque>"), []);

var valGreaterThanString = (function (v) {
  return procP(v) ? procGreaterThanString(v) :
  primP(v) ? primGreaterThanString(v) :
  numberP(v) ? numberGreaterThanString(v) :
  booleanP(v) ? v ? "true" :
  "false" :
  stringP(v) ? stringAppend("\"", v, "\"") :
  symbolP(v) ? stringAppend("'", symbolGreaterThanString(v)) :
  consP(v) ? stringAppend("(list ", interpolateSpace(map(valGreaterThanString, v)), ")") :
  emptyP(v) ? "empty" :
  imgValP(v) ? "#(struct:object:image-snip% ... ...)" :
  format("[Val->String] Unknown Val ~a", v);
});

var typeAsString = (function (v) {
  return procP(v) ? "procedure" :
  primP(v) ? "procedure" :
  numberP(v) ? "number" :
  booleanP(v) ? "boolean" :
  stringP(v) ? "string" :
  symbolP(v) ? "symbol" :
  consP(v) ? "list" :
  emptyP(v) ? "list" :
  imgValP(v) ? "image" :
  format("[type-as-string] Unknown type for val: ~a", v);
});

var procGreaterThanString = (function (p) {
  return stringAppend("(lambda (", procVarsString(p), ") ...)");
});

var procVarsString = (function (p) {
  return interpolateSpace(buildList(procArity(p), (function (i) {
  return stringAppend("a", numberGreaterThanString(add1(i)));
})));
});

var interpolateSpace = (function (los) {
  return emptyP(los) ? "" :
  emptyP(rest(los)) ? first(los) :
  stringAppend(first(los), " ", interpolateSpace(rest(los)));
});

var valsAsString = (function (vals) {
  return interpolateSpace(map(valGreaterThanString, vals));
});

var primGreaterThanString = (function (p) {
  return symbolGreaterThanString(primName(p));
});

var errMsg = (function (s, msg) {
  return stringAppend(symbolGreaterThanString(s), ": ", msg);
});

var msgNotBool = (function (v) {
  return stringAppend("question result is not true or false: ", valGreaterThanString(v));
});

var msgNotProc = (function (op, args) {
  return stringAppend("expected procedure, given ", valGreaterThanString(op), "; arguments were: ", valsAsString(args));
});

var msgNotError = (function (v) {
  return stringAppend("expected an error, but instead recieved the value: ", valGreaterThanString(v));
});

var msgUndefn = (function (id) {
  return stringAppend("local variable used before its definition: ", symbolGreaterThanString(id));
});

var msgProcArity = (function (proc, vals) {
  return stringAppend("expects ", numberGreaterThanString(procArity(proc)), " argument", EqualSign(1, procArity(proc)) ? "" :
  "s", ", given ", numberGreaterThanString(length(vals)), zeroP(length(vals)) ? "" :
  ": ", valsAsString(vals));
});

var iNd = (function (i) {
  return EqualSign(1, i) ? "1st" :
  EqualSign(2, i) ? "2nd" :
  EqualSign(3, i) ? "3rd" :
  stringAppend(numberGreaterThanString(i), "th");
});

var msgType = (function (name, val, n, others) {
  return stringAppend("expects a ", symbolGreaterThanString(name), " as ", iNd(n), " argument, but given: ", valGreaterThanString(val), emptyP(others) ? "" :
  stringAppend("; other arguments were: ", valsAsString(others)));
});

var msgArityCommon = (function (atLeastP, n, vals) {
  return stringAppend("expects ", atLeastP ? "at least " :
  "", numberGreaterThanString(n), " argument", EqualSign(1, n) ? "" :
  "s", ", given ", numberGreaterThanString(length(vals)), zeroP(length(vals)) ? "" :
  ": ", valsAsString(vals));
});

var msgPrimVarArity = (function (n, vals) {
  return msgArityCommon(true, n, vals);
});

var msgPrimArity = (function (n, vals) {
  return msgArityCommon(false, n, vals);
});

var msgCondAllFalse = "all question results were false";

var msgListRef = (function (ls, i) {
  return stringAppend("index ", numberGreaterThanString(i), " too large for list: ", valGreaterThanString(ls));
});

var msgRedef = "this name was defined previously and cannot be re-defined";

var msgArgRedef = (function (id) {
  return stringAppend("found an argument name that is used more than once: ", symbolGreaterThanString(id));
});

var msgFieldRedef = (function (id) {
  return stringAppend("found an field name that is used more than once: ", symbolGreaterThanString(id));
});

var msgLocalRedef = (function (id) {
  return stringAppend("found a name that was defined locally more than once: ", symbolGreaterThanString(id));
});

var msgUndefId = (function (id) {
  return stringAppend("reference to undefined identifier: ", symbolGreaterThanString(id));
});

var msgRealProc = (function (val) {
  return stringAppend("expected argument of type <procedure that returns ", "real numbers>; given ", valGreaterThanString(val));
});

var msgCharProc = (function (p, x, i) {
  return stringAppend("second argument must be a <procedure> that produces a", " <char>, given ", valGreaterThanString(p), ", which produced ", valGreaterThanString(x), " for ", valGreaterThanString(i));
});

var msgIndexOutOfRange = (function (kind, index, left, right, val) {
  return stringAppend(kind, " index ", numberGreaterThanString(index), " out of range [", numberGreaterThanString(left), ", ", numberGreaterThanString(right), "] for ", typeAsString(val), ": ", valGreaterThanString(val));
});

var applyProc = (function (proc, vals, ret) {
  return EqualSign(procArity(proc), length(vals)) ? (function () { var v = procBody(proc)(cons(vals, procVenv(proc)), identity);

return errP(v) ? v :
  ret(tramp(v));
 })() :
  err(new quote("procedure"), msgProcArity(proc, vals));
});

function type(name, pred) {
  this.name = name;
this.pred = pred;
};
function makeType(name, pred) { return new type(name, pred); };
function typeP(x) { return x instanceof type; };
function typeName(x) { return x.name; };
function typePred(x) { return x.pred; };
function varArity(types, restType) {
  this.types = types;
this.restType = restType;
};
function makeVarArity(types, restType) { return new varArity(types, restType); };
function varArityP(x) { return x instanceof varArity; };
function varArityTypes(x) { return x.types; };
function varArityRestType(x) { return x.restType; };
var extendType = (function (parent, name, proc) {
  return makeType(name, (function (x) {
  return ((typePred(parent)(x)) && (proc(x)));
}));
});

var unionType = (function (name, lot) {
  return makeType(name, (function (x) {
  return ormap((function (type) {
  return typePred(type)(x);
}), lot);
}));
});

var varArityMin = (function (va) {
  return length(varArityTypes(va));
});

///////////////////////////////// TYPES /////////////////////////////////////////
var anyType = makeType(new quote("any"), (function (x) {
  return true;
}));

var numberType = makeType(new quote("number"), numberP);

var booleanType = makeType(new quote("boolean"), booleanP);

var integerType = makeType(new quote("integer"), integerP);

var rationalType = makeType(new quote("rational"), (function (x) {
  return error(new quote("type"), stringAppend("Rational number typechecking ", "is unsupported"));
}));

var realType = makeType(new quote("real"), realP);

var symbolType = makeType(new quote("symbol"), symbolP);

var listType = makeType(new quote("list"), (function (x) {
  return ((emptyP(x)) || (consP(x)));
}));

var stringType = makeType(new quote("string"), stringP);

var pairType = makeType(new quote("pair"), consP);

var charType = makeType(new quote("char"), charValP);

var imageType = makeType(new quote("image"), imageP);

var positiveNumberType = extendType(numberType, new quote("positive number"), (function (x) {
  return GreaterThan(x, 0);
}));

var symbolSlashStringType = unionType(new quote("symbol or string"), [symbolType, stringType]);

var keyEventType = unionType(new quote("keyevent"), [symbolType, charType]);

var procType = makeType(new quote("procedure"), (function (x) {
  return ((procP(x)) || (primP(x)));
}));

var natType = makeType(new quote("non-negative-exact-integer"), (function (x) {
  return ((integerP(x)) && (GreaterThanEqualSign(x, 0)) && (not(negativeP(x))));
}));

var nonNegativeRealType = makeType(new quote("non-negative-real"), (function (x) {
  return ((realP(x)) && (not(negativeP(x))));
}));

var listCharType = makeType(new quote("list-of-character"), (function (x) {
  return ((emptyP(x)) || (((consP(x)) && (andmap(charValP, x)))));
}));

var indexable = (function (i) {
  return (function (x) {
  return emptyP(x) ? false :
  ((consP(x)) && (((zeroP(i)) || (indexable(sub1(i))(rest(x))))));
});
});

var cStarRAble = (function (ads) {
  return (function (x) {
  return emptyP(ads) ? true :
  ((consP(x)) && (symbolEqualSignP(new quote("a"), first(ads)) ? cStarRAble(rest(ads))(car(x)) :
  symbolEqualSignP(new quote("d"), first(ads)) ? cStarRAble(rest(ads))(cdr(x)) :
  err("cond", "all questions false")));
});
});

var cStarRAbleType = (function (ads) {
  return makeType(symbolAppend(append([new quote("c")], ads, [new quote("rable")])), cStarRAble(ads));
});

var indexableType = (function (i) {
  return makeType(symbolAppend([new quote("indexable-"), stringGreaterThanSymbol(numberGreaterThanString(i))]), indexable(i));
});

var symbolAppend = (function (los) {
  return stringGreaterThanSymbol(foldl((function (s, str) {
  return stringAppend(str, symbolGreaterThanString(s));
}), "", los));
});

var applyProcedure = (function (f, vs, err, ret) {
  return procP(f) ? applyProc(f, vs, ret) :
  primP(f) ? applyPrim(f, vs, err, ret) :
  err(new quote("procedure-application"), msgNotProc(f, vs));
});

var applyPrim = (function (prim, vals, err, ret) {
  return checkArity(prim, vals, err, (function (true1) {
  return checkTypes(prim, vals, err, (function (true2) {
  return primFunc(prim)(vals, err, ret);
}));
}));
});

var checkArity = (function (prim, vals, err, ret) {
  return (function () { var IN = primInputs(prim);

return varArityP(IN) ? LessThanEqualSign(length(varArityTypes(IN)), length(vals)) ? ret(true) :
  err(primName(prim), msgPrimVarArity(varArityMin(IN), vals)) :
  EqualSign(length(vals), length(IN)) ? ret(true) :
  err(primName(prim), msgPrimArity(length(IN), vals));
 })();
});

var checkTypes = (function (prim, vals, err, ret) {
  return (function () { var checkReqd = (function (types, vals, n, others) {
  return ((emptyP(types)) && (emptyP(vals))) ? ret(true) :
  emptyP(types) ? (function (_) {
  return checkRest(varArityRestType(primInputs(prim)), vals, n, others);
}) :
  typePred(first(types))(first(vals)) ? (function (_) {
  return checkReqd(rest(types), rest(vals), add1(n), cons(first(vals), others));
}) :
  err(primName(prim), msgType(typeName(first(types)), first(vals), n, append(reverse(others), rest(vals))));
});

var checkRest = (function (type, vals, n, others) {
  return emptyP(vals) ? ret(true) :
  typePred(type)(first(vals)) ? (function (_) {
  return checkRest(type, rest(vals), add1(n), cons(first(vals), others));
}) :
  err(primName(prim), msgType(typeName(type), first(vals), n, append(reverse(others), rest(vals))));
});

return checkReqd(primReqdTypes(prim), vals, 1, []);
 })();
});

var defStructPred = (function (d) {
  return symbolAppend([d.name, new quote("?")]);
});

var defStructCons = (function (d) {
  return symbolAppend([new quote("make-"), d.name]);
});

var defStructAcc = (function (d, fld) {
  return symbolAppend([d.name, new quote("-"), fld]);
});

var makeConsPrim = (function (id, d) {
  return makePrim(defStructCons(d), (function (xs, err, ret) {
  return ret(makeStructVal(id, xs));
}), map((function (x) {
  return anyType;
}), d.fields));
});

var makePredPrim = (function (id, d) {
  return makePrim(defStructPred(d), (function (xs, err, ret) {
  return ret(((structValP(first(xs))) && (eqP(structValType(first(xs)), id))));
}), [anyType]);
});

var makeAccPrim = (function (id, d, i) {
  return makePrim(defStructAcc(d, listRef(d.fields, i)), (function (xs, err, ret) {
  return ret(listRef(structValFields(first(xs)), i));
}), [makeType(symbolAppend([new quote("struct:"), d.name]), (function (x) {
  return ((structValP(x)) && (eqP(structValType(x), id)));
}))]);
});

var buildStructVframe = (function (d) {
  return (function () { var id = [d.name];

return append([makeConsPrim(id, d), makePredPrim(id, d)], buildAccVbindings(id, d, makeAccPrim));
 })();
});

var buildAccVbindings = (function (id, d, makeAcc) {
  return (function () { var loop = (function (flds, i, a) {
  return emptyP(flds) ? a :
  loop(rest(flds), add1(i), cons(makeAcc(id, d, i), a));
});

return reverse(loop(d.fields, 0, []));
 })();
});

var buildStructNframe = (function (d) {
  return (function () { var id = [d.name];

return append([defStructCons(d), defStructPred(d)], map((function (f) {
  return symbolAppend([d.name, new quote("-"), f]);
}), d.fields));
 })();
});

var bindStructB = (function (def, env) {
  return (function () { var id = [def.name];

return (function () { var DO = bindReplaceB(defStructCons(def), makeConsPrim(id, def), env);

var do2 = bindReplaceB(defStructPred(def), makePredPrim(id, def), env);

var do3 = map((function (pair) {
  return bindReplaceB(first(pair), second(pair), env);
}), makeAccBindings(id, def, makeAccPrim));

return env;
 })();
 })();
});

var makeAccBindings = (function (id, d, makeAcc) {
  return (function () { var loop = (function (flds, i, a) {
  return emptyP(flds) ? a :
  loop(rest(flds), add1(i), cons([defStructAcc(d, first(flds)), makeAcc(id, d, i)], a));
});

return loop(d.fields, 0, []);
 })();
});

var lookupPrim = (function (name) {
  return (function () { var lookupTable = (function (table) {
  return emptyP(table) ? error(new quote("lookup-prim"), symbolGreaterThanString(name)) :
  symbolEqualSignP(name, primName(first(table))) ? first(table) :
  lookupTable(rest(table));
});

return lookupTable(primTable);
 })();
});

var primReqdTypes = (function (prim) {
  return (function () { var IN = primInputs(prim);

return varArityP(IN) ? varArityTypes(IN) :
  IN;
 })();
});

var primNameP = (function (x) {
  return ((symbolP(x)) && (ormap((function (p) {
  return eqP(x, primName(p));
}), primTable)));
});

var joinArgs = (function (f, xs, err, ret) {
  return (function () { var loop = (function (xs, ls, i, k) {
  return emptyP(rest(xs)) ? (function () { var t = first(xs);

return ((emptyP(t)) || (consP(t))) ? applyProcedure(f, append(reverse(ls), t), err, k) :
  err(new quote("apply"), msgType(new quote("proper-list"), t, i, cons(f, reverse(ls))));
 })() :
  loop(rest(xs), cons(first(xs), ls), add1(i), k);
});

return loop(xs, [], 2, ret);
 })();
});

var checkRange = (function (start, end, i, type, val, err, k) {
  return ((LessThan(i, start)) || (GreaterThan(i, end))) ? err(new quote("substring"), msgIndexOutOfRange(type, i, start, end, val)) :
  k(true);
});

var primColonApply = (function (xs, err, ret) {
  return joinArgs(first(xs), rest(xs), err, ret);
});

var primColonAndmap = (function (xs, err, ret) {
  return (function () { var p = first(xs);

return (function () { var loop = (function (ls, k) {
  return emptyP(ls) ? k(true) :
  applyProcedure(p, [first(ls)], err, (function (v) {
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
  applyProcedure(p, [first(ls), b], err, (function (bStar) {
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
  return applyProcedure(p, [first(ls), rst], err, k);
}));
});

return fold(first(xs), second(xs), third(xs), ret);
 })();
});

var primColonMap = (function (xs, err, ret) {
  return (function () { var myMap = (function (p, lists, k) {
  return emptyP(first(lists)) ? k([]) :
  applyProcedure(p, map(first, lists), err, (function (x) {
  return myMap(p, map(rest, lists), (function (xs) {
  return k(cons(x, xs));
}));
}));
});

return myMap(first(xs), rest(xs), ret);
 })();
});

var primColonOrmap = (function (xs, err, ret) {
  return (function () { var p = first(xs);

return (function () { var loop = (function (ls, k) {
  return emptyP(ls) ? k(false) :
  applyProcedure(p, [first(ls)], err, (function (v) {
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

return foldrCps((function (x, xs, k) {
  return applyProcedure(p, [x], err, (function (b) {
  return k(falseP(b) ? xs :
  cons(x, xs));
}));
}), [], ls, ret);
 })();
});

var primColonBuildList = (function (xs, err, ret) {
  return (function () { var myBuildList = (function (i, p, k) {
  return GreaterThanEqualSign(i, first(xs)) ? k([]) :
  applyProcedure(p, [i], err, (function (x) {
  return myBuildList(add1(i), p, (function (xs) {
  return k(cons(x, xs));
}));
}));
});

return myBuildList(0, second(xs), ret);
 })();
});

var primColonBuildString = (function (xs, err, ret) {
  return (function () { var myBuildString = (function (i, p, k) {
  return GreaterThanEqualSign(i, first(xs)) ? k("") :
  applyProcedure(p, [i], err, (function (x) {
  return charValP(x) ? myBuildString(add1(i), p, (function (xs) {
  return k(stringAppend(charValStr(x), xs));
})) :
  err(new quote("build-string"), msgCharProc(p, x, i));
}));
});

return myBuildString(0, second(xs), ret);
 })();
});

var primColonArgmax = (function (xs, err, ret) {
  return (function () { var myArgmax = (function (p, ls, k) {
  return applyProcedure(p, [first(ls)], err, (function (x) {
  return realP(x) ? myArgmaxStar(p, rest(ls), [x, first(ls)], (function (x) {
  return k(second(x));
})) :
  err(new quote("argmax"), msgRealProc(p));
}));
});

var myArgmaxStar = (function (p, ls, acc, k) {
  return emptyP(ls) ? k(acc) :
  applyProcedure(p, [first(ls)], err, (function (x) {
  return realP(x) ? myArgmaxStar(p, rest(ls), GreaterThan(x, first(acc)) ? [x, first(ls)] :
  acc, k) :
  err(new quote("argmax"), msgRealProc(p));
}));
});

return consP(second(xs)) ? myArgmax(first(xs), second(xs), ret) :
  err(new quote("argmax"), format("expected argument of type <non-empty list>; given ~a", second(xs)));
 })();
});

var primColonArgmin = (function (xs, err, ret) {
  return (function () { var myArgmin = (function (p, ls, k) {
  return applyProcedure(p, [first(ls)], err, (function (x) {
  return realP(x) ? myArgminStar(p, rest(ls), [x, first(ls)], (function (x) {
  return k(second(x));
})) :
  err(new quote("argmax"), msgRealProc(p));
}));
});

var myArgminStar = (function (p, ls, acc, k) {
  return emptyP(ls) ? k(acc) :
  applyProcedure(p, [first(ls)], err, (function (x) {
  return realP(x) ? myArgminStar(p, rest(ls), LessThan(x, first(acc)) ? [x, first(ls)] :
  acc, k) :
  err(new quote("argmax"), msgRealProc(p));
}));
});

return consP(second(xs)) ? myArgmin(first(xs), second(xs), ret) :
  err(new quote("argmin"), format("expected argument of type <non-empty list>; given ~a", second(xs)));
 })();
});

var primColonCompose = (function (xs, err, ret) {
  return composeInputs(xs, err, (function (inputs) {
  return ret(makePrim(new quote("#<procedure>"), composeProcs(xs), inputs));
}));
});

var composeInputs = (function (procs, err, k) {
  return (function () { var head = first(reverse(procs));

return procP(head) ? k(buildList(procArity(head), (function (x) {
  return anyType;
}))) :
  primP(head) ? k(primInputs(head)) :
  err("cond", "all questions false");
 })();
});

var composeProcs = (function (procs) {
  return (function (xs, err, ret) {
  return (function () { var loop = (function (procs, inputs, k) {
  return emptyP(procs) ? k(first(inputs)) :
  applyProcedure(first(procs), inputs, err, (function (output) {
  return loop(rest(procs), [output], k);
}));
});

return loop(reverse(procs), xs, ret);
 })();
});
});

var primColonForEach = (function (xs, err, ret) {
  return primColonMap(xs, err, (function (v) {
  return ret(forEach(add1, []));
}));
});

var primColonMemf = (function (xs, err, ret) {
  return (function () { var myMemf = (function (proc, ls, k) {
  return emptyP(ls) ? k(false) :
  applyProcedure(proc, [first(ls)], err, (function (bool) {
  return falseP(bool) ? myMemf(proc, rest(ls), k) :
  k(ls);
}));
});

return myMemf(first(xs), second(xs), ret);
 })();
});

var primColonQuicksort = (function (xs, err, ret) {
  return (function () { var myQuicksort = (function (ls, proc, k) {
  return LessThanEqualSign(length(ls), 1) ? k(ls) :
  (function () { var pivot = first(ls);

return filterCps((function (x, k) {
  return applyProcedure(proc, [x, pivot], err, k);
}), rest(ls), (function (lowers) {
  return filterCps((function (x, k) {
  return applyProcedure(proc, [x, pivot], err, (function (y) {
  return k(falseP(y));
}));
}), rest(ls), (function (uppers) {
  return myQuicksort(lowers, proc, (function (sortedLowers) {
  return myQuicksort(uppers, proc, (function (sortedUppers) {
  return k(append(sortedLowers, [pivot], sortedUppers));
}));
}));
}));
}));
 })();
});

return myQuicksort(first(xs), second(xs), ret);
 })();
});

var primColon = (function (xs, err, ret) {
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
  return ret(equalRecP(first(xs), second(xs), EqualSign));
});

var primColonEqualTildeP = (function (xs, err, ret) {
  return ret(equalRecP(first(xs), second(xs), (function (x1, x2) {
  return EqualSignTilde(x1, x2, third(xs));
})));
});

var equalRecP = (function (x1, x2, numberProc) {
  return (function () { var andmapStar = (function (p, ls1, ls2) {
  return emptyP(ls1) ? true :
  falseP(p(first(ls1), first(ls2))) ? false :
  andmapStar(p, rest(ls1), rest(ls2));
});

return ((eqP(x1, x2)) || (numberP(x1) ? ((numberP(x2)) && (numberProc(x1, x2))) :
  stringP(x1) ? ((stringP(x2)) && (stringEqualSignP(x1, x2))) :
  booleanP(x1) ? ((booleanP(x2)) && (booleanEqualSignP(x1, x2))) :
  charValP(x1) ? ((charValP(x2)) && (charValEqualSignP(x1, x2))) :
  emptyP(x1) ? emptyP(x2) :
  consP(x1) ? ((consP(x2)) && (EqualSign(length(x1), length(x2))) && (andmapStar((function (x, y) {
  return equalRecP(x, y, numberProc);
}), x1, x2))) :
  structValP(x1) ? ((structValP(x2)) && (eqP(structValType(x1), structValType(x2))) && (andmapStar((function (x, y) {
  return equalRecP(x, y, numberProc);
}), structValFields(x1), structValFields(x2)))) :
  imgValP(x1) ? ((imgValP(x2)) && (stringEqualSignP(imgValEncoding(x1), imgValEncoding(x2)))) :
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

var end = stringLength(str);

return checkRange(0, end, i, "starting", str, err, (function (t1) {
  return checkRange(i, end, j, "ending", str, err, (function (t2) {
  return ret(substring(str, i, j));
}));
}));
 })();
});

var primColonStringRefCharVal = (function (xs, err, ret) {
  return (function () { var str = first(xs);

var i = second(xs);

return checkRange(0, sub1(stringLength(str)), i, "", str, err, (function (t) {
  return ret(stringRefCharVal(str, i));
}));
 })();
});

var primColonListRef = (function (xs, err, ret) {
  return (function () { var ls = first(xs);

var i = second(xs);

return checkRange(0, sub1(length(ls)), i, "", ls, err, (function (t) {
  return ret(listRef(ls, i));
}));
 })();
});

var primColonListStar = (function (xs, err, ret) {
  return (function () { var revXs = reverse(xs);

var tail = first(revXs);

var args = reverse(rest(revXs));

return ((consP(tail)) || (emptyP(tail))) ? ret(foldr(cons, tail, args)) :
  err(new quote("list*"), msgType(new quote("list"), tail, length(args), args));
 })();
});

var primColonImageEqualSignP = (function (xs, err, ret) {
  return (function () { var i1 = first(xs);

var i2 = second(xs);

return ((imgValP(i1)) && (imgValP(i2)) && (stringEqualSignP(imgValEncoding(i1), imgValEncoding(i2))));
 })();
});

var idColonPosn = [new quote("posn")];

var structColonPosn = makeDefStruct(new quote("posn"), [new quote("x"), new quote("y")]);

var notImplemented = (function (name) {
  return (function (xs, err, ret) {
  return err(name, "not implemented");
});
});

var mkPrim = (function (n, f, i) {
  return makePrim(n, (function (xs, err, ret) {
  return ret(apply(f, xs));
}), i);
});

var mkPrim0 = (function (n, f, i) {
  return makePrim(n, (function (xs, err, ret) {
  return ret(f());
}), i);
});

var mkPrim1 = (function (n, f, i) {
  return makePrim(n, (function (xs, err, ret) {
  return ret(f(first(xs)));
}), i);
});

var mkPrim2 = (function (n, f, i) {
  return makePrim(n, (function (xs, err, ret) {
  return ret(f(first(xs), second(xs)));
}), i);
});

var mkPrim3 = (function (n, f, i) {
  return makePrim(n, (function (xs, err, ret) {
  return ret(f(first(xs), second(xs), third(xs)));
}), i);
});

var mkPrim4 = (function (n, f, i) {
  return makePrim(n, (function (xs, err, ret) {
  return ret(f(first(xs), second(xs), third(xs), fourth(xs)));
}), i);
});

var mkPrim5 = (function (n, f, i) {
  return makePrim(n, (function (xs, err, ret) {
  return ret(f(first(xs), second(xs), third(xs), fourth(xs), fifth(xs)));
}), i);
});

var mkPrim6 = (function (n, f, i) {
  return makePrim(n, (function (xs, err, ret) {
  return ret(f(first(xs), second(xs), third(xs), fourth(xs), fifth(xs), sixth(xs)));
}), i);
});

var liftOrder = (function (f) {
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

var structColonColor = makeDefStruct(new quote("color"), [new quote("red"), new quote("green"), new quote("blue")]);

var primColonOverlaySlashXy = (function (i1, dx, dy, i2) {
  return overlay(i1, movePinhole(i2, minus(dx), minus(dy)));
});

var primTable = [makePrim(new quote("*"), (function (xs, err, ret) {
  return ret(foldl(times, 1, xs));
}), makeVarArity([numberType, numberType], numberType)), makePrim(new quote("+"), (function (xs, err, ret) {
  return ret(foldl(plus, 0, xs));
}), makeVarArity([numberType, numberType], numberType)), makePrim(new quote("-"), primColon, makeVarArity([numberType], numberType)), makePrim(new quote("/"), primColonSlash, makeVarArity([numberType, numberType], numberType)), makePrim(new quote("<"), liftOrder(LessThan), makeVarArity([numberType, numberType], numberType)), makePrim(new quote("<="), liftOrder(LessThanEqualSign), makeVarArity([numberType, numberType], numberType)), makePrim(new quote("="), liftOrder(EqualSign), makeVarArity([numberType, numberType], numberType)), makePrim(new quote(">"), liftOrder(GreaterThan), makeVarArity([numberType, numberType], numberType)), makePrim(new quote(">="), liftOrder(GreaterThanEqualSign), makeVarArity([numberType, numberType], numberType)), mkPrim1(new quote("abs"), abs, [numberType]), mkPrim1(new quote("acos"), acos, [extendType(numberType, new quote("number on the range [-1,1]"), (function (x) {
  return ((GreaterThanEqualSign(x, -1)) && (LessThanEqualSign(x, 1)));
}))]), mkPrim1(new quote("add1"), add1, [numberType]), makePrim(new quote("angle"), notImplemented(new quote("angle")), [numberType]), mkPrim1(new quote("asin"), asin, [extendType(numberType, new quote("number on the range [-1,1]"), (function (x) {
  return ((GreaterThanEqualSign(x, -1)) && (LessThanEqualSign(x, 1)));
}))]), mkPrim1(new quote("atan"), atan, [numberType]), mkPrim1(new quote("ceiling"), ceiling, [numberType]), makePrim(new quote("complex?"), notImplemented(new quote("complex?")), [anyType]), makePrim(new quote("conjugate"), notImplemented(new quote("conjugate")), [numberType]), mkPrim1(new quote("cos"), cos, [numberType]), mkPrim1(new quote("cosh"), cosh, [numberType]), mkPrim0(new quote("current-seconds"), currentSeconds, []), makePrim(new quote("denominator"), notImplemented(new quote("denominator")), [rationalType]), mkPrim1(new quote("even?"), evenP, [numberType]), makePrim(new quote("exact->inexact"), notImplemented(new quote("exact->inexact")), [numberType]), makePrim(new quote("exact?"), notImplemented(new quote("exact?")), [anyType]), mkPrim1(new quote("exp"), exp, [numberType]), mkPrim2(new quote("expt"), expt, [numberType, numberType]), mkPrim1(new quote("floor"), floor, [numberType]), makePrim(new quote("gcd"), (function (xs, err, ret) {
  return ret(foldl(lcm, 1, xs));
}), makeVarArity([], numberType)), makePrim(new quote("imag-part"), notImplemented(new quote("imag-part")), [numberType]), makePrim(new quote("inexact->exact"), notImplemented(new quote("inexact->exact")), [numberType]), makePrim(new quote("inexact?"), notImplemented(new quote("inexact?")), [numberType]), mkPrim1(new quote("integer->char"), integerGreaterThanCharVal, [makeType(new quote("integer-in-0-x10ffff-not-in-xd800-xdfff"), (function (x) {
  return ((integerP(x)) && (LessThanEqualSign(0, x, 1114111)) && (not(LessThanEqualSign(55296, x, 57343))));
}))]), mkPrim1(new quote("integer?"), integerP, [anyType]), makePrim(new quote("lcm"), (function (xs, err, ret) {
  return ret(foldl(lcm, 1, xs));
}), makeVarArity([], numberType)), mkPrim1(new quote("log"), log, [numberType]), makePrim(new quote("magnitude"), notImplemented(new quote("magnitude")), [numberType]), makePrim(new quote("make-polar"), notImplemented(new quote("make-polar")), [realType, realType]), makePrim(new quote("max"), (function (xs, err, ret) {
  return ret(foldl(max, first(xs), rest(xs)));
}), makeVarArity([realType], realType)), makePrim(new quote("min"), (function (xs, err, ret) {
  return ret(foldl(min, first(xs), rest(xs)));
}), makeVarArity([realType], realType)), mkPrim2(new quote("modulo"), modulo, [numberType, extendType(numberType, new quote("non-zero integer"), (function (x) {
  return not(zeroP(x));
}))]), mkPrim1(new quote("negative?"), negativeP, [realType]), mkPrim1(new quote("number->string"), numberGreaterThanString, [numberType]), mkPrim1(new quote("number?"), numberP, [anyType]), makePrim(new quote("numerator"), notImplemented(new quote("numerator")), [rationalType]), mkPrim1(new quote("odd?"), oddP, [numberType]), mkPrim1(new quote("positive?"), positiveP, [realType]), mkPrim2(new quote("quotient"), quotient, [numberType, extendType(numberType, new quote("non-zero integer"), (function (x) {
  return not(zeroP(x));
}))]), mkPrim1(new quote("random"), random, [numberType]), makePrim(new quote("rational?"), notImplemented(new quote("rational?")), [anyType]), mkPrim1(new quote("real?"), realP, [anyType]), mkPrim2(new quote("remainder"), remainder, [numberType, extendType(numberType, new quote("non-zero integer"), (function (x) {
  return not(zeroP(x));
}))]), mkPrim1(new quote("round"), round, [realType]), mkPrim1(new quote("sgn"), sgn, [realType]), mkPrim1(new quote("sin"), sin, [numberType]), mkPrim1(new quote("sinh"), sinh, [numberType]), mkPrim1(new quote("sqr"), sqr, [numberType]), mkPrim1(new quote("sqrt"), sqrt, [extendType(numberType, new quote("positive integer"), (function (x) {
  return GreaterThanEqualSign(x, 0);
}))]), mkPrim1(new quote("sub1"), sub1, [numberType]), mkPrim1(new quote("tan"), tan, [numberType]), mkPrim1(new quote("zero?"), zeroP, [realType]), mkPrim2(new quote("boolean=?"), booleanEqualSignP, [booleanType, booleanType]), mkPrim1(new quote("boolean?"), booleanP, [anyType]), mkPrim1(new quote("false?"), falseP, [anyType]), mkPrim1(new quote("not"), not, [booleanType]), mkPrim1(new quote("symbol->string"), symbolGreaterThanString, [symbolType]), mkPrim2(new quote("symbol=?"), symbolEqualSignP, [symbolType, symbolType]), mkPrim1(new quote("symbol?"), symbolP, [anyType]), makePrim(new quote("append"), (function (xs, err, ret) {
  return ret(foldr(append, [], xs));
}), makeVarArity([listType, listType], listType)), mkPrim2(new quote("assq"), assq, [anyType, listType]), mkPrim1(new quote("car"), car, [pairType]), mkPrim1(new quote("cdr"), cdr, [pairType]), mkPrim1(new quote("caar"), caar, cStarRAbleType([new quote("a"), new quote("a")])), mkPrim1(new quote("cadr"), cadr, cStarRAbleType([new quote("a"), new quote("d")])), mkPrim1(new quote("cdar"), cdar, cStarRAbleType([new quote("d"), new quote("a")])), mkPrim1(new quote("cddr"), cddr, cStarRAbleType([new quote("d"), new quote("d")])), mkPrim1(new quote("caaar"), caaar, cStarRAbleType([new quote("a"), new quote("a"), new quote("a")])), mkPrim1(new quote("caadr"), caadr, cStarRAbleType([new quote("a"), new quote("a"), new quote("d")])), mkPrim1(new quote("cadar"), cadar, cStarRAbleType([new quote("a"), new quote("d"), new quote("a")])), mkPrim1(new quote("caddr"), caddr, cStarRAbleType([new quote("a"), new quote("d"), new quote("d")])), mkPrim1(new quote("cdaar"), cdaar, cStarRAbleType([new quote("d"), new quote("a"), new quote("a")])), mkPrim1(new quote("cdadr"), cdadr, cStarRAbleType([new quote("d"), new quote("a"), new quote("d")])), mkPrim1(new quote("cddar"), cddar, cStarRAbleType([new quote("d"), new quote("d"), new quote("a")])), mkPrim1(new quote("cdddr"), cdddr, cStarRAbleType([new quote("d"), new quote("d"), new quote("d")])), mkPrim2(new quote("cons"), cons, [anyType, listType]), mkPrim1(new quote("cons?"), consP, [anyType]), mkPrim1(new quote("eighth"), eighth, [indexableType(7)]), mkPrim1(new quote("empty?"), emptyP, [anyType]), mkPrim1(new quote("fifth"), fifth, [indexableType(4)]), mkPrim1(new quote("first"), first, [pairType]), mkPrim1(new quote("fourth"), fourth, [indexableType(3)]), mkPrim1(new quote("length"), length, [listType]), makePrim(new quote("list"), (function (xs, err, ret) {
  return ret(xs);
}), makeVarArity([], anyType)), mkPrim(new quote("list*"), primColonListStar, makeVarArity([], anyType)), makePrim(new quote("list-ref"), primColonListRef, [listType, natType]), mkPrim2(new quote("member"), member, [anyType, listType]), mkPrim2(new quote("memq"), memq, [anyType, listType]), mkPrim2(new quote("memv"), memv, [anyType, listType]), mkPrim1(new quote("null?"), nullP, [anyType]), mkPrim1(new quote("rest"), rest, [pairType]), mkPrim1(new quote("reverse"), reverse, [listType]), mkPrim1(new quote("second"), second, [indexableType(1)]), mkPrim1(new quote("seventh"), seventh, [indexableType(6)]), mkPrim1(new quote("sixth"), sixth, [indexableType(5)]), mkPrim1(new quote("third"), third, [indexableType(2)]), makeConsPrim(idColonPosn, structColonPosn), makePredPrim(idColonPosn, structColonPosn), makeAccPrim(idColonPosn, structColonPosn, 0), makeAccPrim(idColonPosn, structColonPosn, 1), mkPrim1(new quote("char->integer"), charValGreaterThanInteger, [charType]), mkPrim1(new quote("char-alphabetic?"), charValAlphabeticP, [charType]), makePrim(new quote("char-ci<=?"), liftOrder(charValCiLessThanEqualSignP), makeVarArity([charType, charType], charType)), makePrim(new quote("char-ci<?"), liftOrder(charValCiLessThanP), makeVarArity([charType, charType], charType)), makePrim(new quote("char-ci=?"), liftOrder(charValCiEqualSignP), makeVarArity([charType, charType], charType)), makePrim(new quote("char-ci>=?"), liftOrder(charValCiGreaterThanEqualSignP), makeVarArity([charType, charType], charType)), makePrim(new quote("char-ci>?"), liftOrder(charValCiGreaterThanP), makeVarArity([charType, charType], charType)), mkPrim1(new quote("char-downcase"), charValDowncase, [charType]), mkPrim1(new quote("char-lower-case?"), charValLowerCaseP, [charType]), mkPrim1(new quote("char-numeric?"), charValNumericP, [charType]), mkPrim1(new quote("char-upcase"), charValUpcase, [charType]), mkPrim1(new quote("char-upper-case?"), charValUpperCaseP, [charType]), mkPrim1(new quote("char-whitespace?"), charValWhitespaceP, [charType]), makePrim(new quote("char<=?"), liftOrder(charValLessThanEqualSignP), makeVarArity([charType, charType], charType)), makePrim(new quote("char<?"), liftOrder(charValLessThanP), makeVarArity([charType, charType], charType)), makePrim(new quote("char=?"), liftOrder(charValEqualSignP), makeVarArity([charType, charType], charType)), makePrim(new quote("char>=?"), liftOrder(charValGreaterThanEqualSignP), makeVarArity([charType, charType], charType)), makePrim(new quote("char>?"), liftOrder(charValGreaterThanP), makeVarArity([charType, charType], charType)), mkPrim1(new quote("char?"), charValP, [anyType]), mkPrim(new quote("format"), format, makeVarArity([stringType], anyType)), mkPrim1(new quote("list->string"), listCharValGreaterThanString, [listCharType]), mkPrim2(new quote("make-string"), makeStringCharVal, [natType, charType]), makePrim(new quote("string"), (function (xs, err, ret) {
  return ret(listCharValGreaterThanString(xs));
}), makeVarArity([], charType)), mkPrim1(new quote("string->list"), stringGreaterThanCharValList, [stringType]), mkPrim1(new quote("string->number"), stringGreaterThanNumber, [stringType]), mkPrim1(new quote("string->symbol"), stringGreaterThanSymbol, [stringType]), makePrim(new quote("string-append"), (function (xs, err, ret) {
  return ret(foldr(stringAppend, "", xs));
}), makeVarArity([], stringType)), makePrim(new quote("string-ci<=?"), liftOrder(stringCiLessThanEqualSignP), makeVarArity([stringType, stringType], stringType)), makePrim(new quote("string-ci<?"), liftOrder(stringCiLessThanP), makeVarArity([stringType, stringType], stringType)), makePrim(new quote("string-ci=?"), liftOrder(stringCiEqualSignP), makeVarArity([stringType, stringType], stringType)), makePrim(new quote("string-ci>=?"), liftOrder(stringCiGreaterThanEqualSignP), makeVarArity([stringType, stringType], stringType)), makePrim(new quote("string-ci>?"), liftOrder(stringCiGreaterThanP), makeVarArity([stringType, stringType], stringType)), mkPrim1(new quote("string-copy"), identity, [stringType]), mkPrim1(new quote("string-length"), stringLength, [stringType]), makePrim(new quote("string-ref"), primColonStringRefCharVal, [stringType, natType]), makePrim(new quote("string<=?"), liftOrder(stringLessThanEqualSignP), makeVarArity([stringType, stringType], stringType)), makePrim(new quote("string<?"), liftOrder(stringLessThanP), makeVarArity([stringType, stringType], stringType)), makePrim(new quote("string=?"), liftOrder(stringEqualSignP), makeVarArity([stringType, stringType], stringType)), makePrim(new quote("string>=?"), liftOrder(stringGreaterThanEqualSignP), makeVarArity([stringType, stringType], stringType)), makePrim(new quote("string>?"), liftOrder(stringGreaterThanP), makeVarArity([stringType, stringType], stringType)), mkPrim1(new quote("string?"), string, [anyType]), makePrim(new quote("substring"), primColonSubstring, [stringType, natType, natType]), makePrim(new quote("image=?"), primColonImageEqualSignP, [imageType, imageType]), mkPrim1(new quote("image?"), imgValP, [anyType]), mkPrim3(new quote("=~"), (function (x, y, z) {
  return LessThanEqualSign(abs(minus(x, y)), z);
}), [realType, realType, nonNegativeRealType]), makePrim(new quote("eof-object?"), notImplemented(new quote("eof-object?")), [anyType]), mkPrim2(new quote("eq?"), eqP, [anyType, anyType]), makePrim(new quote("equal?"), primColonEqualP, [anyType, anyType]), makePrim(new quote("equal~?"), primColonEqualTildeP, [anyType, anyType, nonNegativeRealType]), mkPrim2(new quote("eqv?"), eqvP, [anyType, anyType]), makePrim(new quote("error"), (function (xs, err, ret) {
  return err(first(xs), second(xs));
}), [symbolType, stringType]), makePrim(new quote("exit"), notImplemented(new quote("exit")), []), mkPrim1(new quote("identity"), identity, [anyType]), makePrim(new quote("apply"), primColonApply, makeVarArity([procType, anyType], anyType)), makePrim(new quote("andmap"), primColonAndmap, [procType, listType]), makePrim(new quote("foldl"), primColonFoldl, [procType, anyType, listType]), makePrim(new quote("foldr"), primColonFoldr, [procType, anyType, listType]), makePrim(new quote("map"), primColonMap, makeVarArity([procType], listType)), makePrim(new quote("ormap"), primColonOrmap, [procType, listType]), makePrim(new quote("filter"), primColonFilter, [procType, listType]), makePrim(new quote("build-list"), primColonBuildList, [natType, procType]), makePrim(new quote("argmax"), primColonArgmax, [procType, listType]), makePrim(new quote("argmin"), primColonArgmin, [procType, listType]), makePrim(new quote("build-string"), primColonBuildString, [natType, procType]), makePrim(new quote("compose"), primColonCompose, makeVarArity([], procType)), makePrim(new quote("for-each"), primColonForEach, [procType, listType]), makePrim(new quote("memf"), primColonMemf, [procType, listType]), makePrim(new quote("quicksort"), primColonQuicksort, [listType, procType]), makePrim(new quote("sort"), primColonQuicksort, [listType, procType]), mkPrim1(new quote("procedure?"), (function (x) {
  return ((procP(x)) || (primP(x)));
}), [anyType]), makeConsPrim(idColonColor, structColonColor), makePredPrim(idColonColor, structColonColor), makeAccPrim(idColonColor, structColonColor, 0), makeAccPrim(idColonColor, structColonColor, 1), makeAccPrim(idColonColor, structColonColor, 2), makePrim(new quote("image-color?"), (function (xs, err, ret) {
  return ret(((structValP(first(xs))) && (eqP(structValType(first(xs)), idColonColor))));
}), [anyType]), mkPrim1(new quote("image-width"), imageWidth, [imageType]), mkPrim1(new quote("image-height"), imageHeight, [imageType]), mkPrim1(new quote("pinhole-x"), pinholeX, [imageType]), mkPrim1(new quote("pinhole-y"), pinholeY, [imageType]), mkPrim3(new quote("put-pinhole"), putPinhole, [imageType, numberType, numberType]), mkPrim3(new quote("move-pinhole"), movePinhole, [imageType, numberType, numberType]), mkPrim4(new quote("rectangle"), rectangle, [numberType, numberType, symbolSlashStringType, symbolSlashStringType]), mkPrim3(new quote("circle"), circle, [numberType, symbolSlashStringType, symbolSlashStringType]), mkPrim4(new quote("ellipse"), ellipse, [numberType, numberType, symbolSlashStringType, symbolSlashStringType]), mkPrim3(new quote("triangle"), triangle, [numberType, symbolSlashStringType, symbolSlashStringType]), mkPrim5(new quote("star"), star, (function () { var numGreaterThanEqualSign1 = extendType(numberType, new quote("number greater than or equal to 1"), (function (x) {
  return GreaterThanEqualSign(x, 1);
}));

return [extendType(numberType, new quote("number greater than or equal to 2"), (function (x) {
  return GreaterThanEqualSign(x, 2);
})), numGreaterThanEqualSign1, numGreaterThanEqualSign1, symbolSlashStringType, symbolSlashStringType];
 })()), mkPrim5(new quote("regular-polygon"), regularPolygon, (function () { var numGreaterThanEqualSign3 = extendType(numberType, new quote("positive integer bigger than or equal to 3"), (function (x) {
  return GreaterThanEqualSign(x, 3);
}));

return makeVarArity([numGreaterThanEqualSign3, positiveNumberType, symbolSlashStringType, symbolSlashStringType], realType);
 })()), mkPrim3(new quote("line"), line, [numberType, numberType, symbolSlashStringType]), mkPrim3(new quote("text"), text, [stringType, positiveNumberType, symbolSlashStringType]), mkPrim2(new quote("overlay"), overlay, [imageType, imageType]), mkPrim4(new quote("place-image"), placeImage, [imageType, numberType, numberType, imageType]), mkPrim6(new quote("add-line"), (function (i, x, y, z, u, c) {
  return primColonOverlaySlashXy(putPinhole(i, 0, 0), x, y, putPinhole(line(z, u, c), 0, 0));
}), [imageType, numberType, numberType, numberType, numberType, symbolSlashStringType]), mkPrim2(new quote("overlay"), overlay, [imageType, imageType]), mkPrim4(new quote("overlay/xy"), primColonOverlaySlashXy, [imageType, numberType, numberType, imageType]), mkPrim1(new quote("scene?"), (function (something) {
  return ((imageValP(something)) && (EqualSign(pinholeX(something), 0)) && (EqualSign(pinholeY(something), 0)));
}), [anyType]), mkPrim4(new quote("big-bang"), bigBang, [anyType, anyType, numberType, anyType]), mkPrim1(new quote("on-tick-event"), (function (x) {
  return onTickEvent((function (w) {
  return (function () { var res = applyProcedure(x, [w], err, (function (x) {
  return x;
}));

return errP(res) ? errGreaterThanError(res) :
  res;
 })();
}));
}), [procType]), mkPrim1(new quote("on-redraw"), (function (x) {
  return onRedraw((function (w) {
  return (function () { var res = applyProcedure(x, [w], err, (function (x) {
  return x;
}));

return errP(res) ? errGreaterThanError(res) :
  res;
 })();
}));
}), [procType]), mkPrim1(new quote("on-key-event"), (function (x) {
  return onKeyEvent((function (w, k) {
  return (function () { var res = applyProcedure(x, [w, k], err, (function (x) {
  return x;
}));

return errP(res) ? errGreaterThanError(res) :
  res;
 })();
}));
}), [procType]), mkPrim4(new quote("place-image"), placeImage, [anyType, numberType, numberType, anyType]), mkPrim2(new quote("empty-scene"), emptyScene, [numberType, numberType]), mkPrim2(new quote("key=?"), keyEqualSignP, [keyEventType, keyEventType]), mkPrim1(new quote("on-mouse-event"), (function (handler) {
  return onMouseEvent((function (w, x, y, e) {
  return (function () { var res = applyProcedure(handler, [w, x, y, e], err, (function (x) {
  return x;
}));

return errP(res) ? errGreaterThanError(res) :
  res;
 })();
}));
}), [procType]), mkPrim1(new quote("stop-when"), (function (handler) {
  return stopWhen((function (w) {
  return (function () { var res = applyProcedure(handler, [w], err, (function (x) {
  return x;
}));

return errP(res) ? errGreaterThanError(res) :
  res;
 })();
}));
}), [procType]), mkPrim4(new quote("nw:rectangle"), (function (x, y, z, a) {
  return putPinhole(rectangle(x, y, z, a), 0, 0);
}), [numberType, numberType, symbolSlashStringType, symbolSlashStringType]), mkPrim6(new quote("scene+line"), (function (i, x, y, z, u, c) {
  return primColonOverlaySlashXy(putPinhole(i, 0, 0), x, y, putPinhole(line(z, u, c), 0, 0));
}), [imageType, numberType, numberType, numberType, numberType, symbolSlashStringType])];

var imageTpSlashPrimTable = [makeConsPrim(idColonColor, structColonColor), makePredPrim(idColonColor, structColonColor), makeAccPrim(idColonColor, structColonColor, 0), makeAccPrim(idColonColor, structColonColor, 1), makeAccPrim(idColonColor, structColonColor, 2), makePrim(new quote("image-color?"), (function (xs, err, ret) {
  return ret(((structValP(first(xs))) && (eqP(structValType(first(xs)), new quote("image")))));
}), [anyType]), mkPrim1(new quote("image-width"), imgValWidth, [imageType]), mkPrim1(new quote("image-height"), imgValHeight, [imageType]), mkPrim1(new quote("pinhole-x"), imgValX, [imageType]), mkPrim1(new quote("pinhole-y"), imgValY, [imageType]), mkPrim3(new quote("put-pinhole"), putPinhole, [imageType, numberType, numberType]), mkPrim3(new quote("move-pinhole"), movePinhole, [imageType, numberType, numberType]), mkPrim4(new quote("rectangle"), rectangle, [numberType, numberType, symbolSlashStringType, symbolSlashStringType]), mkPrim3(new quote("circle"), circle, [numberType, symbolSlashStringType, symbolSlashStringType]), mkPrim4(new quote("ellipse"), ellipse, [numberType, numberType, symbolSlashStringType, symbolSlashStringType]), mkPrim3(new quote("triangle"), triangle, [numberType, symbolSlashStringType, symbolSlashStringType]), mkPrim5(new quote("star"), star, (function () { var numGreaterThanEqualSign1 = extendType(numberType, new quote("number greater than or equal to 1"), (function (x) {
  return GreaterThanEqualSign(x, 1);
}));

return [extendType(numberType, new quote("number greater than or equal to 2"), (function (x) {
  return GreaterThanEqualSign(x, 2);
})), numGreaterThanEqualSign1, numGreaterThanEqualSign1, symbolSlashStringType, symbolSlashStringType];
 })()), mkPrim5(new quote("regular-polygon"), regularPolygon, (function () { var numGreaterThanEqualSign3 = extendType(numberType, new quote("positive integer bigger than or equal to 3"), (function (x) {
  return GreaterThanEqualSign(x, 3);
}));

return makeVarArity([numGreaterThanEqualSign3, positiveNumberType, symbolSlashStringType, symbolSlashStringType], realType);
 })()), mkPrim3(new quote("line"), line, [numberType, numberType, symbolSlashStringType]), mkPrim3(new quote("text"), text, [stringType, positiveNumberType, symbolSlashStringType]), mkPrim2(new quote("overlay"), overlay, [imageType, imageType]), mkPrim4(new quote("place-image"), placeImage, [imageType, numberType, numberType, imageType])];