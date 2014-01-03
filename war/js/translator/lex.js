/* TODO
 - JSLint
TODO:
 vector lexing: http://docs.racket-lang.org/reference/reader.html#%28part._parse-vector%29
 better lexing of numbers
 */

//////////////////////////////////////////////////////////////////////////////
////////////////////////////////// LEXER OBJECT //////////////////////////////
//////////////////////////////////////////////////////////////////////////////

// Parse a program into SExps
//
// A SExp is either:
// - Atom x Location
// - [ListOf SExp] x Location
//
// An Atom is either:
// - numberExpr
// - symbolExpr
// - stringExpr
// - booleanExpr
// - charExpr

(function () {
 'use strict';
    /////////////////////
    /*      Data       */
    /////////////////////

    // a collection of common RegExps
    var res = {};
    res.leftListDelims = /[(\u005B\u007B]/;
    res.rightListDelims = /[)\u005D\u007D]/;
    res.quotes = /[\'`,]/;
 
    // the delimiters encountered so far, and line and column
    var delims, line, column, sCol, sLine;

    // the location struct
    var Location = function(sCol, sLine, offset, span, source){
      this.sCol   = sCol;   // starting index into the line
      this.sLine  = sLine;  // starting line # (1-index)
      this.offset = offset; // ch index of lexeme start, from beginning
      this.span   = span;   // num chrs between lexeme start and end
      this.source = source; // [OPTIONAL] id of the containing DOM element
      this.start  = function(){ return new Location("", "", this.offset, 1); };
      this.end    = function(){ return new Location("", "", this.offset+this.span-1, 1); };
      this.toString = function(){
        return "start ("+this.sCol+", "+this.sLine+"), end ("+this.eCol+","+this.eLine+") index "+this.i;
      };
      this.toJSON = function(){
        return {line: this.sLine.toString(), id: this.source || "<definitions>", span: this.span.toString(),
               offset: (this.offset+1).toString(), column: this.sCol.toString()};
      };
    };

    /////////////////////
    /* Utility Methods */
    /////////////////////
                   
    // some important string methods
    function isWhiteSpace(str) {
      return (/\s/).test(str);
    }

    // determines if a character string is in one of the three sets of delimiters
    function isDelim(x) {
      return x === '(' || x === ')'
        ||   x === '[' || x === ']'
        ||   x === '{' || x === '}';
    }

    // this is returned when a comment is read
    function Comment(txt) {this.txt = txt;}

    // determines if the character is valid as a part of a symbol
    function isValidSymbolCharP(x) {
      return !isDelim(x) && !isWhiteSpace(x)
            && x !== '"' && x !== ',' && x !== "'"
                        && x !== '`' && x !== ';';
    }

    // determines if they are matching delimiter pairs
    // ie ( and ) [ and ] { and }
    function matchingDelims(x, y) {
      return (x === '(' && y === ')')
        ||   (x === '[' && y === ']')
        ||   (x === '{' && y === '}');
    }

    // gets the matching delim given the other delim in a pair
    function otherDelim(x) {
      return  x === '(' ? ')' :
              x === '[' ? ']' :
              x === '{' ? '}' :
              x === ')' ? '(' :
              x === ']' ? '[' :
              x === '}' ? '{' :
    /* else */ throwError(new types.Message(["otherDelim: Unknown delimiter: ", x]));
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

    Array.prototype.toString = function () {return this.join(" "); };
    function sexpToString(sexp) {
      var str="";
      if(sexp instanceof Array) {
        str += "(" + sexp.map(sexpToString).toString() + ")";
      } else {
        str += sexp.toString();
      }

      return str;
    }

                   
    /////////////////////
    /* Primary Methods */
    /////////////////////

    // readProg : String -> SExp
    // reads multiple sexps encoded into this string and converts them to a SExp
    // datum
    function readProg(str) {
      var i = 0; sCol = column = 0; sLine = line = 1; // initialize all position indices
      var sexp,
          sexps = [];
      delims = [];
      // get rid of any whitespace at the start of the string
      i = chewWhiteSpace(str, 0);
      while(i < str.length) {
        sexp = readSExpByIndex(str, i);
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
      var i = 0; sCol = column = 0; sline = line = 1; // initialize all position indices
      var crs = 0;

      while(i < str.length && crs < 3) {
        if(str.charAt(i++) === "\n") { crs++; }
      }

      var sexp, sexps = [];
      delims = [];
      while(i < str.length) {
        sexp = readSExpByIndex(str, i);
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
      delims = [];
      var sexp = readSExpByIndex(str, 0);
      return sexp instanceof Comment ? null : sexp;
    }

    // readSExpByIndex : String Number -> SExp
    // reads a sexp encoded as a string starting at the i'th character and converts
    // it to a SExp datum
    function readSExpByIndex(str, i) {
      sCol = column; sLine = line; var iStart = i;
      var p;
      p = str.charAt(i);

      i = chewWhiteSpace(str, i);

      if(i >= str.length) {
        throwError(new types.Message(["Unexpected EOF while reading a SExp"])
                                 ,new Location(sCol, sLine, iStart, i-iStart));
      }
       var sexp = res.rightListDelims.test(p) ?
                   throwError(new types.Message(["read : expected a "+otherDelim(p)+" to open "
                                                , new types.ColoredPart(p, new Location(sCol, sLine, iStart, 1))])
                              ,new Location(sCol, sLine, iStart, i-iStart)) :
                 res.leftListDelims.test(p) ? readList(str, i) :
                 p === '"'                  ? readString(str, i) :
                 p === '#'                  ? readPoundSExp(str, i) :
                 p === ';'                  ? readLineComment(str, i) :
                 res.quotes.test(p)         ? readQuote(str, i) :
                  /* else */                   readSymbolOrNumber(str, i);
       return sexp;
    }

    // readList : String Number -> SExp
    // reads a list encoded in this string with the left delimiter at index i
    function readList(str, i) {
      var sCol = column, sLine = line, iStart = i;
      var openingDelim = str.charAt(i++);
      column++; // count the openingDelim
      var sexp, list = [];
      delims.push(openingDelim);
                   
      i = chewWhiteSpace(str, i);

      while (i < str.length && !res.rightListDelims.test(str.charAt(i))) {
        // check for newlines
        if(str.charAt(i) === "\n"){ line++; column = 0;}
        sexp = readSExpByIndex(str, i);

        if(!(sexp instanceof Comment)) {
          list.push(sexp);
        }

        i = chewWhiteSpace(str, sexp.location.offset+sexp.location.span);
      }

      if(i >= str.length) {
         var msg = new types.Message(["read: expected a ",
                                      otherDelim(openingDelim),
                                      " to close ",
                                      new types.ColoredPart(openingDelim.toString(),
                                                            new Location(sCol, sLine, iStart, 1))
                                      ]);
         throwError(msg, new Location(sCol, sLine, iStart, i-iStart));
      }
      if(!matchingDelims(openingDelim, str.charAt(i))) {
         var msg = new types.Message(["read: expected a ",
                                      otherDelim(openingDelim),
                                      " to close ",
                                      new types.ColoredPart(openingDelim.toString(),
                                                            new Location(sCol, sLine, iStart, 1)),
                                      " but found a ",
                                      new types.ColoredPart(str.charAt(i).toString(),
                                                            new Location(column, line, i, 1))
                                      ]);
         throwError(msg, new Location(sCol, sLine, iStart, 1));
      }
      // add 1 to span to count the closing delimeter
      column++;
      list.location = new Location(sCol, sLine, iStart, i-iStart+1);
      return list;
    }

    // readString : String Number -> SExp
    // reads a string encoded in this string with the leftmost quotation mark
    // at index i
    function readString(str, i) {
      var sCol = column, sLine = line, iStart = i;
      i++; // skip over the opening quotation mark and char
      column++;
                   
      var chr, datum = "";

      while(i < str.length && str.charAt(i) !== '"') {
        chr = str.charAt(i++);
        // track line/char values while we scan
        if(chr === "\n"){ line++; column = 0;}
        else { column++; }

        if(chr === '\\') {
          chr = str.charAt(++i);
          chr = chr === 'a'  ? '\u0007' :
          chr === 'b'  ? '\b' :
          chr === 't'  ? '\t' :
          chr === 'n'  ? '\n' :
          chr === 'v'  ? '\v' :
          chr === 'f'  ? '\f' :
          chr === 'r'  ? '\r' :
          chr === 'e'  ? '\u0027' :
          chr === '"'  ? '"' :
          chr === "'"  ? "'" :
          chr === '\\' ? '\\' :
          throwError(new types.Message(["Escape sequence not supported:", ", \\", chr]),
                      new Location(sCol, sLine, iStart, i-iStart));
        }
        datum += chr;
      }

      if(i >= str.length) {
        throwError(new types.Message(["read: expected a closing \'\"\' "])
                   , new Location(sCol, sLine, iStart, i-iStart));
      }
      var strng = new stringExpr(datum);
      strng.location = new Location(sCol, sLine, iStart, i+1-iStart);
      return strng;
    }

    // readPoundSExp : String Number -> SExp
    // reads a sexp begining with a # sign.
    function readPoundSExp(str, i) {
      var sCol = column, sLine = line, iStart = i, datum;
      i++; column++; // skip over the pound sign
      

      if(i < str.length) {
        var p = str.charAt(i);
        switch(p){
          case 't':  // test for both forms of true
          case 'T':  datum = new booleanExpr("true"); i++; break;
          case 'f':  // test for both forms of false
          case 'F':  datum = new booleanExpr("false"); i++; break;
          // for all others, back up a character and keep reading
          case '\\': datum = readChar(str, i-1);
                     i+= datum.location.span-1; break;
          case '|':  datum = readMultiLineComment(str, i-1);
                     i+= datum.location.span; break;
          case ';':  datum = readSExpComment(str, i+1);
                     i+= datum.location.span+1; break;
          case '(':
          case '[':
          case '{':  var sexp = readList(str, i),
                    datum = new vectorExpr(sexp);
                    datum.location = sexp.location;
                    i+= datum.location.span; break;
          default: throwError(new types.Message(["Unknown pound-prefixed sexp: #", p]),
                              new Location(sCol, sLine, iStart, i-iStart));
         }
      } else {
        throwError(new types.Message(["read: Unexpected EOF when reading a pound-prefixed sexp: #", datum]),
                   new Location(sCol, sLine, iStart, i-iStart));
      }
      datum.location = new Location(sCol, sLine, iStart, i-iStart);
                   console.log(datum);
      return datum;
    }

    // readChar : String Number -> types.char
    // reads a character encoded in the string and returns a representative datum
    function readChar(str, i) {
      var sCol = column, sLine = line, iStart = i;
      i+=2;  column+=2; // skip over the #\\
      var datum = "";
      while(i < str.length && !isDelim(str.charAt(i)) && !isWhiteSpace(str.charAt(i))) {
        // check for newlines
        if(str.charAt(i) === "\n"){ line++; column = 0;}
        else { column++; }
        datum += str.charAt(i++);
        column++;
      }
      datum = datum === 'nul' || datum === 'null' ? '\u0000' :
                          datum === 'backspace' ? '\b' :
                          datum === 'tab'       ? '\t' :
                          datum === 'newline'   ? '\n' :
                          datum === 'vtab'      ? '\u000B' :
                          datum === 'page'      ? '\u000C' :
                          datum === 'return'    ? '\r' :
                          datum === 'space'     ? '\u0020' :
                          datum === 'rubout'    ? '\u007F' :
                          datum.length === 1   ? datum :
                            throwError(new types.Message(["read: Unsupported character: #\\",datum]),
                                       new Location(sCol, sLine, iStart, i-iStart));
      var chr = new charExpr(datum);
      chr.location = new Location(sCol, sLine, iStart, i-iStart);
      return chr;
    }

    // readMultiLineComment : String Number -> Atom
    // reads a multiline comment
    function readMultiLineComment(str, i) {
      var sCol = column, sLine = line, iStart = i;
      i+=2; // skip over the #|
      column+=2;
      var txt = "";
      while(i+1 < str.length && !(str.charAt(i) === '|' && str.charAt(i+1) === '#')) {
        // check for newlines
        if(str.charAt(i) === "\n"){ line++; column = 0;}
        txt+=str.charAt(i);
        i++; column++;
      }
      if(i+1 >= str.length) {
        throwError(new types.Message(["read: Unexpected EOF when reading a multiline comment"])
                   ,new Location(sCol, sLine, iStart, i-iStart));
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
      i =+ ignore.location.span;
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
      while(i < str.length && str.charAt(i) !== '\n') {
        // track column values while we scan
        column++;
        txt+=str.charAt(i);
        i++;
      }
      if(i > str.length) {
        throwError(new types.Message(["read: Unexpected EOF when reading a line comment"]),
                   new Location(sCol, sLine, iStart, i-iStart));
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
      var sCol = column, sLine = line, iStart = i;
      var p = str.charAt(i);
      var symbol = p == "'" ? new symbolExpr("quote") :
                   p == "`" ? new symbolExpr("quasiquote") :
                   "";
      if(p == ',') {
        if(i+1 >= str.length) {
          throwError("read: Unexpected EOF when reading a quoted expression at "
                     + new Location(sCol, sLine, iStart, i-iStart));
        }
        if(str.charAt(i+1) == '#') {
          symbol = new symbolExpr("unquote-splicing");
        } else {
          symbol = new symbolExpr("unquote");
        }
      }
      var sexp = readSExpByIndex(str, i+1);
      var quotedSexp = [symbol, sexp];
      quotedSexp.location = sexp.location;
      return quotedSexp;
    }
                   
    // readSymbolOrNumber : String Number -> symbolExpr | types.Number
    // reads any number or symbol
    function readSymbolOrNumber(str, i) {
      var sCol = column, sLine = line, iStart = i;
      var p = str.charAt(i), datum = "";

      // if it *could* be the first char in a number, chew until we hit whitespace
      if(/[+-]/.test(p) || p==="." || /[0-9]/.test(p)){
        while(i < str.length &&
              !isWhiteSpace(str.charAt(i)) &&
              !isDelim(str.charAt(i))) {
           // check for newlines
           if(str.charAt(i) === "\n"){ line++; column = 0;}
           datum += str.charAt(i++);
          column++;
        }
        var num = jsnums.fromString(datum);
        // if the string we've seen IS a Number, return it as a numberExpr. Otherwise bail
         if(num){
           var sexp = new numberExpr(datum);
           sexp.location = new Location(sCol, sLine, iStart, i-iStart);
           return sexp;
         }
      }
                   
      // if it was never a number (or turned out not to be), return the Symbol
      var symbl = readSymbol(str,i,datum);
      return symbl;
    }

    // readSymbol : String Number String -> symbolExpr
    // reads in a symbol which can be any charcter except for certain delimiters
    // as described in isValidSymbolCharP
    function readSymbol(str, i, datum) {
      var sCol = column-datum.length, sLine = line, iStart = i-datum.length, symbl;
      while(i < str.length && isValidSymbolCharP(str.charAt(i))) {
        // check for newlines
        if(str.charAt(i) === "\n"){ line++; column = 0;}
        if(str.charAt(i) === "|") {
          var sym = readVerbatimSymbol(str, i, datum);
          datum = sym.val;
          i = sym.location.i;
        } else {
          datum += str.charAt(i++);
          column++;
        }
      }

      if((i >= str.length) && (datum === "")) {
        throwError(new types.Message(["read: Unexpected EOF while reading a symbol"])
                  ,new Location(sCol, sLine, iStart, i-iStart));
      }

      var p = str.charAt(i);

      symbl = (datum==="true" || datum==="false")? new booleanExpr(datum) : new symbolExpr(datum);
      symbl.location = new Location(sCol, sLine, iStart, i-iStart);
      return symbl;
    }

    // readVerbatimSymbol : String Number String -> symbolExpr
    // reads the next couple characters as is without any restraint until it reads
    // a |.  It ignores both the closing | and the opening |.
    function readVerbatimSymbol(str, i, datum) {
      var sCol = column-datum.length, sLine = line, iStart = i-datum;
      i++; // skip over the opening |
      while(i < str.length && str.charAt(i) !== "|") {
        // check for newlines
        if(str.charAt(i) === "\n"){ line++; column = 0;}
        datum += str.charAt(i++);
        column++;
      }

      if(i >= str.length) {
        throwError(new types.Message(["Unexpected EOF while reading a verbatim symbol: ", datum])
                   ,new Location(sCol, sLine, iStart, i-iStart));
      }

      i++; // skip over the closing |
      symbl = (datum==="true" || datum==="false")? new booleanExpr(datum) : new symbolExpr(datum);
      symbl.location = new Location(sCol, sLine, iStart, i-iStart);
      return symbl;
    }

    /////////////////////
    /* Export Bindings */
    /////////////////////

    window.readFile = readSSFile;
    window.lex = readProg;
    window.sexpToString = sexpToString;
    window.read = readSExp;

})();