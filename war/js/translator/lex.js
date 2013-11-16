// JS implementation of the Scheme read function, version 2.

// A SExp is either:
// - Atom
// - [ListOf SExp]
//
// An Atom is either:
// - Number
// - Symbol
// - String
// - Character
// - Boolean

(function () {

/////////////////////
/*      Data       */
/////////////////////

// a collection of common RegExps
var res = new Object();
res.leftListDelims = /[(\u005B\u007B]/;
res.rightListDelims = /[)\u005D\u007D]/;
res.quotes = /[\'`,]/;

// the delimiters encountered so far, which need to be matched
var delims;

/////////////////////
/* Primary Methods */
/////////////////////

// readProg : String -> [ListOf SExp]
// reads multiple sexps encoded into this string and converts them to a SExp
// datum
function readProg(str) {
  var i = 0;
  var data = [];
  delims = [];
  while(i < str.length) {
    var temp = readSExpByIndex(str, i);
    if(!(temp[0] instanceof Comment)) {
      data.push(temp[0]);
    }
    i = chewWhiteSpace(str, temp[1]);
  }
  return data;
}

// readSSFile : String -> [ListOf SExp]
// removes the first three lines of the string that contain DrScheme meta data
function readSSFile(str) {
  var i = 0;
  var crs = 0;

  while(i < str.length && crs < 3) {
    if(str.charAt(i++) == "\n") { crs++; }
  }

  var data = [];
  delims = [];
  while(i < str.length) {
    var temp = readSExpByIndex(str, i);
    if(!(temp[0] instanceof Comment)) {
      data.push(temp[0]);
    }
    i = chewWhiteSpace(str, temp[1]);
  }
  return data;
}

// readSExp : String -> SExp
// reads the first sexp encoded in this string and converts it to a SExp datum
function readSExp(str) {
  delims = [];
  var temp = readSExpByIndex(str, 0)[0];
  return temp instanceof Comment ? null : temp;
}

// readSExpByIndex : String Number -> [SExp, Number]
// reads a sexp encoded as a string starting at the i'th character and converts
// it to a SExp datum
function readSExpByIndex(str, i) {
  var p;
  p = str.charAt(i);

  i = chewWhiteSpace(str, i);

  if(i >= str.length) {
    throwError("Unexpected EOF while reading a SExp");
  }

  return res.leftListDelims.test(p) ? readList(str, i) :
         p == '"'                   ? readString(str, i) :
	 p == '#'                   ? readPoundSExp(str, i) :
	 p == ';'                   ? readLineComment(str, i) :
	 res.quotes.test(p)         ? readQuote(str, i) :
	 /* else */                   readSymbolOrNumber(str, i);
}

// readList : String Number -> [[ListOf SExp], Number]
// reads a list encoded in this string with the left delimiter at index i
function readList(str, i) {
  var openingDelim = str.charAt(i++);
  var p;
  var list = [];
  delims.push(openingDelim);

  i = chewWhiteSpace(str, i);

  while (i < str.length && !res.rightListDelims.test(str.charAt(i))) {
    var element = readSExpByIndex(str, i);
    if(!(element[0] instanceof Comment)) {
      list.push(element[0]);
    }
    i = chewWhiteSpace(str, element[1]);
  }

  if(i >= str.length) {
    throwError("read: Unexpected EOF when reading a list, "
	       + list.toString());
  }
  if(!matchingDelims(openingDelim, str.charAt(i))) {
    throwError("read: Mismatched delimiters, expected to find "
	       + otherDelim(openingDelim) + " but instead found "
	       + str.charAt(i) + " at index " + i + ".");
  }

  return [list, i+1];
}

// readString : String Number -> [String, Number]
// reads a string encoded in this string with the leftmost quotation mark
// at index i
function readString(str, i) {
  i++; // skip over the opening quotation mark
  var datum = "";

  while(i < str.length && str.charAt(i) != '"') {
    var chr = str.charAt(i++);
    if(chr == '\\') {
      chr = str.charAt(++i);
      chr = chr == 'a'  ? '\u0007' :
	    chr == 'b'  ? '\b' :
	    chr == 't'  ? '\t' :
	    chr == 'n'  ? '\n' :
	    chr == 'v'  ? '\v' :
	    chr == 'f'  ? '\f' :
	    chr == 'r'  ? '\r' :
	    chr == 'e'  ? '\u0027' :
	    chr == '"'  ? '"' :
	    chr == "'"  ? "'" :
	    chr == '\\' ? '\\' :
	    throwError("Escape sequence not supported at index: " + i
		       + ", \\" + chr);
    }
    datum += chr;
  }

  if(i >= str.length) {
    throwError("read: Unexpected EOF when reading a string, "
	       + sexpToString(sexp));
  }
  return [datum, i+1];
}

// readPoundSExp : String Number -> [SExp, Number]
// reads a sexp begining with a # sign.
function readPoundSExp(str, i) {
  i++; // skip over the pound sign
  var datum;
  if(i < str.length) {
    var p = str.charAt(i);
    datum = p == 't' || p == 'T' ? [true, i+1] :
            p == 'f' || p == 'F' ? [false, i+1] :
	    p == '\\' ? readChar(str, i-1) :
	    p == '|'  ? readMultiLineComment(str, i-1) :
	    p == ';'  ? readSExpComment(str, i-1) :
	    /* else */  throwError("Unknown pound-prefixed sexp at index: "
				   + i);
  } else {
    throwError("read: Unexpected EOF when reading a pound-prefixed sexp,"
	       + " already read: " + datum);
  }

  return datum;
}

// readChar : String Number -> [Character, Number]
// reads a character encoded in the string and returns a representative datum
function readChar(str, i) {
  i+=2; // skip over the #\
  var datum = "";
  while(i < str.length && !isDelim(str.charAt(i))
	&& !isWhiteSpace(str.charAt(i))) {
    datum += str.charAt(i++);
  }
  datum = datum == 'nul' || datum == 'null' ? new charDashVal('\u0000') :
          datum == 'backspace' ? new charDashVal('\b') :
	  datum == 'tab'       ? new charDashVal('\t') :
	  datum == 'newline'   ? new charDashVal('\n') :
	  datum == 'vtab'      ? new charDashVal('\u000B') :
	  datum == 'page'      ? new charDashVal('\u000C') :
	  datum == 'return'    ? new charDashVal('\r') :
	  datum == 'space'     ? new charDashVal('\u0020') :
	  datum == 'rubout'    ? new charDashVal('\u007F') :
	  datum.length === 1   ? new charDashVal(datum) :
	  throwError("read: Unsupported character #\\" + datum);
  return [datum, i];
}

// readMultiLineComment : String Number -> [SExp, Number]
// reads a multiline comment
function readMultiLineComment(str, i) {
  i+=2; // skip over the #|
  while(i+1 < str.length && !(str.charAt(i) == '|' && str.charAt(i+1) == '#')) {
    i++;
  }
  if(i+1 >= str.length) {
    throwError("read: Unexpected EOF when reading a multiline comment at index:"
	       + " " + i);
  }
  return [new Comment(), i+2];
}

// readSExpComment : String Number -> [SExp, Number]
// reads exactly one SExp and ignores it entirely
function readSExpComment(str, i) {
  var comment = readSExpByIndex(str, i);
  return [new Comment(), comment[1]];
}

// readLineComment : String Number -> [SExp, Number]
// reads a single line comment
function readLineComment(str, i) {
  i++; // skip over the ;
  while(i < str.length && str.charAt(i) != '\n') {
    i++;
  }
  if(i >= str.length) {
    throwError("read: Unexpected EOF when reading a line comment at index: "
	       + i);
  }
  return [new Comment(), i+1];
}

// readQuote : String Number -> [SExp, Number]
// reads a quote, quasiquote, or unquote encoded as a string
function readQuote(str, i) {
  var p = str.charAt(i);
  var symbol = p == "'" ? new quote("quote") :
	       p == "`" ? new quote("quasiquote") :
	       "";
  if(p == ',') {
    if(i+1 >= str.length) {
      throwError("read: Unexpected EOF when reading a quoted expression at"
		 + " index" + i);
    }
    if(str.charAt(i+1) == '#') {
      symbol = new quote("unquote-splicing");
    } else {
      symbol = new quote("unquote");
    }
  }
  var datumAndIndex = readSExpByIndex(str, i+1);
  return [[symbol, datumAndIndex[0]], datumAndIndex[1]];
}

// stringDatumToNumber : String -> Number
// converts the string datum to a number
// "3/3" -> 1
// "3.3" -> 3.3
// "333" -> 333
function stringDatumToNumber(str) {
  if(!isNaN(new Number(str))) {
    return new Number(str).valueOf();
  } else {
    var pivot = str.indexOf("/");

    if(pivot == -1) {
      return Number.NaN;
    } else {
      return Number(str.substring(0,pivot)) /	new Number(str.substring(pivot+1)).valueOf();
    }
  }
}

// readSymbolOrNumber : String Number String -> [SExp, Number]
// reads any number or symbol
function readSymbolOrNumber(str, i) {
  var p = str.charAt(i);

  return /[+-]/.test(p)  ? readNumberStar(str, i+1, p) :
         p == "."        ? readDigits(str, i+1, p) :
	 /[0-9]/.test(p) ? readRationalOrDecimal(str, i, "") :
	 /* else */        readSymbol(str, i, "");
}

// readNumberStar : String Number String -> [SExp, Number]
// reads any number (excluding a sign)
function readNumberStar(str, i, datum) {
  if(i >= str.length) {
    throwError("read: Unexpected EOF while reading a number or symbol at"
	       + " index " + i + ", read so far: " + datum);
  }
  var p = str.charAt(i);

  return p == "."        ? readDigits(str, i+1, datum+p) :
         /[0-9]/.test(p) ? readRationalOrDecimal(str, i+1, datum+p) :
	 /* else */        readSymbol(str, i, datum);
}

// readDigits : String Number String -> [SExp, Number]
// reads the decimal digits from the string until it hits a non decimal digit
function readDigits(str, i, datum) {
  if(i >= str.length) {
    if(isNaN(stringDatumToNumber(datum))) {
      throwError("read: Unexpected EOF while reading a number or symbol at"
		 + " index " + i + ", read so far: " + datum);
    } else {
      return [stringDatumToNumber(datum).valueOf(), i];
    }
  }

  while(i < str.length && /[0-9]/.test(str.charAt(i))) {
    datum += str.charAt(i++);
  }

  if(i >= str.length) {
    if(isNaN(stringDatumToNumber(datum))) {
      throwError("read: Unexpected EOF while reading a number or symbol at"
		 + " index " + i + ", read so far: " + datum);
    } else {
      return [stringDatumToNumber(datum).valueOf(), i];
    }
  }

  var p = str.charAt(i);

  return isDelim(p) || isWhiteSpace(p) ? [stringDatumToNumber(datum), i] :
         /* else */                      readSymbol(str, i, datum);
}

// readRationalOrDecimal : String Number -> [Number, SExp]
// reads in a ration or decimal number such as 3/5 2.34 0.3141
function readRationalOrDecimal(str, i, datum) {
  if(i >= str.length) {
    if(isNaN(stringDatumToNumber(datum))) {
      throwError("read: Unexpected EOF while reading a number or symbol at"
		 + " index " + i + ", read so far: " + datum);
    } else {
      return [stringDatumToNumber(datum).valueOf(), i];
    }
  }

  while(i < str.length && /[0-9]/.test(str.charAt(i))) {
    datum += str.charAt(i++);
  }

  if(i >= str.length) {
    if(isNaN(stringDatumToNumber(datum))) {
      throwError("read: Unexpected EOF while reading a number or symbol at"
		 + " index " + i + ", read so far: " + datum);
    } else {
      return [stringDatumToNumber(datum).valueOf(), i];
    }
  }

  var p = str.charAt(i);

  return p == "."                      ? readDigits(str, i+1, datum+p) :
         p == "/"                      ? readDigits(str, i+1, datum+p) :
	 isDelim(p) || isWhiteSpace(p) ? [stringDatumToNumber(datum), i] :
	 /* else */                      readSymbol(str, i, datum);
}

// readSymbol : String Number String -> [SExp, Number]
// reads in a symbol which can be any charcter except for certain delimiters
// as described in isValidSymbolCharP
function readSymbol(str, i, datum) {
  while(i < str.length && isValidSymbolCharP(str.charAt(i))) {
    if(str.charAt(i) == "|") {
      var temp = readVerbatimSymbol(str, i, datum);
      datum = temp[0];
      i = temp[1];
    } else {
      datum += str.charAt(i++);
    }
  }

  if(i >= str.length) {
    if(datum == "") {
      throwError("read: Unexpected EOF while reading a symbol at index "
		 + i + ".");
    } else {
      return [new quote(datum), i];
    }
  }

  var p = str.charAt(i);

  return [new quote(datum), i];
}

// readVerbatimSymbol : String Number String -> [SExp, Number]
// reads the next couple characters as is without any restraint until it reads
// a |.  It ignores both the cosing | and the opening |.
function readVerbatimSymbol(str, i, datum) {
  i++; // skip over the opening |
  while(i < str.length && str.charAt(i) != "|") {
    datum += str.charAt(i++);
  }

  if(i >= str.length) {
    throwError("Unexpected EOF while reading a verbatim symbol at index " + i
	       + ", read so far: " + datum);
  }

  i++; // skip over the closing |

  return [datum, i];
}


/////////////////////
/* Utility Methods */
/////////////////////

// some important string methods
function isWhiteSpace(str) {
  return /\s/.test(str);
}

// determines if a character string is in one of the three sets of delimiters
function isDelim(x) {
  return x == '(' || x == ')'
    ||   x == '[' || x == ']'
    ||   x == '{' || x == '}';
}

// this is returned when a comment is read
function Comment() { }

// less letters to type than throw new Error()
function throwError(x) { throw new Error(x); }

// determines if the character is valid as a part of a symbol
function isValidSymbolCharP(x) {
  return !isDelim(x) &&  !isWhiteSpace(x) && x != '"' && x != ',' && x != "'"
                                                      && x != '`' && x != ';';
}

// determines if they are matching delimiter pairs
// ie ( and ) [ and ] { and }
function matchingDelims(x, y) {
  return x == '(' && y == ')'
    ||   x == '[' && y == ']'
    ||   x == '{' && y == '}';
}

// gets the matching delim given the other delim in a pair
function otherDelim(x) {
  return x == '(' ? ')' :
         x == '[' ? ']' :
	 x == '{' ? '}' :
	 x == ')' ? '(' :
	 x == ']' ? '[' :
	 x == '}' ? '{' :
	 /* else */ throwError("otherDelim: Unknown delimiter: " + x);
}

// reads through whitespace
function chewWhiteSpace(str, i) {
  var p;
  if(i < str.length) {
    p = str.charAt(i);
    while (isWhiteSpace(p) && i < str.length) {
      p = str.charAt(++i);
    }
  }

  return i;
}
               
function sexpToString(sexp) {
  if(!imageP) {
    // if it hasn't yet been defined
    imageP = function (x) { return x instanceof imgDashVal; };
  }
  var str = sexp.toString();
  if(sexp instanceof Array) {
    str = foldl(function(x, xs) {
		  return xs + sexpToString(x) + " ";
		},
		"",
		sexp);
    str = "(" + str.substring(0,str.length-1) + ")";
  } else if (sexp instanceof proc) {
    str = "(lambda (";
    for(var i=1;i<=procDashArity(sexp); i++) {
      str += "a" + i + (i===procDashArity(sexp) ? "" : " ");
    }
    str += ") ...)";
  } else if (sexp instanceof prim) {
    str = primDashName(sexp);
  } else if (typeof sexp === "string" || sexp instanceof String) {
    str = '"' + sexp + '"';
  } else if (imageP(sexp)) {
    if(sexp instanceof imgDashVal) {
      str = '#(struct:object:image-snip% ... ...)';
    } else {
      str = '#(struct:object:cache-image-snip% ... ...)';
    }
  }

  return str;
}


/////////////////////
/* Export Bindings */
/////////////////////

window.readFile = readSSFile;
window.lex = readProg;
window.sexpToString = sexpToString;
window.read = readSExp;

})();