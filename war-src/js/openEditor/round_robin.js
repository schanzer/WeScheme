/*global goog,easyXDM*/
/*jslint browser: true, vars: true, white: true, plusplus: true, maxerr: 50, indent: 4 */

goog.provide("plt.wescheme.RoundRobin");


(function() {
    "use strict";
    //////////////////////////////////////////////////////////////////////



    // Initializes the remote procedure call between the client and
    // the given serverUrl.  Due to the peculiarities of easyXDM, we
    // need to ping the server up front to see if the connection is
    // alive: we don't get a reliable error exception if the server is
    // down from the very beginning.
    var initializeServer = function(serverUrl, afterInitialize) {
        var xhr = new easyXDM.Rpc(
            { remote: serverUrl,
              // This lazy flag must be set to avoid a very ugly
              // issue with Firefox 3.5.
              lazy: true
            }, 
            { remote: { compileProgram: {} }});
        // We initiate compilation of the empty program and see
        // if the server responds.  If it does, we add the server
        // to the list of known good servers.
        var startTime = new Date();
        xhr.compileProgram("", 
                           "",
                           function(bytecode) {
                               liveServers.push( { xhr : xhr,
                                                   url : serverUrl,
                                                   pingDelay : (new Date() - startTime) } );
                               if (! AT_LEAST_ONE_SERVER_READY) {
                                   AT_LEAST_ONE_SERVER_READY = true;
                                   afterInitialize();
                               }
                               // Sort the servers in ascending pingDelay.
                               liveServers.sort(
                                   function(x, y) {
                                       if (x.pingDelay < y.pingDelay) { 
                                           return -1;
                                       }
                                       if (x.pingDelay > y.pingDelay) {
                                           return 1;
                                       }
                                       return 0;
                                   });
                           },
                           function(err) {
                               if (err.status == 503) {
                                   initializeServer(serverUrl, afterInitialize);
                               }
                           });
    };


    var liveServers = [];

    var AT_LEAST_ONE_SERVER_READY = false;
    var initialize = function(compilation_servers, afterInitialize, onFailure) {
        if (AT_LEAST_ONE_SERVER_READY) {
            afterInitialize();
        } else {
            setTimeout(function() {
                if (! AT_LEAST_ONE_SERVER_READY) {
                    onFailure();
                }
            }, 10000);


            // Configures the evaluator to use round-robin compilation between
            // a set of servers.  Compilation will also fall back to other
            // servers under network failure.
            var i;
            for (i = 0; i < compilation_servers.length; i++) {
                initializeServer(compilation_servers[i], afterInitialize);
            }
        }
    };


    // Resets the round robin servers to the initial state.  Use
    // initialize() to reconfigure.
    var reset = function() {
        AT_LEAST_ONE_SERVER_READY = false;
        liveServers = [];
    };





    var onAllCompilationServersFailing = function(onDoneError) {
        // If all servers are failing, we simulate a 
        // compile time error with the following content:
        onDoneError(
            JSON.stringify(
                "WeScheme appears to be busy or unavailable at this time." +
                "  Please try again later."));
    };


    // Try using server n to compile the expression.  If network
    // failure occurs, try the next one in round-robin order, up
    // to liveServers.length tries.
    var tryServerN = function(n, countFailures, 
                              programName, code, 
                              onDone, onDoneError) {
 
       // try client-side parsing first, to see if we can avoid hitting the server altogether
       try{
          var sexp, AST, ASTandPinfo, local_error;
          try { //////////////////// LEX ///////////////////
            var sexp = lex(code);
          } catch(e) {
            console.log("LEXING ERROR");
            throw e;
          }
          console.log("LEXER OUTPUT (raw and prettyprinted):");
          console.log(sexp);
          console.log(sexp.map(sexpToString).join(" "));
          try{ //////////////////// PARSE ///////////////////
            var AST = parse(sexp);
          } catch(e) {
            console.log("PARSING ERROR");
            throw e;
          }
          console.log("PARSER OUTPUT (raw and prettyprinted):");
          console.log(AST);
          console.log(AST.join("\n"));
/*          try { ////////////////// DESUGAR /////////////////////
            var ASTandPinfo = desugar(AST),
                program = ASTandPinfo[0],
                pinfo = ASTandPinfo[1];
            console.log("// DESUGARING: //////////////////////////////\nraw");
            console.log(program);
            console.log("pinfo:");
            console.log(pinfo);
          } catch (e) {
            console.log("DESUGARING ERROR");
            throw e;
          }
          try {
            window.pinfo = analyze(program);
            console.log("// ANALYSIS: //////////////////////////////\nraw");
            console.log("pinfo (bound to window.pinfo):");
          } catch (e) {
            console.log("ANALYSIS ERROR");
            throw e;
          }
*/      } catch (e) {
          local_error = e;
//          console.log(local_error);
          onDoneError(local_error);
        }
        // if all systems are go, hit the server
        if (n < liveServers.length) {
            liveServers[n].xhr.compileProgram(
                programName,
                code,
                onDone,
                function(errorStruct) {
                    // If we get a 503, just try again.
                    if (errorStruct.status == 503) {
                        tryServerN(n,
                                   countFailures,
                                   programName,
                                   code,
                                   onDone,
                                   onDoneError);
                    }                    
                    // If the content of the message is the
                    // empty string, communication with
                    // the server failed.
                    else if (errorStruct.message === "") {
                        if (countFailures >= liveServers.length) {
                            onAllCompilationServersFailing(onDoneError);
                        } else {
                            tryServerN(((n + 1) % liveServers.length),
                                       countFailures + 1,
                                       programName,
                                       code,
                                       onDone,
                                       onDoneError);
                        }
                    } else {
//                        console.log("SERVER ERROR:");
//                        console.log(errorStruct.message);
                        var local = JSON.parse(local_error)["structured-error"],
                            server= JSON.parse(errorStruct.message)["structured-error"];
//                                              console.log('comparing (local to server)');

                        // remove extraneous spaces and force everything to lowercase
                        // if the results are different, we should log them to the server
                        if(!sameResults(JSON.parse(local), JSON.parse(server))){
                            logResults(code, JSON.stringify(local), JSON.stringify(server));
                        }
                        onDoneError(errorStruct.message);
                    }
                });
        } else {
            onAllCompilationServersFailing(onDoneError);
        }
    };
 
    // differentResults : local server -> boolean
    // if there's a difference, log a diff to the form and return false
    // credit to: http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
    function sameResults(x, y){
      function alphabetizeObject(obj){
        var fields = [], str="{", i;
        for (i in obj) { if (obj.hasOwnProperty(i)) fields.push(i); }
        fields.sort();
        for (var i=0;i<fields.length; i++) { str+=fields[i]+":"+obj[fields[i]]+", "; }
        return str+"}";
      }
 
      function saveDiffAndReturn(x, y){
        var local = (x instanceof Object)? alphabetizeObject(x) : x.toString(),
            server= (y instanceof Object)? alphabetizeObject(y) : y.toString();
        document.getElementById('diffString').value = "LOCAL: "+local+"\nSERVER: "+server;
        return false;
       }
 
       // if both x and y are null or undefined and exactly the same
       if (x === y) return true;

       // if they are not strictly equal, they both need to be Objects
       if ( !(x instanceof Object) || !(y instanceof Object) ) return saveDiffAndReturn(x,y);
 
       // if both are Locations, we only care about offset and span, so perform a weak comparison
       if ( x.hasOwnProperty('offset') && y.hasOwnProperty('offset') ){
          return ( (x.span === y.span) && (x.offset === y.offset) )? true : saveDiffAndReturn(x,y);
       }
 
       // does every property in x also exist in y?
       for (var p in x) {
          // empty fields can be safely removed
          if(x[p] === ""){ delete x[p]; continue; }
          // allows to compare x[ p ] and y[ p ] when set to undefined
          if ( ! x.hasOwnProperty(p) ) return saveDiffAndReturn(p+":undefined",y[p]);
          if ( ! y.hasOwnProperty(p) ) return saveDiffAndReturn(x[p],p+":undefined");
          // if they have the same strict value or identity then they are equal
          if ( x[p] === y[p] ) continue;
          // Numbers, Strings, Functions, Booleans must be strictly equal
          if ( typeof(x[p]) !== "object" ) return saveDiffAndReturn(x,y);

          // Objects and Arrays must be tested recursively
          if ( !sameResults(x[p],  y[p]) ) return false;
       }
       
       for (p in y) {
          // empty fields can be safely removed
          if(y[p] === ""){ delete y[p]; continue; }
 
          // allows x[ p ] to be set to undefined
          if ( y.hasOwnProperty(p) && !x.hasOwnProperty(p) ) return saveDiffAndReturn(p+":undefined",y[p]);
       }
       return true;
    }
 
    // logResults : code local server -> void
    // send code, local error and server error to a Google spreadsheet
    function logResults(code, local, server){
      console.log('silently logging anonymized error message to GDocs');
      document.getElementById('expr').value = code;
      document.getElementById('local').value = local.replace(/\s+/,"").toLowerCase();
      document.getElementById('server').value = server.replace(/\s+/,"").toLowerCase();
      document.getElementById('errorLogForm').submit();
    }

    // TODO: add a real LRU cache for compilations.
    // The following does a minor bit of caching for the very
    // last compilation.
    var lastCompiledName = null;
    var lastCompiledCode = null;
    var lastCompiledResult = null;

    // The name "round-robin" is historical: we really contact the
    // servers in order, starting from liveServers[0], liveServers[1], ...
    var roundRobinCompiler = 
        function(programName, code, onDone, onDoneError) {
            var onDoneWithCache = function() {

                // Cache the last result:
                var result = [].slice.call(arguments, 0);
                lastCompiledName = programName;
                lastCompiledCode = code;
                lastCompiledResult = result;

                return onDone.apply(null, arguments);
            };
            
            if ((programName === lastCompiledName) &&
                (code === lastCompiledCode)) {
                return onDone.apply(null, lastCompiledResult);
            }


            if (liveServers.length > 0) {
                tryServerN(0, 0,
                           programName, code, onDoneWithCache, onDoneError);
            } else {
                onAllCompilationServersFailing(onDoneError);
            }
        };

    //////////////////////////////////////////////////////////////////////

    plt.wescheme.RoundRobin.initialize = initialize;
    plt.wescheme.RoundRobin.roundRobinCompiler = roundRobinCompiler;

    
    // The following exports are for debugging purposes.
    plt.wescheme.RoundRobin.reset = reset;
    plt.wescheme.RoundRobin.liveServers = liveServers;
}());
