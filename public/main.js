if (! window.AudioContext) {
	if (! window.webkitAudioContext) {
		alert('no audiocontext found');
	}
	window.AudioContext = window.webkitAudioContext;
}

var soundFile, record, mic, fft, total_arr = [], is_start = false;

function setup() {
	createCanvas(550,400);
	background(30, 30, 30);
	noFill();

	mic = new p5.AudioIn();
	mic.start();
	fft = new p5.FFT(0.8, 256);
	fft.setInput(mic);
  
  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);

	$('#defaultCanvas').css("display", "block").css("margin","0 auto");
	$('#svg').prepend($('#defaultCanvas'));

}

function draw() {
	if (is_start == true) {
		background(30, 30, 30);

		var spectrum = fft.analyze();

			total_arr.push(spectrum);

		beginShape();
		stroke(255,255,255);
		strokeWeight(2);
		for (i = 0; i<spectrum.length; i++) {
			vertex(i*5, map(spectrum[i], 0, 255, height, 0) );
		}
		endShape();
	}
}

//btn function
function start() {
	$('#chart svg').remove();
	soundFile = new p5.SoundFile();
	recorder.record(soundFile);
	total_array = []
	is_start = true;
}

function stop() {
	is_start = false;
	drawSpecgram(total_arr);
	recorder.stop(); 
}

function myClear() {
	$('#chart svg').remove();
	total_array = []
	is_start = false;
}

function saveMP3() {
	saveSound(soundFile, 'mySound.wav');
}

function saveImg() {
  var html = d3.select("svg")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;
 
  //var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
  //var img = '<img src="'+imgsrc+'">'; 
  //d3.select("#svgdataurl").html(img);
 
 
  var canvas = document.querySelector("#canvas")
			, context = canvas.getContext("2d");
 
  var image = new Image;
  image.src = imgsrc;
  image.onload = function() {
	  context.drawImage(image, 0, 0);
	  var canvasdata = canvas.toDataURL("image/png");
	  //var pngimg = '<img src="'+canvasdata+'">'; 
  	//  d3.select("#pngdataurl").html(pngimg);
 
	  var a = document.createElement("a");
	  a.download = "sample.png";
	  a.href = canvasdata;
		console.log(canvasdata);
	  a.click();
  };
}


function drawSpecgram(data) {

	data = data.splice(0, data.length);
	grid = data.length;
	//console.log(data);
	d3_data = [];
	max = []

	for (i = 0; i < data.length; i++) {
		var count = 0
		for (j = 0; j < data[i].length; j++) {
			var tmp = {}
			tmp.time = i;		
			tmp.freq = j; 
			tmp.scale = data[i][j];
			if (data[i][j] != 0) {
				max.push(j);	
			}
			d3_data.push(tmp);
			count++;
		}
	}

  Hmax = Math.max.apply(null, max);

	data = d3_data;
	var margin = { top: 0, right: 0, bottom: 0, left: 0 },


		width = 1000 - margin.left - margin.right,
		//height = 600 - margin.top - margin.bottom,
		gridSize,
		buckets = 200,
		colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
		
		if (grid > 90) {
			gridSize = (width / grid);
		}
		else {
			gridSize = (500 / Hmax);
		}

		var height = gridSize * Hmax;
		

    var colorScale = d3.scale.quantile()
              .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
              .range(colors);

    var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var heatMap = svg.selectAll(".hour")
      .data(data)
      .enter().append("rect")
      .attr("x", function(d) { return (d.time - 1) * gridSize; })
      .attr("y", function(d) { return height - ((d.freq - 1) * gridSize); })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("class", "hour bordered")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .style("fill", colors[0]);

    heatMap.transition().duration(1000)
      .style("fill", function(d) { return colorScale(d.scale); });

    heatMap.append("title").text(function(d) { return ("X: " + d.time + "\n"
													+ "Y: " + d.freq + "\n"
													+ "scale: " + d.scale);});
}
