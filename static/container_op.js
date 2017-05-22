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
            //var factor = window.innerWidth * window.innerWidth
            layer.add(KonvaImgGroup);
            KonvaImgGroup.add(KonvaImg);
            addAnchor(KonvaImgGroup, 0, 0, 'topLeft');
            addAnchor(KonvaImgGroup, aImg.width, 0, 'topRight');
            addAnchor(KonvaImgGroup, aImg.width, aImg.height, 'bottomRight');
            addAnchor(KonvaImgGroup, 0, aImg.height, 'bottomLeft');

            // make the jpeg image
            var newImg = new Image();
            newImg.onload = function() {
              //newImg.id = "newImg";
              //newImg.src = "img1.jpg";
              //newImg.draggable = 'true'
              KonvaImg.image(newImg);
              resize();
              sort_layout();
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
    var image = group.get('Image')[0];
    var anchorX = activeAnchor.getX();
    var anchorY = activeAnchor.getY();
    // update anchor positions
    switch (activeAnchor.getName()) {
        case 'topLeft':
            topRight.setY(anchorY);
            bottomLeft.setX(anchorX);
            break;
        case 'topRight':
            topLeft.setY(anchorY);
            bottomRight.setX(anchorX);
            break;
        case 'bottomRight':
            bottomLeft.setY(anchorY);
            topRight.setX(anchorX);
            break;
        case 'bottomLeft':
            bottomRight.setY(anchorY);
            topLeft.setX(anchorX);
            break;
    }
    image.position(topLeft.position());
    //console.log(topLeft.position())
    var width = topRight.getX() - topLeft.getX();
    var height = bottomLeft.getY() - topLeft.getY();
    if(width && height) {
        image.width(width);
        image.height(height);
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