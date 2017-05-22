
var stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight
});
var layer = new Konva.Layer();
stage.add(layer);


// Mouse Operation Behaviors
var ctrlIsPressed = false;
$(document).keydown(function(event){
    if(event.which=="17")
        ctrlIsPressed = true;
});
$(document).keyup(function(){
    ctrlIsPressed = false;
});



layer.on('mousedown', function(evt) {
  var shape = evt.target;
  var group = shape.getParent(); // move this group to top
  group.moveToTop();

  if (shape.className == 'Image'){
    if (ctrlIsPressed == false){
      var shapes = stage.find('Image'); //de-emphasize other images
      shapes.strokeEnabled(false);

      var circles = stage.find('Circle');
      circles.hide();

      group.getChildren()[1].show() // show this circles
      group.getChildren()[2].show()
      group.getChildren()[3].show()
      group.getChildren()[4].show()

      shape.strokeEnabled(true); //emphasize this image
      layer.draw();
    }
    else if(ctrlIsPressed && shape.strokeEnabled() == false){
      group.getChildren()[1].show()
      group.getChildren()[2].show()
      group.getChildren()[3].show()
      group.getChildren()[4].show()

      shape.strokeEnabled(true);
      layer.draw();
    }
    else if(ctrlIsPressed && shape.strokeEnabled()) {
      group.getChildren()[1].hide()
      group.getChildren()[2].hide()
      group.getChildren()[3].hide()
      group.getChildren()[4].hide()

      shape.strokeEnabled(false);
      layer.draw();
    }
    //console.log(shape.strokeEnabled())
  }
});
/*
layer.on('click', function(evt) {
  var shape = evt.target;
  if (shape.className == 'Image'){
    shape.strokeEnabled(true);
    layer.draw();

    group = shape.getParent();
    group.moveToTop();
  }
});*/

$( "#container" ).dblclick(function() {
  if (ctrlIsPressed == false){
    var circles = stage.find('Circle');
    circles.hide();
    
    var shapes = stage.find('Image');
    shapes.strokeEnabled(false);
    layer.draw();
  }
});


layer.on('mouseover', function(evt) {
    var shape = evt.target;
    document.body.style.cursor = 'pointer';
});

layer.on('mouseout', function(evt) {
    var shape = evt.target;
    document.body.style.cursor = 'default';
});


//delete key press
$(document).keydown(function(event){
  if(event.which=="46"){
    var shapes = stage.find('Image');
    for(i=0;i<shapes.length;i++){
      if(shapes[i].strokeEnabled()){
        shapes[i].getParent().destroy();
        layer.draw();
      }
    }
  }
});