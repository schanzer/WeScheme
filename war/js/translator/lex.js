// A SExp is either:
// - Constant x Location
// - Symbol x Location
// - [ListOf SExp] x Location
//
// A Constant is either:
// - types.Number
// - types.Symbol
// - types.String
// - types.Character

(function () {

/////////////////////
/*      Data       */
/////////////////////

// a collection of common RegExps
var res = {};
res.leftListDelims = /[(\u005B\u007B]/;
res.rightListDelims = /[)\u005D\u007D]/;
res.quotes = /[\'`,]/;
              
// the delimiters encountered so far, which need to be matched
var delims;
// line/column counters
var line;
var column;

/////////////////////
/* Primary Methods */
/////////////////////

// readProg : String -> SExp
// reads multiple sexps encoded into this string and converts them to a SExp
// datum
function readProg(str) {
//               console.log("readProg");
  var i = sCol = column = 0, sline = line = 1; // initialize all position indices
  var sexps = [];
  delims = [];
  while(i < str.length) {
    var sexp = readSExpByIndex(str, i);
    if(!(sexp instanceof Comment)) {
      sexps.push(sexp);
    }
    i = chewWhiteSpace(str, sexp.location.offset+sexp.location.span);
  }
  return sexps;
}

// readSSFile : String -> SExp
// removes the first three lines of the string that contain DrScheme meta data
function readSSFile(str) {
  var i = sCol = column = 0, sline = line = 1; // initialize all position indices
  var crs = 0;

  while(i < str.length && crs < 3) {
    if(str.charAt(i++) == "\n") { crs++; }
  }

  var sexps = [];
  delims = [];
  while(i < str.length) {
    var sexp = readSExpByIndex(str, i);
    if(!(sexp instanceof Comment)) {
      sexps.push(sexp);
    }
    i = chewWhiteSpace(str, sexp.location.offset+sexp.location.span);
  }
  return sexps;
}

// readSExp : String -> SExp
// reads the first sexp encoded in this string and converts it to a SExp datum
function readSExp(str) {
//               console.log("readSexp");
  delims = [];
  var sexp = readSExpByIndex(str, 0);
  return sexp instanceof Comment ? null : sexp;
}

// readSExpByIndex : String Number -> SExp
// reads a sexp encoded as a string starting at the i'th character and converts
// it to a SExp datum
function readSExpByIndex(str, i) {
//               console.log("readSexpByIndex: starting at "+i);
  var sCol = column, sLine = line, iStart = i;
  var p;
  p = str.charAt(i);

  i = chewWhiteSpace(str, i);

  if(i >= str.length) {
    throwError("Unexpected EOF while reading a SExp, at " +
               new Location(sCol, sLine, iStart, i-iStart));
  }
  var sexp = res.leftListDelims.test(p) ? readList(str, i) :
             p == '"'                   ? readString(str, i) :
             p == '#'                   ? readPoundSExp(str, i) :
             p == ';'                   ? readLineComment(str, i) :
             res.quotes.test(p)         ? readQuote(str, i) :
              /* else */                   readSymbolOrNumber(str, i);
   return sexp;
}

// readList : String Number -> SExp
// reads a list encoded in this string with the left delimiter at index i
function readList(str, i) {
//               console.log("readList");
  var sCol = column, sLine = line, iStart = i;
  var openingDelim = str.charAt(i++);
  var p;
  var list = [];
  delims.push(openingDelim);

  i = chewWhiteSpace(str, i);

  while (i < str.length && !res.rightListDelims.test(str.charAt(i))) {
    // track line/char values while we scan
    if(str.charAt(i) === "\n"){ line++; column = 0;}
    else { column++; }
    var sexp = readSExpByIndex(str, i);
    if(!(sexp instanceof Comment)) {
      list.push(sexp);
    }
    i = chewWhiteSpace(str, sexp.location.offset+sexp.location.span);
  }

  if(i >= str.length) {
//    throwError("read: expected a ) to close ( " +
//               new Location(sCol, sLine, iStart, i - iStart) + list.toString());
   var msg = new types.Message(["read: expected a ",
                      otherDelim(openingDelim),
                      " to close ",
                      new types.ColoredPart(openingDelim.toString(),
                                            new Location(sCol, sLine, iStart, i-iStart))
                      ]);
   var err = types.schemeError(types.incompleteExn(types.exnFailContract, msg), []);
               console.log(err);
   throw err;
  }
  if(!matchingDelims(openingDelim, str.charAt(i))) {
    throwError("read: expected a " +
               otherDelim(openingDelim) + " to close " +
               "TODO" + " but found a " +
               str.charAt(i) + " at " +
               new Location(sCol, sLine, iStart, i-iStart));
  }
  list.location = new Location(sCol, sLine, iStart, i+1-iStart);
  return list;
}

// readString : String Number -> SExp
// reads a string encoded in this string with the leftmost quotation mark
// at index i
function readString(str, i) {
//               console.log("readString");
  var sCol = column, sLine = line, iStart = i;
  i++; // skip over the opening quotation mark and char
  column++;
               
  var datum = "";

  while(i < str.length && str.charAt(i) != '"') {
    var chr = str.charAt(i++);
    // track line/char values while we scan
    if(chr === "\n"){ line++; column = 0;}
    else { column++; }

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
      throwError("Escape sequence not supported at "
                 + new Location(sCol, sLine, iStart, i-iStart)
                 + ", \\" + chr);
    }
    datum += chr;
  }

  if(i >= str.length) {
    throwError("read: expected a closing \'\"\' "
               + new Location(sCol, sLine, iStart, i-iStart)
               + " ended with " + chr);
  }
  var strng = types.string(datum);
  return new Constant(strng, new Location(sCol, sLine, iStart, i+1-iStart));
}

// readPoundSExp : String Number -> SExp
// reads a sexp begining with a # sign.
function readPoundSExp(str, i) {
//               console.log("readPoundSExp");
  var sCol = column, sLine = line, iStart = i;
  i++; // skip over the pound sign
  column++;

  var datum;
  if(i < str.length) {
    var p = str.charAt(i);
    datum =   p == 't' || p == 'T' ? [true, i+1] :
              p == 'f' || p == 'F' ? [false, i+1] :
              p == '\\' ? readChar(str, i-1) :
              p == '|'  ? readMultiLineComment(str, i-1) :
              p == ';'  ? readSExpComment(str, i-1) :
              /* else */  throwError("Unknown pound-prefixed sexp at " +
                                     new Location(sCol, sLine, iStart, i-iStart));
  } else {
    throwError("read: Unexpected EOF when reading a pound-prefixed sexp at"
               + new Location(sCol, sLine, iStart, i-iStart)
               + " already read: " + datum);
  }

  datum.location = new Location(sCol, sLine, iStart, i-iStart);
  return datum;
}

// readChar : String Number -> types.char
// reads a character encoded in the string and returns a representative datum
function readChar(str, i) {
//               console.log("readChar");
  var sCol = column, sLine = line, iStart;
  i+=2; // skip over the #\
  column+=2;
  var datum = "";
  while(i < str.length && !isDelim(str.charAt(i)) && !isWhiteSpace(str.charAt(i))) {
    // track line/column values while we scan
    if(str.charAt(i) === "\n"){ line++; column = 0;}
    else { column++; }
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
                        throwError("read: Unsupported character at " +
                                   new Location(sCol, sLine, iStart, i-iStart) +
                                   " #\\" + datum);
  var chr = new Char(datum);
  return new Contant(chr, new Location(sCol, sLine, iStart, i-iStart));
}

// readMultiLineComment : String Number -> Atom
// reads a multiline comment
function readMultiLineComment(str, i) {
  var sCol = column, sLine = line, iStart = i;
  i+=2; // skip over the #|
  column+=2;
  var txt = "";
  while(i+1 < str.length && !(str.charAt(i) == '|' && str.charAt(i+1) == '#')) {
    // track line/column values while we scan
    if(str.charAt(i) === "\n"){ line++; column = 0;}
    else { column++; }
    txt+=str.charAt(i);
    i++;
  }
  if(i+1 >= str.length) {
    throwError("read: Unexpected EOF when reading a multiline comment at "
               + new Location(sCol, sLine, iStart, i-iStart));
  }
  var atom = new Comment(txt);
  atom.location = new Location(sCol, sLine, iStart, i+2-iStart);
  return atom;
}

// readSExpComment : String Number -> Atom
// reads exactly one SExp and ignores it entirely
function readSExpComment(str, i) {
  var sCol = column, sLine = line;
  var ignore = readSExpByIndex(str, i); // we only read this to extract location
  var atom = new Comment();
  atom.location = ignore.location;  // use the location for our new, empty sexp
  return atom;
}

// readLineComment : String Number -> Atom
// reads a single line comment
function readLineComment(str, i) {
  var sCol = column, sLine = line, iStart = i;
  i++; // skip over the ;
  column++;
  var txt = "";
  while(i < str.length && str.charAt(i) != '\n') {
    // track column values while we scan
    column++;
    txt+=str.charAt(i);
    i++;
  }
  if(i >= str.length) {
    throwError("read: Unexpected EOF when reading a line comment at "
               + new Location(sCol, sLine, iStart, i-iStart));
  }
  var atom = new Comment(txt);
  atom.location = new Location(sCol, sLine, iStart, i+1-iStart);
  // at the end of the line, reset line/col values
  line++; column = 0;
  return atom;
}

// readQuote : String Number -> SExp
// reads a quote, quasiquote, or unquote encoded as a string
function readQuote(str, i) {
//               console.log("readQuote");
  var sCol = column, sLine = line, iStart = i;
  var p = str.charAt(i);
  var symbol = p == "'" ? new quote("quote") :
               p == "`" ? new quote("quasiquote") :
               "";
  if(p == ',') {
    if(i+1 >= str.length) {
      throwError("read: Unexpected EOF when reading a quoted expression at "
                 + new Location(sCol, sLine, iStart, i-iStart));
    }
    if(str.charAt(i+1) == '#') {
      symbol = new quote("unquote-splicing");
    } else {
      symbol = new quote("unquote");
    }
  }
  var sexp = readSExpByIndex(str, i+1);
  var quotedSexp = [symbol, sexp];
  quotedSexp.location = sexp.location;
  return quotedSexp;
}
               
// readSymbolOrNumber : String Number -> types.Symbol | types.Number
// reads any number or symbol
function readSymbolOrNumber(str, i) {
//               console.log("readSymbolOrNumber");
  var sCol = column, sLine = line, iStart = i;
  var p = str.charAt(i), datum = "";
  
  // if it *could* be the first char in a number, chew until we hit whitespace
  if(/[+-]/.test(p) || p==="." || /[0-9]/.test(p)){
    while(i < str.length &&
          !isWhiteSpace(str.charAt(i)) &&
          !isDelim(str.charAt(i))) {
       // track line/column values while we scan
       if(str.charAt(i) === "\n"){ line++; column = 0;}
       else { column++; }
       datum += str.charAt(i++);
    }
    var num = jsnums.fromString(datum);
    // if the string we've seen IS a Number, return it as a Constant. Otherwise bail
    if(num) return new Constant(num, new Location(sCol, sLine, iStart, i-iStart));
  }
               
  // if it was never a number (or turned out not to be), return the Symbol
  var symbl = readSymbol(str,i,datum);
  return symbl;
}

// readSymbol : String Number String -> types.Symbol
// reads in a symbol which can be any charcter except for certain delimiters
// as described in isValidSymbolCharP
function readSymbol(str, i, datum) {
//               console.log("readSymbol");
  var sCol = column-datum.length, sLine = line, iStart = i-datum.length, symbl;
  while(i < str.length && isValidSymbolCharP(str.charAt(i))) {
    // track line/column values while we scan
    if(str.charAt(i) === "\n"){ line++; column = 0;}
    else { column++; }
    if(str.charAt(i) == "|") {
      var sym = readVerbatimSymbol(str, i, datum);
      datum = sym.val;
      i = sym.location.i;
    } else {
      datum += str.charAt(i++);
    }
  }

  if(i >= str.length) {
    if(datum === "") {
      throwError("read: Unexpected EOF while reading a symbol at "
                 + new Location(sCol, sLine, iStart, i-iStart)
                 + ".");
    } else {
      symbl = types.symbol(datum);
      symbl.location = new Location(sCol, sLine, iStart, i-iStart);
      return symbl;
    }
  }

  var p = str.charAt(i);

  symbl = types.symbol(datum);
  symbl.location = new Location(sCol, sLine, iStart, i-iStart);
  return symbl;
}

// readVerbatimSymbol : String Number String -> types.Symbol
// reads the next couple characters as is without any restraint until it reads
// a |.  It ignores both the closing | and the opening |.
function readVerbatimSymbol(str, i, datum) {
//              console.log("readVerbatimSymbol");
  var sCol = column-datum.length, sLine = line, iStart = i-datum;
  i++; // skip over the opening |
  while(i < str.length && str.charAt(i) != "|") {
    // track line/column values while we scan
    if(str.charAt(i) === "\n"){ line++; column = 0;}
    else { column++; }
    datum += str.charAt(i++);
  }

  if(i >= str.length) {
    throwError("Unexpected EOF while reading a verbatim symbol at index "
               + new Location(sCol, sLine, iStart, i-iStart)
               + ", read so far: " + datum);
  }

  i++; // skip over the closing |
  var symbl = types.symbol(datum);
  symbl.location = new Location(sCol, sLine, iStart, i-iStart);
  return symbl;
}


/////////////////////
/* Utility Methods */
/////////////////////
               
// some important string methods
function isWhiteSpace(str) {
  return (/\s/).test(str);
}

// determines if a character string is in one of the three sets of delimiters
function isDelim(x) {
  return x == '(' || x == ')'
    ||   x == '[' || x == ']'
    ||   x == '{' || x == '}';
}

// this is returned when a comment is read
function Comment(txt) {this.txt = txt;}

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
  return  x == '(' ? ')' :
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
      // increment column/line counters
      if(p==="\n"){ line++; column = 0;}
      else { column++; }
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
  } else if (typeof sexp === "string" || sexp instanceof String || sexp instanceof types.string) {
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