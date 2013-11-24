// Copyright (c) 2008 David Van Horn
// Licensed under the Academic Free License version 3.0

// (at dvanhorn (dot cs brandeis edu))

// HtDP Image Teachpack run-time (LIMITED) support

function imageP(x) {
  return x instanceof imgVal
    ||   isRectangle(x) || isCircle(x)
    ||   isEllipse(x)   || isTriangle(x)
    ||   isStar(x)      || isRegularPolygon(x)
    ||   isLine(x)      || isText(x)
    ||   isOverlay(x)   || isEmptyScene(x)
    ||   isPlaceImage(x);
}

function imgVal(encoding, width, height, x, y) {
  this.encoding = encoding;
  this.width = width;
  this.height = height;
  this.pinhole = make_posn(x, y);
};
function makeImgVal(encoding, width, height, x, y) {
  return new imgVal(encoding, width, height, x, y);
};
function imgValP(x) { return x instanceof imgVal; };
function imgValEncoding(x) { return x.encoding; };
function imgValWidth(x) { return x.width; };
function imgValHeight(x) { return x.height; };
function imgValX(x) { return x.x; };
function imgValY(x) { return x.y; };

function Posn(x, y) {
  this.x = x;
  this.y = y;
}

function make_posn (x, y) { return new Posn(x, y); }
function posn_x (p) { return p.x; }
function posn_y (p) { return p.y; }

// modeToString : (U Symbol String) -> String
function modeToString(s) {
  return s instanceof quote ? s.x : s;
}

// colorToString : (U Symbol String make-color) -> String
function colorToString(c) {
  return c instanceof quote ? c.x :
         c instanceof structVal ? 'rgb(' + c.fields[0] + ', '
                                             + c.fields[1] + ', '
					     + c.fields[2] + ')' :
	 /* else */   c;
}

function Rectangle (width, height, mode, color) {
  this.width = width;
  this.height = height;
  this.mode = modeToString(mode);
  this.color = colorToString(color);
  this.pinhole = make_posn(width/2, height/2); }
function isRectangle(x) { return x instanceof Rectangle; }

function rectangle(width, height, mode, color) {
  return new Rectangle(width, height, mode, color);
}


function Circle (radius, mode, color) {
  this.radius = radius;
  this.mode = modeToString(mode);
  this.color = colorToString(color);
  this.pinhole = make_posn(radius, radius);
}
function isCircle(x) { return x instanceof Circle; }

function circle(radius, mode, color) {
  return new Circle(radius, mode, color);
}

function Ellipse (width, height, mode, color) {
  this.width = width;
  this.height = height;
  this.mode = modeToString(mode);
  this.color = colorToString(color);
  this.pinhole = make_posn(width/2, height/2);
}
function isEllipse(x) { return x instanceof Ellipse; }

function ellipse(width, height, mode, color) {
  return new Ellipse(width, height, mode, color);
}

function Triangle (side, mode, color) {
  this.side = side;
  this.mode = modeToString(mode);
  this.color = colorToString(color);
  this.pinhole = make_posn(side/2, side/4*sqrt(3));
}
function isTriangle(x) { return x instanceof Triangle; }

function triangle(side, mode, color) {
  return new Triangle(side, mode, color);
}

function Star (n, outer, inner, mode, color) {
  this.n = n;
  this.outer = outer;
  this.inner = inner;
  this.mode = modeToString(mode);
  this.color = colorToString(color);
  this.pinhole = make_posn(outer, outer);
}
function isStar(x) { return x instanceof Star; }

function star(n, outer, inner, mode, color) {
  return new Star(n, outer, inner, mode, color);
}

function RegularPolygon(sides, radius, mode, color, angle) {
  this.sides = sides;
  this.radius = radius;
  this.mode = modeToString(mode);
  this.color = colorToString(color);
  this.angle = typeof angle === 'undefined' ? 0 : angle;
  this.pinhole = make_posn(radius, radius);
}
function isRegularPolygon(x) { return x instanceof RegularPolygon; }

function regularPolygon(sides, radius, mode, color, angle) {
  return new RegularPolygon(sides, radius, mode, color, angle);
}

function Line(x, y, color) {
  this.x = x;
  this.y = y;
  this.color = colorToString(color);
  this.pinhole = make_posn(0,0);
}
function isLine(x) { return x instanceof Line; }

function line(x, y, color) {
  return new Line(x, y, color);
}

function Text(str, size, color) {
  this.str = str;
  this.size = size;
  this.color = colorToString(color);
  this.pinhole = make_posn(0,0);
}
function isText(x) { return x instanceof Text; }

function text(str, size, color) {
  return new Text(str, size, color);
}

function Overlay (first, second) {
  this.first = first;
  this.second = second;
  this.pinhole = first.pinhole; }
function isOverlay(x) { return x instanceof Overlay; }

// overlay : Image Image -> Image
// Adds the pixels of the second Image onto the first image.
// The operation lines up the images via their pinholes.
function overlay(first, second) {
  return new Overlay(first, second);
}

// An Image is one of
// - rectangle(Number, Number, Mode, Color)
// - circle(Number, Mode, Color)
// - ellipse(Number, Number, Mode, Color)
// - triangle(Number, Mode, Color)
// - star(Number, Number, Number, Mode, Color)
// - regularPolygon(Number, Number, Mode, Color, Number)
// - line(Number, Number, Color)
// - text(String, Number, Color)
// - overlay(Image, Image)
// - placeImage(Image, Number, Number, Scene)
// - emptyScene(Number, Number)

// A Scene is a image with a pinhole of (0,0).

function EmptyScene(width, height) {
  this.width = width;
  this.height = height;
  this.pinhole = new Posn(0, 0);
}
function isEmptyScene(x) { return x instanceof EmptyScene; }

// emptyScene : Number Number -> Scene
function emptyScene(width, height) {
  return new EmptyScene(width, height);
}

function PlaceImage(image, x, y, scene) {
  this.image = image;
  this.x = x;
  this.y = y;
  this.scene = scene;
  this.pinhole = scene.pinhole; // Oughta be (0,0).
  }
function isPlaceImage(x) { return x instanceof PlaceImage; }

// placeImage : Image Number Number Scene -> Scene
function placeImage(image, x, y, scene) {
  return new PlaceImage(image, x, y, scene);
    }


function image_pinhole (image) { return image.pinhole; }

function pinholeX (image) {
  return imgValP(image) ? image.x : posn_x(image_pinhole(image));
}
function pinholeY (image) {
  return imgValP(image) ? image.y : posn_y(image_pinhole(image));
}
function imageWidth (image) {
  return imgValP(image)      ? image.width :
         isRectangle(image)      ? image.width :
	 isCircle(image)         ? image.radius * 2 :
	 isEllipse(image)        ? image.width :
	 isTriangle(image)       ? image.side :
	 isStar(image)           ? (image.outer > image.inner ? image.outer :
				                                image.inner)*2 :
	 isRegularPolygon(image) ? image.radius * 2 :
	 isLine(image)           ? image.x - image.pinhole.x + 1 :
	 isText(image)           ?
	   throwError("Width of text is unimplemented") :
	 isOverlay(image)        ? widthOfTwoImages(image.first, image.second) :
	 isEmptyScene(image)     ? image.width :
	 isPlaceImage(image)     ? imageWidth(image.scene) :
	   throwError("Unknown Image: " + image);
}

function imageHeight (image) {
  return imgValP(image)      ? image.height :
         isRectangle(image)      ? image.height :
	 isCircle(image)         ? image.radius * 2 :
	 isEllipse(image)        ? image.height :
	 isTriangle(image)       ? image.side / 2 * sqrt(3) :
	 isStar(image)           ? (image.outer > image.inner ? image.outer :
				                                image.inner)*2 :
	 isRegularPolygon(image) ? image.radius * 2 :
	 isLine(image)           ? image.y - image.pinhole.y + 1 :
	 isText(image)           ?
	   throwError("Height of text is unimplemented") :
	 isOverlay(image)        ? heightOfTwoImages(image.first,
						     image.second) :
	 isEmptyScene(image)     ? image.height :
	 isPlaceImage(image)     ? imageHeight(image.scene) :
	   throwError("Unknown Image: " + image);
}

function widthOfTwoImages(i1, i2) {
  var x1 = -i1.pinhole.x;
  var x2 = x1 + imageWidth(i1);
  var x3 = -i2.pinhole.x;
  var x4 = x3 + imageWidth(i2);
  return composedLineLength(x1, x2, x3, x4);
}

function heightOfTwoImages(i1, i2) {
  var y1 = -i1.pinhole.y;
  var y2 = y1 + imageHeight(i1);
  var y3 = -i2.pinhole.y;
  var y4 = y3 + imageHeight(i2);
  return composedLineLength(y1, y2, y3, y4);
}

function composedLineLength(x1, x2, x3, x4) {
  return (x1 < x3 && x2 < x4) ? x4 - x1 :
         (x1 > x3 && x2 > x4) ? x2 - x3 :
	 (x1 < x3 && x2 > x4) ? x2 - x1 :
	 x4 - x3 ;
}

function clone(obj){
  return imgValP(obj)      ? new imgValP(obj.encoding, obj.width,
						 obj.height, obj.x, obj.y) :
         isRectangle(obj)      ? rectangle(obj.width, obj.height, obj.mode,
					   obj.color) :
	 isCircle(obj)         ? circle(obj.radius, obj.mode, obj.color) :
	 isEllipse(obj)        ? ellipse(obj.width, obj.height, obj.mode,
					 obj.color) :
	 isTriangle(obj)       ? triangle(obj.side, obj.mode, obj.color) :
	 isStar(obj)           ? star(obj.n, obj.outer, obj.inner, obj.mode,
				      obj.color) :
	 isRegularPolygon(obj) ? regularPolygon(obj.sides, obj.radius,
						    obj.mode, obj.color,
						    obj.angle) :
	 isLine(obj)           ? line(obj.x, obj.y, obj.color) :
	 isText(obj)           ? text(obj.str, obj.size, obj.color) :
	 isOverlay(obj)        ? overlay(obj.first, obj.second) :
	 isEmptyScene(obj)     ? emptyScene(obj.width, obj.height) :
	 isPlaceImage(obj)     ? placeImage(obj.image, obj.x, obj.y,
					        obj.scene) :
	   throwError("Unknown Image: " + obj);
}

function movePinhole(img, dx, dy) {
  return putPinhole(img, img.pinhole.x + dx, img.pinhole.y + dy);
}

function putPinhole(img, x, y) {
  var temp = clone(img);
  temp.pinhole.x = x;
  temp.pinhole.y = y;
  return temp;
}
function throwError(x) {
  throw new Error(x);
}