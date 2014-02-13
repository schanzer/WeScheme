var repl_input;
var output_list;
var repl_input_li;
var __nenv;
var __venv;
var __history_front;
var __history_back;

function formatOutput(x) {
  var res = [];

  for(var i = 0; i < x.length; i++) {
    res[i] = sexpToString(x[i]);
  }
  return res;
}

function repl2_setup(__nenv, __venv) {
  repl_input = document.getElementById("repl-input");
  repl_input_li = document.getElementById("repl-input-li");
  output_list = document.getElementById("output-list");
  __history_front = [];
  __history_back = [];
}

// adds an element to the history
function addToHistory(val) {
  while(__history_back.length > 0) {
    var temp = __history_back.pop();

    if(temp != "")
      __history_front.push(temp);
  }
  __history_front.push(val);
}

// returns the element in the history at the current index.
// Dir is the direction. 1 for up, -1 for down
// current is the currently viewed element
function popElementFromHistory(dir, current) {
  if(dir === 1 && __history_front.length > 0){
    __history_back.push(current);
    return __history_front.pop();
  } else if(dir === -1 && __history_back.length > 0) {
    __history_front.push(current);
    return __history_back.pop();
  }
  return current;
}

function readFromRepl(event) {
  var key = event.keyCode;

  if(key === 13) { // "\n"
    var aSource = repl_input.value;
    var progres;
    try {
      console.log("// LEXING: ///////////////////////////////////\nraw:");
      sexp = lex(aSource);
      console.log(sexp);
      console.log("pretty:\n"+sexpToString(sexp));
    } catch (e) {
      console.log(e);
      console.log(JSON.parse(JSON.parse(e)['structured-error']).message);
      throw Error("LEXING ERROR\n"+e.toString());
    }
    try {
      console.log("// PARSING: //////////////////////////////////\nraw:");
      var AST = parse(sexp);
      console.log(AST);
      console.log("pretty:");
      console.log(AST.join("\n"));
    } catch (e) {
      console.log(JSON.parse(JSON.parse(e)['structured-error']).message);
      throw Error("PARSING ERROR\n"+e);
    }
    try {
      console.log("// DESUGARING: //////////////////////////////\nraw");
      var ASTandPinfo = desugar(AST),
          program = ASTandPinfo[0],
          pinfo = ASTandPinfo[1];
      console.log(program);
      console.log("pretty:");
      console.log(program.join("\n"));
      console.log("pinfo:");
      console.log(pinfo);
    } catch (e) {
      console.log(JSON.parse(JSON.parse(e)['structured-error']).message);
      throw Error("DESUGARING ERROR\n"+e);
    }
    try {
      console.log("// ANALYSIS: //////////////////////////////\n");
      window.pinfo = analyze(program);
      console.log("pinfo (bound to window.pinfo):");
    } catch (e) {
      throw Error("ANALYSIS ERROR\n"+e);
    }
    
/*    try {
      var program = compile(AST);
    } catch (e) {
      console.log("COMPILE ERROR:\n");
      console.log(e);
    }
*/
    repl_input.value = ""; // clear the input
    var temp = document.createElement("li"); // make an li element
    temp.textContent = aSource; // stick the program's text in there
    output_list.insertBefore(temp, repl_input_li);
    addToHistory(aSource);

  } else if(key === 38) {
    repl_input.value = popElementFromHistory(1, repl_input.value);
    return false;
  } else if (key === 40) {
    repl_input.value = popElementFromHistory(-1, repl_input.value);
    return false;
  } else {
    return true;
  }
}