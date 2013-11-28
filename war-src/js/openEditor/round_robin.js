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
          var sexp, AST, progres, result;
          try { //////////////////// LEX ///////////////////
            var sexp = lex(code);
          } catch(e) {
            console.log("LEXING ERROR\n"+e);
            throw e;
          }
          console.log("LEXER OUTPUT (raw and prettyprinted):");
          console.log(sexp);
          console.log(sexpToString(sexp));
          try{ //////////////////// PARSE ///////////////////
            var AST = parse(sexp);
          } catch(e) {
            console.log("PARSING ERROR\n"+e);
            throw e;
          }
          console.log("PARSER OUTPUT (raw and prettyprinted):");
          console.log(AST);
          console.log(AST.join("\n"));
          try { ////////////////// DESUGAR /////////////////////
            var AST = desugarProgram(AST);
            console.log("DESUGARING:\nraw:");
            console.log(AST);
            console.log("pretty:");
            console.log(AST.join("\n"));
          } catch (e) {
            console.log("DESUGARING ERROR\n"+e);
            throw e;
          }
        } catch (e) {
           return onDoneError(e);
        }
                   

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
                        onDoneError(errorStruct.message);
                    }
                });
        } else {
            onAllCompilationServersFailing(onDoneError);
        }
    };


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
