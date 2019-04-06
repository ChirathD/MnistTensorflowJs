//-------------------
// GLOBAL variables
//-------------------
var modelName = "digitrecognizermlp";
let model;

var canvasWidth           	= 300;
var canvasHeight 			= 300;
var canvasStrokeStyle		= "white";
var canvasLineJoin			= "round";
var canvasLineWidth       	= 10;
var canvasBackgroundColor 	= "black";
var canvasId              	= "canvas";

var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;

document.getElementById('chart_box').innerHTML = "";
document.getElementById('chart_box').style.display = "none";

//---------------
// Create canvas
//---------------
var canvasBox = document.getElementById('canvas_box');
var canvas    = document.createElement("canvas");

canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined') {
  canvas = G_vmlCanvasManager.initElement(canvas);
}

ctx = canvas.getContext("2d");

//-----------------------
// select model handler
//-----------------------

//---------------------
// MOUSE DOWN function
//---------------------
$("#canvas").mousedown(function(e) {
	var mouseX = e.pageX - this.offsetLeft;
	var mouseY = e.pageY - this.offsetTop;

	drawing = true;
	addUserGesture(mouseX, mouseY);
	drawOnCanvas();
});

//-----------------------
// TOUCH START function
//-----------------------
canvas.addEventListener("touchstart", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}

	var rect = canvas.getBoundingClientRect();
	var touch = e.touches[0];

	var mouseX = touch.clientX - rect.left;
	var mouseY = touch.clientY - rect.top;

	drawing = true;
	addUserGesture(mouseX, mouseY);
	drawOnCanvas();

}, false);

//---------------------
// MOUSE MOVE function
//---------------------
$("#canvas").mousemove(function(e) {
	if(drawing) {
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
		addUserGesture(mouseX, mouseY, true);
		drawOnCanvas();
	}
});

//---------------------
// TOUCH MOVE function
//---------------------
canvas.addEventListener("touchmove", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	if(drawing) {
		var rect = canvas.getBoundingClientRect();
		var touch = e.touches[0];

		var mouseX = touch.clientX - rect.left;
		var mouseY = touch.clientY - rect.top;

		addUserGesture(mouseX, mouseY, true);
		drawOnCanvas();
	}
}, false);

//-------------------
// MOUSE UP function
//-------------------
$("#canvas").mouseup(function(e) {
	drawing = false;
});

//---------------------
// TOUCH END function
//---------------------
canvas.addEventListener("touchend", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	drawing = false;
}, false);

//----------------------
// MOUSE LEAVE function
//----------------------
$("#canvas").mouseleave(function(e) {
	drawing = false;
});

//-----------------------
// TOUCH LEAVE function
//-----------------------
canvas.addEventListener("touchleave", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	drawing = false;
}, false);

//--------------------
// ADD CLICK function
//--------------------
function addUserGesture(x, y, dragging) {
	clickX.push(x);
	clickY.push(y);
	clickD.push(dragging);
}

//-------------------
// RE DRAW function
//-------------------
function drawOnCanvas() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctx.strokeStyle = canvasStrokeStyle;
	ctx.lineJoin    = canvasLineJoin;
	ctx.lineWidth   = canvasLineWidth;

	for (var i = 0; i < clickX.length; i++) {
		ctx.beginPath();
		if(clickD[i] && i) {
			ctx.moveTo(clickX[i-1], clickY[i-1]);
		} else {
			ctx.moveTo(clickX[i]-1, clickY[i]);
		}
		ctx.lineTo(clickX[i], clickY[i]);
		ctx.closePath();
		ctx.stroke();
	}
}

//------------------------
// CLEAR CANVAS function
//------------------------
function clearCanvas(id) {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	clickX = new Array();
	clickY = new Array();
	clickD = new Array();
}

//-------------------------------------
// loader for digitrecognizermlp model
//-------------------------------------
async function loadModel() {
  console.log("model loading..");

  // clear the model variable
  
  // load the model using a HTTPS request (where you have stored your model files)
  model = await tf.loadLayersModel("https://raw.githubusercontent.com/ChirathD/chirath.github.io/master/model.json");
  //model = await tf.loadLayersModel("https://raw.githubusercontent.com/ChirathD/chirath.github.io/master/model.json");
  
  console.log("model loaded..");
}

loadModel();

//-----------------------------------------------
// preprocess the canvas to be MLP friendly
//-----------------------------------------------
function preprocessCanvas(image) {

		//console.log("Hello World");
		// resize the input image to digitrecognizermlp's target size of (1, 28, 28)
		let tensor = tf.browser.fromPixels(image)
		    .resizeNearestNeighbor([28, 28])
		    .mean(2)
		    .expandDims(2)
		    .expandDims()
		    .toFloat();
		console.log(tensor.shape);
		return tensor.div(255.0);
	

	// else throw an error

}

//--------------------------------------------
// predict function for digit recognizer mlp
//--------------------------------------------
async function predict() {

	// get image data from canvas
	var imageData = canvas.toDataURL();

	// preprocess canvas
	let tensor = preprocessCanvas(canvas, modelName);

	// make predictions on the preprocessed image tensor
	let predictions = await model.predict(tensor).data();

	// get the model's prediction results
	let results = Array.from(predictions)

	// display the predictions in chart
	displayChart(results)

	//console.log(results);
}

//------------------------------
// Chart to display predictions
//------------------------------
var chart = "";
var firstTime = 0;
function loadChart(label, data) {
	var ctx = document.getElementById('chart_box').getContext('2d');
	chart = new Chart(ctx, {
	    // The type of chart we want to create
		type: 'bar',
		
	

	    // The data for our dataset
	    data: {
	        labels: label,
	        datasets: [{
	            label: " prediction",
	            backgroundColor: '#f50057',
	            borderColor: 'rgb(255, 99, 132)',
				data: data,
				
	        }]
	    },
	    // Configuration options go here
	    options: {}
	});
	console.log(data);

	if(Math.max(...data)>0.7){
		let i = data.indexOf(Math.max(...data));
		document.getElementById("demo").innerHTML = 'Hmmmm Its ' + i +' Right ? &#x1F609';
		console.log('hello world');
	}

	else{
		let j = data.indexOf(Math.max(...data));
		document.getElementById("demo").innerHTML = 'Is it '+j+ ' ? Oh come on..you are confusing me. &#x1F612;';
	}
	
}


document.getElementById("demo2").innerHTML = 'Posted By Chirath Dasanayaka.';



//----------------------------
// display chart with updated
// drawing from canvas
//----------------------------
function displayChart(data) {
	var select_model  = document.getElementById("select_model");

	label = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	if (firstTime == 0) {
		loadChart(label, data);
		firstTime = 1;
	} else {
		chart.destroy();
		loadChart(label, data);
	}
	document.getElementById('chart_box').style.display = "block";
}
