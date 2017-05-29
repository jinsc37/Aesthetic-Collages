// dropzone event handlers
var dropzone;
dropzone = document.getElementById("dropzone");
dropzone.addEventListener("dragenter", dragenter, false);
dropzone.addEventListener("dragover", dragover, false);
dropzone.addEventListener("drop", drop, false);
//
function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
  }
//
function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}
//
function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;

  handleFiles(files);
}
//
function handleFiles(files) {
  var div = document.createElement('div');
  div.id = 'loading';
  div.innerHTML = 'Loading...'
  document.body.appendChild(div);

    for (var i = 0; i < files.length; i++) {

      // get the next file that the user selected
      var file = files[i];
      var imageType = /image.*/;

      // don't try to process non-images
      if (!file.type.match(imageType)) {
        continue;
      }

      // a seed img element for the FileReader
      var img = document.createElement("img");
      img.classList.add("obj");
      img.file = file;

      // get an image file from the user
      // this uses drag/drop, but you could substitute file-browsing
      var reader = new FileReader();
      reader.onload = (function(aImg) {
        return function(e) {
          aImg.onload = function() {

            // draw the aImg onto the canvas
            var canvas = document.getElementById("myCanvas");
            var ctx = canvas.getContext("2d");
            canvas.width = aImg.width;
            canvas.height = aImg.height;
            canvas.style.visibility='hidden';
            ctx.drawImage(aImg, 0, 0);

            var KonvaImg = new Konva.Image({
                //width: 200,
                //height: 137
                stroke: 'white',
                strokeWidth: 3
            });

            var KonvaImgGroup = new Konva.Group({
                x: 0,
                y: 0,
                draggable: true
            });
            //Display highlight when image is dragged
            KonvaImgGroup.on('dragmove',function() {
              highlight(KonvaImgGroup.get('Image')[0]);
            });

            //var factor = window.innerWidth * window.innerWidth
            layer.add(KonvaImgGroup);
            KonvaImgGroup.add(KonvaImg);
            addAnchor(KonvaImgGroup, 0, 0, 'topLeft');
            addAnchor(KonvaImgGroup, aImg.width, 0, 'topRight');
            addAnchor(KonvaImgGroup, aImg.width, aImg.height, 'bottomRight');
            addAnchor(KonvaImgGroup, 0, aImg.height, 'bottomLeft');

            addRectAnchor(KonvaImgGroup, aImg.width/2, 0, 'top');
            addRectAnchor(KonvaImgGroup, aImg.width/2, aImg.height, 'bottom');
            addRectAnchor(KonvaImgGroup, aImg.width, aImg.height/2, 'right');
            addRectAnchor(KonvaImgGroup, 0, aImg.height/2, 'left');

            // make the jpeg image
            var newImg = new Image();
            newImg.onload = function() {
              //newImg.id = "newImg";
              //newImg.src = "img1.jpg";
              //newImg.draggable = 'true'
              KonvaImg.image(newImg);
              resize();
              sort_layout(files.length);
              //layer.draw();
            }
              //newImg.src = canvas.toDataURL('image/jpeg');
              newImg.src = canvas.toDataURL();
              canvas.width = 1;
              canvas.height = 1;
            }
            // e.target.result is a dataURL for the image
          aImg.src = e.target.result;
        };
      })(img);
      reader.readAsDataURL(file);
    } // end for
} // end handleFiles



// Konva Image Resize, Drag
function update(activeAnchor) {
    var group = activeAnchor.getParent();
    var topLeft = group.get('.topLeft')[0];
    var topRight = group.get('.topRight')[0];
    var bottomRight = group.get('.bottomRight')[0];
    var bottomLeft = group.get('.bottomLeft')[0];
    var top = group.get('.top')[0];
    var bottom = group.get('.bottom')[0];
    var right = group.get('.right')[0];
    var left = group.get('.left')[0];
    var image = group.get('Image')[0];
    var anchorX = activeAnchor.getX();
    var anchorY = activeAnchor.getY();

    var width = image.width();
    var height = image.height();

    var fac_yx = height / width;

    // update anchor positions
    switch (activeAnchor.getName()) {
        case 'topLeft':
          activeAnchor.setY(bottomRight.getY() + ((anchorX-bottomRight.getX()) * fac_yx));

          topRight.setY(activeAnchor.getY());
          bottomLeft.setX(anchorX);

          top.setX(bottomRight.getX() - (topRight.getX() - topLeft.getX())/2 - 5);
          top.setY(activeAnchor.getY() - 5);
          left.setX(anchorX - 5);
          left.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          bottom.setX(bottomRight.getX() - (topRight.getX() - topLeft.getX())/2 - 5);
          right.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          break;
        case 'topRight':
          activeAnchor.setY(bottomLeft.getY() + (-(anchorX-bottomLeft.getX()) * fac_yx));

          topLeft.setY(activeAnchor.getY());
          bottomRight.setX(anchorX);

          top.setX(topLeft.getX() + (topRight.getX() - topLeft.getX())/2 - 5);
          top.setY(activeAnchor.getY() - 5);
          left.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          bottom.setX(topLeft.getX() + (topRight.getX() - topLeft.getX())/2 - 5);
          right.setX(anchorX - 5);
          right.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          break;
        case 'bottomRight':
          activeAnchor.setY(topLeft.getY() + ((anchorX-topLeft.getX()) * fac_yx));

          bottomLeft.setY(activeAnchor.getY());
          topRight.setX(anchorX);

          top.setX(topLeft.getX() + (topRight.getX() - topLeft.getX())/2 - 5);
          left.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          bottom.setX(topLeft.getX() + (topRight.getX() - topLeft.getX())/2 - 5);
          bottom.setY(activeAnchor.getY() - 5);
          right.setX(anchorX - 5);
          right.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          break;
        case 'bottomLeft':
          activeAnchor.setY(topRight.getY() + (-(anchorX-topRight.getX()) * fac_yx));

          bottomRight.setY(activeAnchor.getY());
          topLeft.setX(anchorX);

          top.setX(bottomRight.getX() - (topRight.getX() - topLeft.getX())/2 - 5);
          left.setX(anchorX - 5);
          left.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          bottom.setX(topRight.getX() - (topRight.getX() - topLeft.getX())/2 - 5);
          bottom.setY(activeAnchor.getY() - 5);
          right.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          break;

        case 'top':
          activeAnchor.setX(topLeft.getX() + (topRight.getX() - topLeft.getX())/2 - 5);
          activeAnchor.setY(anchorY - 5);

          topLeft.setY(anchorY);
          topRight.setY(anchorY);
          left.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          right.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          break;
        case 'bottom':
          activeAnchor.setX(topLeft.getX() + (topRight.getX() - topLeft.getX())/2 - 5);
          activeAnchor.setY(anchorY - 5);

          bottomLeft.setY(anchorY);
          bottomRight.setY(anchorY);
          left.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          right.setY(bottomLeft.getY() - (bottomLeft.getY() - topLeft.getY())/2 - 5);
          break;
        case 'right':
          activeAnchor.setX(anchorX - 5);
          activeAnchor.setY(bottomLeft.getY() - height/2 - 5);

          topRight.setX(anchorX);
          bottomRight.setX(anchorX);
          top.setX(topLeft.getX() + (topRight.getX() - topLeft.getX())/2 - 5);
          bottom.setX(topLeft.getX() + (topRight.getX() - topLeft.getX())/2 - 5);
          break;
        case 'left':
          activeAnchor.setX(anchorX - 5);
          activeAnchor.setY(bottomLeft.getY() - height/2 - 5);

          topLeft.setX(anchorX);
          bottomLeft.setX(anchorX);
          top.setX(bottomRight.getX() - (topRight.getX() - topLeft.getX())/2 - 5);
          bottom.setX(bottomRight.getX() - (topRight.getX() - topLeft.getX())/2 - 5);
          break;
    }
    image.position(topLeft.position());
    highlight(image);
    //console.log(topLeft.position())
    var width_new = topRight.getX() - topLeft.getX();
    var height_new = bottomLeft.getY() - topLeft.getY();
    if(width_new && height_new) {
        image.width(width_new);
        image.height(height_new);
    }
}

function addAnchor(group, x, y, name) {
    var stage = group.getStage();
    var layer = group.getLayer();
    var anchor = new Konva.Circle({
        x: x,
        y: y,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        radius: 6,
        name: name,
        draggable: true,
        dragOnTop: false
    });
    anchor.on('dragmove', function() {
        update(this);
        layer.draw();
    });
    anchor.on('mousedown touchstart', function() {
        group.setDraggable(false);
        group.moveToTop();
    });
    anchor.on('mouseup touchend', function() {
        group.setDraggable(true);
        group.moveToTop();
    });
    anchor.on('dragend', function() {
        group.setDraggable(true);
        layer.draw();
    });

    // add hover styling
    anchor.on('mouseover', function() {
        var layer = this.getLayer();
        document.body.style.cursor = 'pointer';
        //this.setStrokeWidth(4);
        //layer.draw();
    });
    anchor.on('mouseout', function() {
        var layer = this.getLayer();
        document.body.style.cursor = 'default';
        //this.setStrokeWidth(2);
        //layer.draw();
    });
    group.add(anchor);
}

function addRectAnchor(group, x, y, name) {
    var stage = group.getStage();
    var layer = group.getLayer();
    var anchor = new Konva.Rect({
        x: x-5,
        y: y-5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        width: 10,
        height: 10,
        name: name,
        draggable: true,
        dragOnTop: false
    });
    anchor.on('dragmove', function() {
        update(this);
        layer.draw();
    });
    anchor.on('mousedown touchstart', function() {
        group.setDraggable(false);
        group.moveToTop();
    });
    anchor.on('mouseup touchend', function() {
        group.setDraggable(true);
        group.moveToTop();
    });
    anchor.on('dragend', function() {
        group.setDraggable(true);
        layer.draw();
    });

    // add hover styling
    anchor.on('mouseover', function() {
        var layer = this.getLayer();
        document.body.style.cursor = 'pointer';
        //this.setStrokeWidth(4);
        //layer.draw();
    });
    anchor.on('mouseout', function() {
        var layer = this.getLayer();
        document.body.style.cursor = 'default';
        //this.setStrokeWidth(2);
        //layer.draw();
    });
    group.add(anchor);
}