var sp = versor.create({
	metric: [1, 1],
	types: [
        { name:"MV", bases:["s", "e1", "e2", "e12"] },
    ]
});

console.log(sp.basis);
console.log(sp.types);

var e1 = sp.e1(1);
var e2 = sp.e2(1);
var e12 = e1.gp(e2);

var currentTick = 0;
var input = null;
var transform = null;
var fourierSize = null;
var sampleRate = null;

var inputCanvas = document.getElementById("inputCanvas");
var inputCtx = inputCanvas.getContext("2d");
var transformCanvas = document.getElementById("transformCanvas");
var transformCtx = transformCanvas.getContext("2d");
var fourierScalarCanvas = document.getElementById("fourierScalarCanvas");
var fourierScalarCtx = fourierScalarCanvas.getContext("2d");
var fourierE1Canvas = document.getElementById("fourierE1Canvas");
var fourierE1Ctx = fourierE1Canvas.getContext("2d");
var fourierE2Canvas = document.getElementById("fourierE2Canvas");
var fourierE2Ctx = fourierE2Canvas.getContext("2d");
var fourierE12Canvas = document.getElementById("fourierE12Canvas");
var fourierE12Ctx = fourierE12Canvas.getContext("2d");

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function drawCircle(ctx, x, y) {
	ctx.beginPath();
	ctx.arc(x, y, 4, 0, 2 * Math.PI);
	ctx.stroke();
}

function drawText(ctx, x, y, text) {
	ctx.font = "10px Arial";
	ctx.fillText(text, x, y);
}

function draw(ctx, canvas, v) {
	var a = sp.MV(v);
	var x = a[1];
	var y = a[2];

	drawCircle(ctx, canvas.width * 0.5 + x * canvas.width * 0.4, canvas.height * 0.5 + y * canvas.height * 0.4);
}

function clear(ctx, canvas) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function startCalculate() {
	fourierSize = document.getElementById("fouriersize").value;
	sampleRate = document.getElementById("samplerate").value;
	eval("input = function(t) { return " + document.getElementById("input").value + ";}");
	eval("transform = function(t, w) { return " + document.getElementById("transform").value + ";}");
	currentTick = 0;

	var amplitudes = [];
	for(var wn = 0; wn < fourierSize; wn++) {
		var w = 2 * Math.PI * wn * sampleRate / fourierSize;
		var aw = 0;

		for(var n = 0; n < fourierSize; n++) {
			var t = n  * 1.0 / sampleRate;
			aw = input(t).gp(transform(t, w)).add(aw);
		}

		aw = sp.MV(aw);

		aw[0] /= fourierSize;
		aw[1] /= fourierSize;
		aw[2] /= fourierSize;
		aw[3] /= fourierSize;

		amplitudes.push(aw);
	}

	clear(fourierScalarCtx, fourierScalarCanvas);
	clear(fourierE1Ctx, fourierE1Canvas);
	clear(fourierE2Ctx, fourierE2Canvas);
	clear(fourierE12Ctx, fourierE12Canvas);

	drawText(fourierScalarCtx, 10, 10, "Scalar");
	drawText(fourierE1Ctx, 10, 10, "E1");
	drawText(fourierE2Ctx, 10, 10, "E2");
	drawText(fourierE12Ctx, 10, 10, "E12");

	for(var i = 0; i < fourierSize; i++) {
		drawCircle(fourierScalarCtx, fourierScalarCanvas.width * i / fourierSize, 0.5 * fourierScalarCanvas.height - 0.4 * fourierScalarCanvas.height * amplitudes[i][0]);
		drawCircle(fourierE1Ctx, fourierE1Canvas.width * i / fourierSize, 0.5 * fourierE1Canvas.height - 0.4 * fourierE1Canvas.height * amplitudes[i][1]);
		drawCircle(fourierE2Ctx, fourierE2Canvas.width * i / fourierSize, 0.5 * fourierE2Canvas.height - 0.4 * fourierE2Canvas.height * amplitudes[i][2]);
		drawCircle(fourierE12Ctx, fourierE12Canvas.width * i / fourierSize, 0.5 * fourierE12Canvas.height - 0.4 * fourierE12Canvas.height * amplitudes[i][3]);
	}

	tick();
}

function tick() {
	var t = currentTick * 1.0 / sampleRate;

	var tickInput = input(t);
	var tickTransform = transform(t, 1 * 2 * Math.PI * sampleRate / fourierSize);

	clear(inputCtx, inputCanvas);
	draw(inputCtx, inputCanvas, tickInput);
	drawText(inputCtx, 5, 10, "Input function");
	drawText(inputCtx, 5, 25, "t: " + t);

	clear(transformCtx, transformCanvas);
	draw(transformCtx, transformCanvas, tickTransform);
	drawText(transformCtx, 5, 10, "Transform function");
	drawText(transformCtx, 5, 25, "t: " + t);

	currentTick = (currentTick + 0.2) % fourierSize;

	setTimeout(tick, 50);
}

document.getElementById("calculate").onclick = startCalculate;

document.getElementById("example1").onclick = function() {
	document.getElementById("fouriersize").value = 32;
	document.getElementById("samplerate").value = 32;
	document.getElementById("input").value = "e1.gp(Math.cos(2*Math.PI*2*t)).add(e2.gp(Math.sin(2*Math.PI*2*t)))";
	document.getElementById("transform").value = "e1.gp(Math.cos(w*t)).add(e2.gp(Math.sin(w*t)))";
	startCalculate();
};

document.getElementById("example2").onclick = function() {
	document.getElementById("fouriersize").value = 32;
	document.getElementById("samplerate").value = 32;
	document.getElementById("input").value = "e1.gp(Math.cos(2*Math.PI*4*t)).add(e2.gp(Math.sin(2*Math.PI*4*t)))";
	document.getElementById("transform").value = "e1.gp(Math.cos(w*t)).add(e2.gp(Math.sin(w*t)))";
	startCalculate();
};

document.getElementById("example3").onclick = function() {
	document.getElementById("fouriersize").value = 32;
	document.getElementById("samplerate").value = 32;
	document.getElementById("input").value = "e1.gp(Math.cos(2*Math.PI*2*t)).add(e2.gp(Math.sin(2*Math.PI*2*t)))";
	document.getElementById("transform").value = "e2.gp(Math.cos(w*t)).add(e1.gp(Math.sin(w*t)))";
	startCalculate();
};

document.getElementById("example4").onclick = function() {
	document.getElementById("fouriersize").value = 32;
	document.getElementById("samplerate").value = 32;
	document.getElementById("input").value = "e1.gp(Math.sin(2*Math.PI*2*t))";
	document.getElementById("transform").value = "e1.gp(Math.sin(w*t))";
	startCalculate();
};

document.getElementById("example5").onclick = function() {
	document.getElementById("fouriersize").value = 32;
	document.getElementById("samplerate").value = 32;
	document.getElementById("input").value = "e1.gp(Math.cos(2*Math.PI*2*t)).add(e2.gp(0.5 * Math.sin(2*Math.PI*2*t)))";
	document.getElementById("transform").value = "e1.gp(Math.cos(w*t)).add(e2.gp(Math.sin(w*t)))";
	startCalculate();
};

startCalculate();