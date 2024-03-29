// Extracted from JavaScript The Good Part
Array.matrix = function (m, n, initial) {
    var a, i, j, mat = [];
    for (i = 0; i < m; i += 1) {
        a = [];
        for (j = 0; j < n; j += 1) {
            a[j] = initial;
        }
        mat[i] = a;
    }
    return mat;
};

Math.clamp = function(value, min, max) {
      value = value > max ? max : value;
      value = value < min ? min : value;
      return value;
};



function calculateIntersection(rect1, rect2, x, y)
{
  // prevent x|y from being null||undefined
  x = x || 0; y = y || 0;
  
  // first we have to calculate the
  // center of each rectangle and half of
  // width and height
  var dx, dy, r1={}, r2={};
  r1.cx = rect1.x+x+(r1.hw = (rect1.width /2));
  r1.cy = rect1.y+y+(r1.hh = (rect1.height/2));
  r2.cx = rect2.x + (r2.hw = (rect2.width /2));
  r2.cy = rect2.y + (r2.hh = (rect2.height/2));

  dx = Math.abs(r1.cx-r2.cx) - (r1.hw + r2.hw);
  dy = Math.abs(r1.cy-r2.cy) - (r1.hh + r2.hh);

  if (dx < 0 && dy < 0) {
    return {width:-dx,height:-dy};
  } else {
    return null;
  }
}

function calculateCollision(obj, direction, collideables, moveBy)
{
      moveBy = moveBy || {x:0,y:0};
      //moveBy.x = Math.ceil(moveBy.x);
      //moveBy.y = Math.ceil(moveBy.y);
      if ( direction != 'x' && direction != 'y' ) {
        direction = 'x';
      }
      var measure = direction == 'x' ? 'width' : 'height',
        oppositeDirection = direction == 'x' ? 'y' : 'x',
        oppositeMeasure = direction == 'x' ? 'height' : 'width',

        bounds = getBounds2(obj),
        cbounds,
        collision = null,
        cc = 0;

    // for each collideable object we will calculate the
    // bounding-rectangle and then check for an intersection
    // of the hero's future position's bounding-rectangle
    while ( !collision && cc < collideables.length ) {
      cbounds = getBounds(collideables[cc], true);
      if ( collideables[cc].isVisible ) {
        collision = calculateIntersection(bounds, cbounds, moveBy.x, moveBy.y);
      }

      if ( !collision && collideables[cc].isVisible ) {
        // if there was NO collision detected, but somehow
        // the hero got onto the "other side" of an object (high velocity e.g.),
        // then we will detect this here, and adjust the velocity according to
        // it to prevent the Hero from "ghosting" through objects
        // try messing with the 'this.velocity = {x:0,y:125};'
        // -> it should still collide even with very high values
        var wentThroughForwards  = ( bounds[direction] < cbounds[direction] && bounds[direction] + moveBy[direction] > cbounds[direction] ),
          wentThroughBackwards = ( bounds[direction] > cbounds[direction] && bounds[direction] + moveBy[direction] < cbounds[direction] ),
          withinOppositeBounds = !(bounds[oppositeDirection]+bounds[oppositeMeasure] < cbounds[oppositeDirection])
                    && !(bounds[oppositeDirection] > cbounds[oppositeDirection]+cbounds[oppositeMeasure]);

        if ( (wentThroughForwards || wentThroughBackwards) && withinOppositeBounds ) {
          moveBy[direction] = cbounds[direction] - bounds[direction];
        } else {
          cc++;
        }
      }
    }

    if ( collision ) {
      var sign = Math.abs(moveBy[direction]) / moveBy[direction];
      moveBy[direction] -= collision[measure] * sign;
    }

    return collision;
}

/*
 Calculated the boundaries of an object.
 CAUTION: <rotation> OR <skew> attributes are NOT used for this calculation!
 @method getBounds
 @param {DisplayObject} the object to calculate the bounds from
 @return {Rectangle} The rectangle describing the bounds of the object
 */
function getBounds(obj,rounded) {
  var bounds={x:Infinity,y:Infinity,width:0,height:0};
  
  if ( obj instanceof Container ) {
    var children = object.children, l=children.length, cbounds, c;
    for ( c = 0; c < l; c++ ) {
      cbounds = getBounds(children[c]);
      if ( cbounds.x < bounds.x ) bounds.x = cbounds.x;
      if ( cbounds.y < bounds.y ) bounds.y = cbounds.y;
      if ( cbounds.width > bounds.width ) bounds.width = cbounds.width;
      if ( cbounds.height > bounds.height ) bounds.height = cbounds.height;
    }
  } else {
    var gp,imgr;
    if ( obj instanceof Bitmap ) {
      gp = obj.localToGlobal(0,0);
      imgr = {width:obj.image.width,height:obj.image.height};
    } else if ( obj instanceof BitmapAnimation ) {
      gp = obj.localToGlobal(0,0);
      imgr = obj.spriteSheet._frames[obj.currentFrame];
    } else {
      return bounds;
    }

    bounds.width = imgr.width * Math.abs(obj.scaleX);
    if ( obj.scaleX >= 0 ) {
      bounds.x = gp.x;
    } else {
      bounds.x = gp.x - bounds.width;
    }

    bounds.height = imgr.height * Math.abs(obj.scaleY);
    if ( obj.scaleX >= 0 ) {
      bounds.y = gp.y;
    } else {
      bounds.y = gp.y - bounds.height;
    }
  }
  if ( rounded ) {
    bounds.x = (bounds.x + (bounds.x > 0 ? .5 : -.5)) | 0;
    bounds.y = (bounds.y + (bounds.y > 0 ? .5 : -.5)) | 0;
    bounds.width = (bounds.width + (bounds.width > 0 ? .5 : -.5)) | 0;
    bounds.height = (bounds.height + (bounds.height > 0 ? .5 : -.5)) | 0;
  }
  return bounds;
}

var getBounds2 = function(obj) {
    var bounds={x:Infinity,y:Infinity,width:0,height:0};
    if ( obj instanceof createjs.Container ) {
      bounds.x2 = -Infinity;
      bounds.y2 = -Infinity;
      var children = obj.children, l=children.length, cbounds, c;
      for ( c = 0; c < l; c++ ) {
        cbounds = getBounds2(children[c]);
        if ( cbounds.x < bounds.x ) bounds.x = cbounds.x;
        if ( cbounds.y < bounds.y ) bounds.y = cbounds.y;
        if ( cbounds.x + cbounds.width > bounds.x2 ) bounds.x2 = cbounds.x + cbounds.width;
        if ( cbounds.y + cbounds.height > bounds.y2 ) bounds.y2 = cbounds.y + cbounds.height;
        //if ( cbounds.x - bounds.x + cbounds.width  > bounds.width  ) bounds.width  = cbounds.x - bounds.x + cbounds.width;
        //if ( cbounds.y - bounds.y + cbounds.height > bounds.height ) bounds.height = cbounds.y - bounds.y + cbounds.height;
      }
      if ( bounds.x == Infinity ) bounds.x = 0;
      if ( bounds.y == Infinity ) bounds.y = 0;
      if ( bounds.x2 == Infinity ) bounds.x2 = 0;
      if ( bounds.y2 == Infinity ) bounds.y2 = 0;
      
      bounds.width = bounds.x2 - bounds.x;
      bounds.height = bounds.y2 - bounds.y;
      delete bounds.x2;
      delete bounds.y2;
    } else {
      var gp,gp2,gp3,gp4,imgr;
      if ( obj instanceof createjs.Bitmap ) {
        imgr = obj.image;
      } else if ( obj instanceof createjs.BitmapAnimation ) {
        if ( obj.spriteSheet._frames && obj.spriteSheet._frames[obj.currentFrame] && obj.spriteSheet._frames[obj.currentFrame].image ) {
          var cframe = obj.spriteSheet.getFrame(obj.currentFrame);
          imgr =  cframe.rect;
          imgr.regX = cframe.regX;
          imgr.regY = cframe.regY;
        } else {
          imgr = {};
          bounds.x = obj.x || 0;
          bounds.y = obj.y || 0;
        }
      } else {
        imgr = {};
        bounds.x = obj.x || 0;
        bounds.y = obj.y || 0;
      }

      imgr.regX = imgr.regX || 0; imgr.width  = imgr.width  || 0;
      imgr.regY = imgr.regY || 0; imgr.height = imgr.height || 0;
      bounds.regX = imgr.regX;
      bounds.regY = imgr.regY;
      
      gp  = obj.localToGlobal(0         -imgr.regX,0          -imgr.regY);
      gp2 = obj.localToGlobal(imgr.width-imgr.regX,imgr.height-imgr.regY);
      gp3 = obj.localToGlobal(imgr.width-imgr.regX,0          -imgr.regY);
      gp4 = obj.localToGlobal(0         -imgr.regX,imgr.height-imgr.regY);

      bounds.x = Math.min(Math.min(Math.min(gp.x,gp2.x),gp3.x),gp4.x);
      bounds.y = Math.min(Math.min(Math.min(gp.y,gp2.y),gp3.y),gp4.y);
      bounds.width = Math.max(Math.max(Math.max(gp.x,gp2.x),gp3.x),gp4.x) - bounds.x;
      bounds.height = Math.max(Math.max(Math.max(gp.y,gp2.y),gp3.y),gp4.y) - bounds.y;
    }
    return bounds;
  }

function nearestNeighborScale(img, scale)
{
  // to have a good looking scaling
  // we will snap all values to 0.5-steps
  // so 1.4 e.g. becomes 1.5 - you can also
  // set the snapping to 1.0 e.g.
  // however I would recommend to use only 
  // a multiple of 0.5 - but play around
  // with it and see the results
  scale = snapValue(scale,.5);
  if ( scale <= 0 ) scale = 0.5;

  // the size of the "pixels" in the new images
  // will be rounden to integer values, as drawing
  // a rect with 1.5x1.5 would result in half-transparent
  // areas
  var pixelSize = (scale+0.99) | 0;

  // getting the data-array containing all the pixel-data
  // from our source-image
  var src_canvas = document.createElement('canvas');
  src_canvas.width = img.width;
  src_canvas.height = img.height;
  var src_ctx = src_canvas.getContext('2d');
  src_ctx.drawImage(img, 0, 0);
  var src_data = src_ctx.getImageData(0, 0, img.width, img.height).data;
  
  // setting up the new, scaled image
  var dst_canvas = document.createElement('canvas');
  // just to be sure, that no pixel gets lost, when
  // we scale the image down, we add 1 and floor the
  // result
  dst_canvas.width = (img.width * scale+1) | 0;
  dst_canvas.height = (img.height * scale+1) | 0;
  var dst_ctx = dst_canvas.getContext('2d');

  // reading each pixel-data from the source
  // and drawing a scaled version of that pixel
  // to the new canvas
  var offset = 0;
  for (var y = 0; y < img.height; ++y) {
      for (var x = 0; x < img.width; ++x) {
          var r = src_data[offset++];
          var g = src_data[offset++];
          var b = src_data[offset++];
          var a = src_data[offset++] / 255;
          dst_ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
          dst_ctx.fillRect(x * scale, y * scale, pixelSize, pixelSize);
      }
  }

  return dst_canvas;
}

function snapValue(value,snap)
{
  var roundedSnap = (value/snap + (value > 0 ? .5 : -.5)) | 0;
  return roundedSnap * snap;
}

function getWidth() {
  if( typeof( window.innerWidth ) == 'number' ) {
    return window.innerWidth;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    return document.documentElement.clientWidth;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    return document.body.clientWidth;
  }
}

function getHeight() {
  if( typeof( window.innerWidth ) == 'number' ) {
    return window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    return document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientHeight || document.body.clientHeight ) ) {
    return document.body.clientHeight;
  }
}

function getCookie(c_name)
{
var c_value = document.cookie;
var c_start = c_value.indexOf(" " + c_name + "=");
if (c_start == -1)
  {
  c_start = c_value.indexOf(c_name + "=");
  }
if (c_start == -1)
  {
  c_value = null;
  }
else
  {
  c_start = c_value.indexOf("=", c_start) + 1;
  var c_end = c_value.indexOf(";", c_start);
  if (c_end == -1)
  {
c_end = c_value.length;
}
c_value = unescape(c_value.substring(c_start,c_end));
}
return c_value;
}

function setCookie(c_name,value,exdays)
{
var exdate=new Date();
exdate.setDate(exdate.getDate() + exdays);
var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
document.cookie=c_name + "=" + c_value;
}