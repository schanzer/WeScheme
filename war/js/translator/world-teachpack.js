// Tetris.

// Copyright (c) 2008 David Van Horn
// Licensed under the Academic Free License version 3.0

// (at dvanhorn (dot cs brandeis edu))

// HtDP World Teachpack run-time (LIMITED) support.

var __world = true;
var __ticker  = function (w) { return w; };
var __key_handler = function (w, k) { return w; };
var __mouse_handler = function (w, k) { return w; };
var __drawer = function (w) { return empty_scene(0,0); };
var __mouse_dragging = false;
var __width;
var __height;
var __timeout_id;
var __interval_id;
var __go;
var __canvas;
var __stop_when;
var __stop;

function redraw () {
  if(__stop_when(__world)) {
    __stop = true;
  } else {
    __canvas.setAttribute('width', __width);  // This clears the canvas.
    __canvas.setAttribute('height', __height);
    draw_image(__drawer(__world));
  }
}

function wrap_key_handler (handler) {
  return function (event) {
           if(!__stop) {
	     __world = handler(__world, key_event_to_string(event));
	     redraw();
	   }
         };
}

function wrap_mouse_handler (handler) {
  return function (event) {
    if(!__stop) {
      __world = handler(__world,
			event.layerX - __canvas.offsetLeft,
		        event.layerY - __canvas.offsetTop,
		        mouse_event_to_string(event));
      redraw();
    }
  };
}

function wrap_ticker (ticker) {
  return function () {
    if(!__stop){
      __world = __ticker(__world);
      redraw();
    }
  };
}

function bigBang (width, height, seconds, world) {
  __world = world;
  __width = width;
  __height = height;
  __stop = false;
  __go = function () {
	   __stop_when = function (x) { return false; };
           __interval_id = setInterval(wrap_ticker(__ticker),seconds * 1000);
           window.addEventListener('keydown',wrap_key_handler(__key_handler),
				   true);
	   __canvas = document.getElementById("mycanvas");
	   var mouse_handler = wrap_mouse_handler(__mouse_handler);
	   __canvas.addEventListener('mousedown',mouse_handler,true);
	   __canvas.addEventListener('mouseup',mouse_handler,true);
	   __canvas.addEventListener('mouseover',mouse_handler,true);
	   __canvas.addEventListener('mouseout',mouse_handler,true);
	   __canvas.addEventListener('mousemove',mouse_handler,true);

           };
  return true;
}

// on-tick-event : (World -> World) -> true
function onTickEvent (ticker) { __ticker = ticker; return true; }

// on-key-event : ((World, KeyEvent) -> World) -> true
function onKeyEvent (handler) { __key_handler = handler; return true; }

// on-mouse-event : ((World, MouseEvent) -> World) -> true
function onMouseEvent (handler) {
  __mouse_handler = handler;
  return true;
}

// on-redraw : (World -> Scene) -> true
function onRedraw (drawer) { __drawer = drawer ; return true; }

// end-of-time : String -> World
function endOfTime (message) {
  // Clear the timeout
  // Disable the handler
  clearInterval(__interval_id);
  alert(message);
  return __world;
}

// Convert a JavaScript event into a HtDP KeyEvent.
// A KeyEvent is either
// - a Symbol (new quote(String)), or
// - a Character (new charVal(String));
// key_event_to_string : JSEvent -> KeyEvent
function key_event_to_string (event) {
  var w = event.which;
  return w == 32 ? new quote('space') :
         w == 37 ? new quote('left')  :
         w == 38 ? new quote('up')    :
         w == 39 ? new quote('right') :
         w == 40 ? new quote('down')  :
         new charVal(String.fromCharCode(event.charCode ?
					     event.charCode :
					     event.keyCode) .toLowerCase());
}

// Convert a JavaScript event into an HtDP MouseEvent.
// A MouseEvent is one of 'button-down 'button-up 'drag 'move 'enter 'leave
// which a represented in javascript as new quote(string), where string is the
// strin representation of the symbol.
// mouse_event_to_string : JSEvent -> KeyEvent
function mouse_event_to_string (event) {
  var type = event.type;
  if(type === 'mousedown') {
    __mouse_dragging = true;
    return new quote('button-down');
  } else if (type === 'mouseup') {
    __mouse_dragging = false;
    return new quote('button-up');
  }

  return type === 'mouseover' ? new quote('enter') :
         type === 'mouseout'  ? new quote('leave') :
	 type === 'mousemove' ? __mouse_dragging ? new quote('drag') :
	                                           new quote('move') :
	 'Unknown mouse event type: ' + type;

}

function keyEqualSignP(key1, key2) {
  return symbolP(key1) && symbolP(key2) && symbolEqualSignP(key1, key2)
    ||   charValP(key1) && charValP(key2)
         && charValEqualSignP(key1, key2);
}

function keyEventP(x) { symbolP(x) || charValP(x); }

/*
// A Simple example of the world.

function world_to_image (w) {
  return place_image (rectangle(20,20,'solid','red'),10+20*w,10,
                      empty_scene(400,100)) }

function world_key_move(w, k) {
  return k === 'left'  ? w-1 :
         k === 'right' ? w+1 :
         w }

big_bang(400, 400, 5, 0);
on_key_event(world_key_move);
on_redraw(world_to_image);
on_tick_event(function (w) { return w+1});
*/

// Image -> true
function draw_image (image) {
  return draw_image_acc (image, 0, 0);
}

function draw_image_acc (image, dx, dy) {
  return isRectangle(image)      ? draw_rectangle(image, dx, dy) :
         isCircle(image)         ? draw_circle(image, dx, dy) :
	 isTriangle(image)       ? draw_triangle(image, dx, dy) :
	 isEllipse(image)        ? draw_ellipse(image, dx, dy) :
	 isStar(image)           ? draw_star(image, dx, dy) :
	 isRegularPolygon(image) ? draw_regular_polygon(image, dx, dy) :
	 isLine(image)           ? draw_line(image, dx, dy) :
	 isText(image)           ? draw_text(image, dx, dy) :
         isOverlay(image)        ? draw_overlay(image, dx, dy)   :
         isPlaceImage(image)     ? draw_place_image(image, dx, dy) :
         isEmptyScene(image)     ? draw_empty_scene(image, dx, dy) :
	 imgValP(image)      ? draw_img_val(image, dx, dy) :
         true;
}

function draw_rectangle (image, dx, dy) {
  var ctx = __canvas.getContext("2d");
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = image.color;

  ctx.beginPath();
  ctx.rect(dx-posn_x(image.pinhole),
	   dy-posn_y(image.pinhole),
	   image.width,image.height);
  ctx.closePath();

  strokeOrFill(image.mode, ctx);

  ctx.restore();
}

function draw_circle (image, dx, dy) {
  draw_ellipse(ellipse(2*image.radius, 2*image.radius,
		       image.mode, image.color),
	       dx, dy);
}

function draw_triangle(image, dx, dy) {
  var ctx = __canvas.getContext("2d");
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = image.color;
  var s = image.side / 2;
  dx = dx - image.pinhole.x;
  dy = dy - image.pinhole.y;

  ctx.beginPath();
  ctx.moveTo(dx, dy+s*sqrt(3));
  ctx.lineTo(dx+s, dy);
  ctx.lineTo(dx+2*s, dy+s*sqrt(3));
  ctx.lineTo(dx, dy+s*sqrt(3));
  ctx.closePath();
  strokeOrFill(image.mode, ctx);
  ctx.restore();
}

function draw_ellipse (image, dx, dy) {
  var ctx = __canvas.getContext("2d");
  var kappa = 0.5522847498;
  var r1 = image.width/2;
  var r2 = image.height/2;
  var w = image.width;
  var h = image.height;
  ctx.save();
  dx = dx - posn_x(image.pinhole);
  dy = dy - posn_y(image.pinhole);

  ctx.strokeStyle = ctx.fillStyle = image.color;
  ctx.beginPath();
  ctx.moveTo(       dx+0,           dy+r2);
  ctx.bezierCurveTo(dx+0,           dy+kappa*r2,
		    dx+r1-kappa*r1, dy+0,
		    dx+r1,          dy);
  ctx.bezierCurveTo(dx+r1+kappa*r1, dy,
		    dx+w,           dy+r2-kappa*r2,
		    dx+w,           dy+r2);
  ctx.bezierCurveTo(dx+w,           dy+r2+kappa*r2,
		    dx+r1+kappa*r1, dy+h,
		    dx+r1,          dy+h);
  ctx.bezierCurveTo(dx+r1-kappa*r1, dy+h,
		    dx,             dy+r2+kappa*r2,
		    dx+0,           dy+r2);
  ctx.closePath();
  strokeOrFill(image.mode, ctx);

  ctx.restore();
}

function draw_star (image, dx, dy) {
  var ctx = __canvas.getContext("2d");
  var n = image.n;
  var ro = image.outer;
  var ri = image.inner;
  dx = dx - image.pinhole.x + image.outer;
  dy = dy - image.pinhole.y + image.outer;

  var alpha = [];
  var beta = [];
  for(var i=0; i<= n; i++) {
    alpha[i] = 2*Math.PI/n*i;
    if(i < n)
      beta[i] = Math.PI*(2*i+1)/n;
  }
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = image.color;
  ctx.beginPath();
  ctx.moveTo(dx+ro*cos(alpha[0]), dy+ro*sin(alpha[0]));
  for(i=1; i<=n; i++) {
    ctx.lineTo(dx+ri*cos(beta[i-1]), dy+ri*sin(beta[i-1]));
    ctx.lineTo(dx+ro*cos(alpha[i]), dy+ro*sin(alpha[i]));
  }
  ctx.closePath();
  strokeOrFill(image.mode, ctx);

  ctx.restore();

  return true;
}

function draw_regular_polygon (image, dx, dy) {
  var ctx = __canvas.getContext("2d");
  var r = image.radius;
  var angle = image.angle;
  var s = image.sides;

  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = image.color;
  ctx.beginPath();
  ctx.moveTo(dx+r*cos(angle), dy+r*sin(angle));
  for(var n=1; n<=s; n++) {
    ctx.lineTo(dx+r*cos(2*Math.PI*n/s+angle),
	       dy+r*sin(2*Math.PI*n/s+angle));
  }
  ctx.closePath();
  strokeOrFill(image.mode, ctx);

  ctx.restore();
}

function draw_line (image, dx, dy) {
  var ctx = __canvas.getContext("2d");
  dx = dx - image.pinhole.x;
  dy = dy - image.pinhole.y;

  ctx.save();
  ctx.strokeStyle = image.color;
  ctx.beginPath();
  ctx.moveTo(dx,dy);
  ctx.lineTo(dx+image.x, dy+image.y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function draw_text(image, dx, dy) {
  var ctx = __canvas.getContext("2d");
  dx = dx - image.pinhole.x;
  dy = dy - image.pinhole.y;

  ctx.save();
  ctx.fillStyle = ctx.strokeStyle = image.color;
  ctx.mozTextStyle = ctx.font = image.size + "pt Arial";
  if(typeof ctx.strokeText === 'undefined') {
    ctx.translate(dx, dy+image.size/.75);
    ctx.mozDrawText(image.str);
  } else
    ctx.strokeText(image.str, dx, dy);
  ctx.restore();
}

function draw_empty_scene (image, dx, dy) {
  var ctx = __canvas.getContext("2d");
  ctx.strokeStyle = 'black';
  ctx.strokeRect(dx, dy, image.width, image.height);
}

function draw_overlay (overlay, dx, dy) {
  draw_image_acc(overlay.first, dx, dy);
  draw_image_acc(overlay.second,
                 dx,
                 dy);
  return true;
}

function draw_place_image (place_image, dx, dy) {
  draw_image_acc(place_image.scene, dx, dy);
  draw_image_acc(place_image.image, dx+place_image.x, dy+place_image.y);
  return true;
}

function draw_img_val (image, dx, dy) {
  var ctx = __canvas.getContext("2d");
  dx = dx - image.pinhole.x;
  dy = dy - image.pinhole.y;
  var img;
  if(typeof image.imgElement === 'undefined') {
    img = document.createElement("img");
    img.src = 'data:image/jpg;base64,' + image.encoding;
    image.imgElement = img;
  } else
    img = image.imgElement;

  ctx.save();
  ctx.drawImage(img , dx, dy);
  ctx.restore();
}

function strokeOrFill(mode, ctx) {
  if(mode === 'solid')
    ctx.fill();
  else
    ctx.stroke();
}
