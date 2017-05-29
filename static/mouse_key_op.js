
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

      var rects = stage.find('Rect');
      rects.hide();

      group.getChildren()[1].show() // show this circles
      group.getChildren()[2].show()
      group.getChildren()[3].show()
      group.getChildren()[4].show()
      group.getChildren()[5].show()
      group.getChildren()[6].show()
      group.getChildren()[7].show()
      group.getChildren()[8].show()

      shape.strokeEnabled(true); //emphasize this image
      layer.draw();
    }
    else if(ctrlIsPressed && shape.getParent().getChildren()[1].visible() == false){
      group.getChildren()[1].show()
      group.getChildren()[2].show()
      group.getChildren()[3].show()
      group.getChildren()[4].show()
      group.getChildren()[5].show()
      group.getChildren()[6].show()
      group.getChildren()[7].show()
      group.getChildren()[8].show()

      shape.strokeEnabled(true);
      layer.draw();
    }
    else if(ctrlIsPressed && shape.getParent().getChildren()[1].visible()) {
      group.getChildren()[1].hide()
      group.getChildren()[2].hide()
      group.getChildren()[3].hide()
      group.getChildren()[4].hide()
      group.getChildren()[5].hide()
      group.getChildren()[6].hide()
      group.getChildren()[7].hide()
      group.getChildren()[8].hide()

      shape.strokeEnabled(false);
      layer.draw();
    }
    //console.log(shape.strokeEnabled())
  }
  if (allSelected == true){
    applyHighlight();
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

    var rects = stage.find('Rect');
    rects.hide();

    var shapes = stage.find('Image');
    shapes.strokeEnabled(false);
    layer.draw();

    allSelected = false;
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
      if(shapes[i].getParent().getChildren()[1].visible()){
        shapes[i].getParent().destroy();
        layer.draw();
      }
    }
  }
});

//select all 'key = a'
var allSelected = false;
$(document).keydown(function(event){
  if(event.which=="65"){
    var img = stage.find('Image');
    if (allSelected == false){
      for(i=0;i<img.length;i++){
        img[i].strokeEnabled(true);
        layer.draw();
      }
      allSelected = true;
    }
    else{
      for(i=0;i<img.length;i++){
        if (img[i].getParent().getChildren()[1].visible() == false){
          img[i].strokeEnabled(false);
          layer.draw();
        }
      }
      allSelected = false;
    }
  }
});

function applyHighlight(){
  var img = stage.find('Image');
  for(i=0;i<img.length;i++){
    img[i].strokeEnabled(true);
    layer.draw();
  }
}


//Key direction
$(document).keydown(function(event){
  if(event.which=="38"){
    var img = stage.find('Image');
    for(i=0;i<img.length;i++){
      if (img[i].getParent().getChildren()[1].visible()){
        img[i].getParent().position({x: img[i].getParent().attrs.x,
          y:img[i].getParent().attrs.y - 1});
        layer.draw();
      }
    }
  }
  else if(event.which=="40"){
    var img = stage.find('Image');
    for(i=0;i<img.length;i++){
      if (img[i].getParent().getChildren()[1].visible()){
        img[i].getParent().position({x: img[i].getParent().attrs.x,
          y:img[i].getParent().attrs.y + 1});
        layer.draw();
      }
    }
  }
  else if(event.which=="39"){
    var img = stage.find('Image');
    for(i=0;i<img.length;i++){
      if (img[i].getParent().getChildren()[1].visible()){
        img[i].getParent().position({x: img[i].getParent().attrs.x + 1,
          y:img[i].getParent().attrs.y});
        layer.draw();
      }
    }
  }
  else if(event.which=="37"){
    var img = stage.find('Image');
    for(i=0;i<img.length;i++){
      if (img[i].getParent().getChildren()[1].visible()){
        img[i].getParent().position({x: img[i].getParent().attrs.x - 1,
          y:img[i].getParent().attrs.y});
        layer.draw();
      }
    }
  }
});