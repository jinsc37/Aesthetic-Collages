
function sort_layout(init_file_len){
	var images = stage.find('Image');
	var img_arr = {};

	if (typeof images[images.length-1].attrs.image !== 'undefined'){
		for (i=0; i<images.length; i++){
			img_arr[i.toString()] = images[i].attrs.image.src;
		}

		//console.log(img_arr);

		// ajax request
		$.ajaxSettings.traditional = true;
	    $.ajax({
	      type: "POST",
	      url: "/getRanks",
	      data : JSON.stringify(img_arr),
	      dataType : 'json',
	      contentType: 'application/json; charset=utf-8',

	      // handle success
	      success: function(result) {
	      	var ranks = result.ranked_idx;//Ranked indices- 1st entry: index of highest scoring img
	        //console.log(ranks);
	        pos = arrange(images, ranks);
	        for (i=0; i<images.length; i++){
	        	if (typeof images[i].init_locX == 'undefined'){
	        		if (images.length == init_file_len){
						images[i].getParent().position({x: pos.x[i], y:pos.y[i]});
					}

					Object.defineProperty(images[i],'init_locX',{
						enumerable: false,
						configurable: false,
						writable: false,
						value: pos.x[i]+images[i].attrs.image.width/2});

					Object.defineProperty(images[i],'init_locY',{
						enumerable: false,
						configurable: false,
						writable: false,
						value: pos.y[i]+images[i].attrs.image.height/2});
				}
				highlight(images[i]);
	        }
	        document.getElementById("loading").remove();
	        layer.draw();
	      },
	      // handle error
	      error: function(error) {
	        console.log(error);
	      }
	    });
	}
}


function resize(){
	var images = stage.find('Image');
	var img_area = 0;

	if (typeof images[images.length-1].attrs.image !== 'undefined'){
		for (i=0;i<images.length; i++){
			if (typeof images[i].factor == 'undefined'){
				img_area = img_area + (images[i].attrs.image.height * images[i].attrs.image.width);
			}
		}
		var factor = Math.sqrt((window.innerWidth * window.innerHeight * 0.4) / (img_area));
		if (factor > 1){
			factor = 1;
		}
		//console.log(img_area)
		//console.log(factor)
		//console.log(window.innerWidth * window.innerHeight)

		for (i=0;i<images.length; i++){
			if (typeof images[i].factor == 'undefined'){
				images[i].width(images[i].attrs.image.width * factor);
				images[i].height(images[i].attrs.image.height * factor);
				var group = images[i].getParent();
				group.get('.topRight')[0].setX(group.get('.topLeft')[0].getX()+images[i].attrs.image.width * factor);
				group.get('.bottomLeft')[0].setY(group.get('.topLeft')[0].getY()+images[i].attrs.image.height * factor);
				group.get('.bottomRight')[0].setX(group.get('.topLeft')[0].getX()+images[i].attrs.image.width * factor);
				group.get('.bottomRight')[0].setY(group.get('.topLeft')[0].getY()+images[i].attrs.image.height * factor);

				images[i].attrs.image.width = images[i].attrs.image.width * factor;
				images[i].attrs.image.height = images[i].attrs.image.height * factor;
				//console.log(group.get('.topLeft')[0]);
				//layer.draw();

				Object.defineProperty(images[i],'factor',{
						enumerable: false,
						configurable: false,
						writable: false,
						value: factor});
			}
		}
	}
}


class Region {
	constructor(start_x, start_y, curr_x, curr_y, max_x, max_y, bound_x, bound_y){
		this.start_x = start_x;
		this.start_y = start_y;
		this.curr_x = curr_x;
		this.curr_y = curr_y;
		this.max_x = max_x;
		this.max_y = max_y;
		this.bound_x = bound_x;
		this.bound_y = bound_y;
	}
}

function arrange(images, ranks){
	var m = 10;
	var pos_X = new Array(ranks.length);
	var pos_Y = new Array(ranks.length);

	//var group = images[ranks[0]].getParent();
	//width = group.get('.bottomRight')[0].getX();
	//height = group.get('.bottomRight')[0].getY();
	width = images[ranks[0]].attrs.image.width;
	height = images[ranks[0]].attrs.image.height;

	pos_X[ranks[0]] = window.innerWidth/2 - width/2;
	pos_Y[ranks[0]] = window.innerHeight/2 - height/2;

	var R = new Region(pos_X[ranks[0]]+width+m, pos_Y[ranks[0]],
					   pos_X[ranks[0]]+width+m, pos_Y[ranks[0]],
					   pos_X[ranks[0]]+width+m, pos_Y[ranks[0]],
					   window.innerWidth, window.innerHeight);
	var B = new Region(pos_X[ranks[0]]+width, pos_Y[ranks[0]]+height+m,
					   pos_X[ranks[0]]+width, pos_Y[ranks[0]]+height+m,
					   pos_X[ranks[0]]+width, pos_Y[ranks[0]]+height+m,
					   0, window.innerHeight);
	var L = new Region(pos_X[ranks[0]]-m, pos_Y[ranks[0]]+height,
					   pos_X[ranks[0]]-m, pos_Y[ranks[0]]+height,
					   pos_X[ranks[0]]-m, pos_Y[ranks[0]]+height,
					   0, 0);
	var T = new Region(pos_X[ranks[0]], pos_Y[ranks[0]]-m,
					   pos_X[ranks[0]], pos_Y[ranks[0]]-m,
					   pos_X[ranks[0]], pos_Y[ranks[0]]-m,
					   window.innerWidth, 0);

	var rem;
	for (i=1;i<images.length; i++){
		//group = images[ranks[i]].getParent();
		//width = group.get('.bottomRight')[0].getX();
		//height = group.get('.bottomRight')[0].getY();
		width = images[ranks[i]].attrs.image.width;
		height = images[ranks[i]].attrs.image.height;

		rem = i % 4;
		switch (rem) {
        	case 1:
        		if (B.max_y > R.curr_y){
        			pos_X[ranks[i]] = R.curr_x;
        			pos_Y[ranks[i]] = R.curr_y;

        			R.curr_y = R.curr_y+height+m;
        			if (R.max_x < R.curr_x+width){
        				R.max_x = R.curr_x+width;
        			}
        		}
        		else{
        			R.curr_x = R.max_x+m;
        			R.curr_y = R.start_y;

        			pos_X[ranks[i]] = R.curr_x;
        			pos_Y[ranks[i]] = R.curr_y;

        			R.curr_y = R.curr_y+height+m;
        			if (R.max_x < R.curr_x+width){
        				R.max_x = R.curr_x+width;
        			}
        		}
        		break;
        	case 2:
        		if (L.max_x < B.curr_x){
        			pos_X[ranks[i]] = B.curr_x-width;
        			pos_Y[ranks[i]] = B.curr_y;

        			B.curr_x = B.curr_x-width-m;
        			if (B.max_y < B.curr_y+height){
        				B.max_y = B.curr_y+height;
        			}
        		}
        		else{
        			B.curr_y = B.max_y+m;
        			B.curr_x = B.start_x;

        			pos_X[ranks[i]] = B.curr_x-width;
        			pos_Y[ranks[i]] = B.curr_y;

        			B.curr_x = B.curr_x-width-m;
        			if (B.max_y < B.curr_y+height){
        				B.max_y = B.curr_y+height;
        			}
        		}
        		break;
        	case 3:
        		if (T.max_y < L.curr_y){
        			pos_X[ranks[i]] = L.curr_x-width;
        			pos_Y[ranks[i]] = L.curr_y-height;

        			L.curr_y = L.curr_y-height-m;
        			if (L.max_x > L.curr_x-width){
        				L.max_x = L.curr_x-width;
        			}
        		}
        		else{
        			L.curr_x = L.max_x-m;
        			L.curr_y = L.start_y;

        			pos_X[ranks[i]] = L.curr_x-width;
        			pos_Y[ranks[i]] = L.curr_y-height;

        			L.curr_y = L.curr_y-height-m;
        			if (L.max_x > L.curr_x-width){
        				L.max_x = L.curr_x-width;
        			}
        		}
        		break;
        	case 0:
        		if (R.max_x > T.curr_x){
        			pos_X[ranks[i]] = T.curr_x;
        			pos_Y[ranks[i]] = T.curr_y-height;

        			T.curr_x = T.curr_x+width+m;
        			if (T.max_y > T.curr_y-height){
        				T.max_y = T.curr_y-height;
        			}
        		}
        		else{
        			T.curr_y = T.max_y-m;
        			T.curr_x = T.start_x;

        			pos_X[ranks[i]] = T.curr_x;
        			pos_Y[ranks[i]] = T.curr_y-height;

        			T.curr_x = T.curr_x+width+m;
        			if (T.max_y > T.curr_y-height){
        				T.max_y = T.curr_y-height;
        			}
        		}
        		break;
    	}
	}
	return {x: pos_X, y: pos_Y};
}


function highlight(img){
	var locX = img.getParent().attrs.x + img.attrs.image.width/2;
	var locY = img.getParent().attrs.y + img.attrs.image.height/2;

	var spectrum = ["#00FF00","#11FF00","#22FF00","#33FF00","#44FF00","#55FF00","#66FF00","#77FF00",
					"#88FF00","#99FF00","#AAFF00","#BBFF00","#CCFF00","#DDFF00","#EEFF00","#FFFF00",
					"#FFEE00","#FFDD00","#FFCC00","#FFBB00","#FFAA00","#FF9900","#FF8800","#FF7700",
					"#FF6600","#FF5500","#FF4400","#FF3300","#FF2200","#FF1100","#FF0000"];

	var red_len = Math.max(window.innerWidth/2, window.innerHeight/2);
	var con_factor = 30/red_len;

	var spec_idx = Math.round(
					Math.abs(
					Math.sqrt(
						Math.pow(Math.abs(window.innerWidth/2 - img.init_locX),2) +
						Math.pow(Math.abs(window.innerHeight/2 - img.init_locY),2))
					-
					Math.sqrt(
						Math.pow(Math.abs(window.innerWidth/2 - locX),2) +
						Math.pow(Math.abs(window.innerHeight/2 - locY),2))
					)
					* con_factor);

	if (spec_idx > 30){
		spec_idx = 30;
	}
	if (spec_idx < 0){
		spec_idx = 0;
	}

	img.stroke(spectrum[spec_idx]);
	layer.draw();
}












