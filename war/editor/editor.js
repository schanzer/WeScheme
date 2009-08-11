var savedContents = "";

// makeBreak: key-event -> void
function makeBreak(e){
  var brk = $("<br />")
             .addClass("userBreak")
             .addClass("wspace")
             .attr("contenteditable","false");
  brk.splitAndInsertAtSelection();
  brk.next().focusStart();
}

// makeSpace: key-event -> void
function makeSpace(e){
  var space =
    $("<div/>")
      .addClass("wspace")
      .addClass("space")
      .html("&nbsp;");

  space.splitAndInsertAtSelection();
  space.next().focusStart();

}

// makeLiteral : key-event -> void
function makeLiteral(e){
  var lit =
    $("<div/>")
     .addClass("literal")
     .append(
       $("<div />")
         .addClass("tick")
         .attr("contenteditable","false")
         .text('\''))
      .append(
        $("<div />")
          .addClass("body")
          .attr("contenteditable","false")
          .append(
            $("<div />")
              .addClass("data")
              .attr("contenteditable","true")
              .html("&nbsp;")
              .keypress(metaHandler(literalKeyHandler))));
  
  lit.splitAndInsertAtSelection();
  lit.children(".body").children(".data").focus();
  lit.children(".body").children(".data").contentFocus();

}

// makeString: key-event -> void
function makeString(e){
  var tar = jQuery(e.target);
  var str =
    $("<div/>")
     .addClass("string")
     .append(
       $("<div />")
         .addClass("open")
         .text('"'))
     .append(
       $("<div />")
         .addClass("body")
         .attr("contenteditable","false")
         .append(
           $("<div />")
             .addClass("data")
             .attr("contenteditable","true")
             .html("&nbsp;")
             .keypress(metaHandler(stringKeyHandler))))
     .append(
       $("<div />")
         .addClass("close")
         .addClass("gray")
         .text('"'));


  str.splitAndInsertAtSelection();
  str.children(".body").children(".data").focus();
  str.children(".body").children(".data").contentFocus();


}


// makeSexpr: key-event -> void
function makeSexpr(e){
 
  var tar = jQuery(e.target);
 
 var sexpr =  
   $("<div/>")
     .addClass("sexpr")
     .attr("contenteditable","false")
     .append(
       $("<div />")
         .addClass("open")
         .text("("))
     .append(
       $("<div />")
         .addClass("body")
         .attr("contenteditable","false")
         .append(
           $("<div />")
             .addClass("data")
             .attr("contenteditable","true")
             .html("&nbsp;")
             .keypress(metaHandler(sexprKeyHandler))))
     .append(
       $("<div />")
         .addClass("close")
         .addClass("gray")
         .text(")"));
  
  sexpr.splitAndInsertAtSelection();
  sexpr.children(".body").children(".data").focus();
  sexpr.children(".body").children(".data").contentFocus();


}

function metaHandler(handler){
  return function(e){
    var tar = $(e.target);
    if( "&nbsp;" == tar.html()){
      tar.text("");
    } else {
      handler(e);
    }

  }

}

function leaveBlock(type, e){
  var tar = $(e.target);
  var range = window.getSelection().getRangeAt(0);

  var nextNodes = tar.nextAll();
  if((0 == nextNodes.length && (range.endOffset == tar.text().length) 
     || tar.html() == "&nbsp;"
     || tar.text() == " ")){
    tar.parents(".body").parents(":first").children(":last").removeClass("gray");
    tar.parents(".body").parents(":first").next(":first").focusStart();
    e.preventDefault(); 
  }
}

function globalKeyHandler(e){
  
  switch(e.keyCode){
  case 8:                   //backspace
      backspaceKey(e);
      return;
  case 13:                   // newline
      makeBreak(e);
      e.preventDefault();
      return;
  case 37:                   // left
      leftKey(e);
      return;
  case 39:                 // right
      rightKey(e);
      return;
  case 46:
      deleteKey(e);
      return;
  }

  switch(e.charCode){
  case 32:                   // space
      makeSpace(e);
      e.preventDefault();
      return;
  default:
      return;
  }
}


// backspace: key-event -> void
function backspaceKey(e) {
    

    var aSelection = getCursorSelection();
    var tar = aSelection.node;

    // If we're at the start edge, merge with the previous sibling.
    if(aSelection.atStart()) {
	e.preventDefault();
	
        var prev = tar.prev(":first");
    
        if( prev.hasClass("wspace") ){
            prev.remove();
            prev = tar.prev();

            if( prev.hasClass("data") ){
              var loc = prev.text().length;
              tar.text(prev.text() + tar.text());
              prev.remove();              
              tar.focusAt(loc); 
              return;
            }
        } 
    
        var pred = tar.leafPredecessor();

        if( pred.hasClass("open") ){
          // Walk up from the data node
          var expr = pred.parent();
          var lastNode = expr.children(":last"); // the last node might be the same as tar
          
          //remove the parens or quotes
          expr.children(".open").remove();
          expr.children(".close").remove();

          var prev = expr.prev(":first");
          var next = expr.next(":first");
          
          if( 1 == expr.children().length && "&nbsp;" == tar.html()){
            var newTar = expr.leafPredecessor();
            newTar.focusAt(newTar.text().length);
            expr.remove();
          } else {
            var newTar = expr.leafPredecessor();
            newTar.focusAt(newTar.text().length);
            tar.parent().unwrap(); // unwrap the body
            expr.unwrap();  // unwrap the container
          }

          if( lastNode.hasClass("data") && next.hasClass("data") ){
            lastNode.text(lastNode.text() + next.text());
            next.remove();
          }


          if( tar.hasClass("data") && prev.hasClass("data") ){
            var len = prev.text().length;
            tar.text(prev.text() + tar.text());
            prev.remove();
            tar.focusAt(len);
          } else {
            tar.focusAt(0);
          }
        }
        

    } else {
	e.preventDefault();
	// Manually doing backspace deletion to avoid the introduction
	// of the weird <br _mozdirty="" type="_moz"> stuff.
	var range = window.getSelection().getRangeAt(0);
	if (range.startOffset == range.endOffset) {
	    range.setStart(range.startContainer, range.startOffset - 1);
	}
	range.deleteContents();
  }

  if( tar.text().length == 0 ){
    tar.html("&nbsp;");
  }

}

// FIXME: We may need to do something clever here, at least according to
// http://stackoverflow.com/questions/202285/trigger-a-keypress-with-jqueryand-specify-which-key-was-pressed
function leftKey(e) {

    var aSelection = getCursorSelection();
    if(aSelection.atStart()) {
	e.preventDefault();
	var predecessor = aSelection.node.predecessorWith(
	    function(p){ 
		return p.attr("contenteditable") == "true" && p.children().size() == 0;
	    });
	if (predecessor.size() > 0) {
	    predecessor.get(0).focus();
      predecessor.focusEnd();
	}

    }
}

function rightKey(e) {
    var aSelection = getCursorSelection();
    if (aSelection.atEnd()) {
	e.preventDefault();
	var successor =	aSelection.node.successorWith(
	    function(p){ 
		return p.attr("contenteditable") == "true" && p.children().size() == 0;
	    });

	if (successor.size() > 0) {
	    successor.focusStart();
	}
    }
}



function deleteKey(e) {
    var aSelection = getCursorSelection();
    //    debugLog(aSelection);
    if (aSelection.atEnd()) {
	e.preventDefault();
	//	debugLog("We should delete forward");
    }
}

// sexprKeyHandler: key-event -> void
function sexprKeyHandler(e){

  e.stopPropagation();
  var tar = $(e.target).parents(".body:first");
  
  switch(e.charCode){
  case 34:                 // quote
      makeString(e);
      e.preventDefault();
      break;
  case 39:
      makeLiteral(e);
      e.preventDefault();
      break;
  case 40:                 // paren
      makeSexpr(e);
      e.preventDefault();
      break;
  case 41:
      leaveBlock("close",e);
      break;
    default:
      globalKeyHandler(e);
  }

  setTimeout(function(){tar.indent();},1);
  return true;
}


// literalKeyHandler: key-event -> void
function literalKeyHandler(e){
  
  e.stopPropagation();
  switch(e.charCode){
    case 32:
      e.preventDefault();
      $(e.target).parents(".literal").next(".data").focusAt(0);
      makeSpace(e);
      $(e.target).parents(".literal").next(".data").remove(); //TODO This code deletes an extra empty data element
      return;
  }

  globalKeyHandler(e);
}

// stringKeyHandler: key-event -> void
function stringKeyHandler(e){
	e.stopPropagation();
  e.cancelBubble = true;

  switch(e.charCode){
      case 34:
        leaveBlock("close",e);
        break;
      case 32:
        return;
      default:
  }
	
	switch(e.keyCode){
      case 13:                   // newline
        makeBreak(e);
        e.preventDefault();
      return;
 
        break;
      default:
        globalKeyHandler(e);
    }
}


// isParen: key-event -> boolean
function isParen(e){ return (e.charCode == 40); }

// isQuote: key-event -> boolean
function isQuote(e){ return (e.charCode == 34); }


// serialize: node -> string
function serialize(node) {
    return $(node).html()
}


// unserialize: string node -> void
function unserialize(text, node) {
    $(node).html(text);
}


// doSave: -> void
// Save the contents of the buffer.
function doSave() {
    savedContents = serialize($("#editor"));
}



// doRestore: -> void
// Restore the contents of the buffer.
function doRestore() {
    unserialize(savedContents, jQuery("#editor"));
    // fixme: restore the key handlers
}

$(document).ready(function() {

    // Set the default keyhandler of the editor.
    $("#editor").keypress(sexprKeyHandler);

    // Hooking up the save and restore buttons.
    $("#save").click(function(e) {
	doSave();
	e.preventDefault();
    });
    $("#restore").click(function(e) {
	doRestore();
	e.preventDefault();
    });

    // Do an initial save.
    doSave();
});
