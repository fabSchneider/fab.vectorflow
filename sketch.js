 let brushType = {
	PULL: 'pull',
	ORIENT: 'orient',
	ATTRACT: 'attract',
	REPULSE: 'repulse',
	SWIRL_CW: 'swirl-cw',
	SWIRL_CCW: 'swirl-ccw',
	ERASE: 'erase'
};

let vf;
let vfWidth;
let vfHeight;
let vg;

let maxSize = 1000;

let currBrushType;
let brushSizeMin = 20;
let brushSizeMax = 500;
let brushSize;
let brushIntensity;

let mouseVector;
let pmouseVector;
let mouseDir;
let smoothMouseDir;
let mouseAcc;
let mouseRot;
let mouseDrag = false;

let particles = [];
let particleCount = 1000;
let particleFade = 10;
let particleSize = 1.5;
let particleSpeed = 40;
let particleFriction = 0.7;
let particleColor1 = `#EA93B7`;
let particleColor2 = `#26FAF5`;

let vectorfieldColor = 0;

let particleGraphics;
let trailGraphics;

let showVectorField = true;
let showParticles = false;
let simulationStarted = false;
let runSimulation = false;

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {
	37: 1,
	38: 1,
	39: 1,
	40: 1
};

function setup(){
	setupControls();

	document.addEventListener('ontouchstart', function (e) {
		document.body.style.overflow = "hidden";
	}, false);

	document.addEventListener('ontouchmove', function (e) {
		document.body.style.overflow = "auto";
	}, false);

	pixelDensity(1);
	noCursor();

	let cnvContainer = document.querySelector(".p5-container");
	let cnv = createCanvas(cnvContainer.clientWidth, cnvContainer.clientHeight);
	cnv.parent(cnvContainer)

	stroke(vectorfieldColor);
	strokeWeight(1);

	mouseVector = createVector(0, 0);
	pmouseVector = createVector(0, 0);
	mouseDir = createVector(0, 0);
	smoothMouseDir = createVector(0, 0);
	mouseAcc = 0;
	mouseRot = 0;

	vfWidth = round(width / 50);
	vfHeight = round(height / 50);
	vf = createVectorField(vfWidth, vfHeight);
	vg = createGraphics(width * pixelDensity(), height * pixelDensity());
	vg.stroke(vectorfieldColor);
	vg.pixelDensity(1);
	vg.fill(vectorfieldColor);

	particleGraphics = createGraphics(width * pixelDensity(), height * pixelDensity());
	particleGraphics.pixelDensity(1);
	particleGraphics.strokeWeight(0.1);
	particleGraphics.stroke(0);

	trailGraphics = createGraphics(width * pixelDensity(), height * pixelDensity());

	noLoop();
	//cnvContainer.classList.add("p5-container--hidden");
	//addParticles(particleCount);
}

function startSketch(){
	document.querySelector(".p5-container").classList.remove("p5-container--hidden");
	loop();
}

function stopSketch(){
	noLoop();
	document.querySelector(".p5-container").classList.add("p5-container--hidden");
}

function setupControls(){
	let controls = document.querySelector(".p5-controls");

	Object.values(brushType).forEach(type => {
		var input = controls.querySelector('#' + type)
		input.onclick = () => setBrushType(type);

		if(input.checked){
			setBrushType(type);
		}
	});

	let showVectorfieldInput = controls.querySelector('#show-vectorfield');
	showVectorfieldInput.onchange = () => showVectorField = showVectorfieldInput.checked;
	showVectorField = showVectorfieldInput.checked;

	let pauseInput = controls.querySelector('#pause-simulation');
	pauseInput.value = "pause";
	pauseInput.type ="checkbox";
	pauseInput.onclick = togglePauseSimulation;
	pauseInput.checked = runSimulation;
	pauseInput.disabled = !runSimulation;	


	let playInput = controls.querySelector('#play-simulation');
	let stopInput = controls.querySelector('#stop-simulation');

	playInput.onclick = () =>{
		togglePlaySimulation();
		showVectorfieldInput.checked = !runSimulation;
		showVectorField = !runSimulation;
		playInput.parentElement.classList.add("control--hidden");
		stopInput.parentElement.classList.remove("control--hidden");
		pauseInput.checked = false;
		pauseInput.disabled = false;	
	}; 


	stopInput.onclick = () =>{
		togglePlaySimulation();
		showVectorfieldInput.checked = !runSimulation;
		showVectorField = !runSimulation;
		playInput.parentElement.classList.remove("control--hidden");
		stopInput.parentElement.classList.add("control--hidden");
		pauseInput.checked = false;
		pauseInput.disabled = true;	
	}; 


	let sizeControl = controls.querySelector("#brush-size");
	if(sizeControl != null){
		sizeControl.onchange = () => setBrushSize(sizeControl.value);
		setBrushSize(sizeControl.value);
	}else{
		setBrushSize(30);
	}


	let intensityControl = controls.querySelector("#brush-intensity");
	if(intensityControl != null){
		intensityControl.onchange = () => setBrushIntensity(intensityControl.value);
		setBrushIntensity(intensityControl.value);
	}else{
		setBrushIntensity(30);
	}
}

function draw() {
	//mouse variables
	pmouseVector = createVector(pmouseX, pmouseY);
	mouseVector = createVector(mouseX, mouseY);
	mouseDir = p5.Vector.sub(mouseVector, pmouseVector);
	mouseAcc = 20;
	mouseAcc = map(mouseDir.mag(), 0, 35, 0, 1);
	mouseAcc = constrain(mouseAcc, 0, 1);
	mouseDir.normalize();
	smoothMouseDir = p5.Vector.lerp(smoothMouseDir, mouseDir, mouseAcc);
	mouseRot = atan2(smoothMouseDir.y, smoothMouseDir.x);
	clear();

	if (showParticles) {	
		if(runSimulation){
			particleGraphics.clear();
			particleGraphics.fill(0,0);
			particleGraphics.noStroke();
			particleGraphics.strokeWeight(particleSize);
			particleGraphics.rect(0, 0, width, height);
			updateParticles(vf, vfWidth, vfHeight);
			fadeGraphic(trailGraphics, particleFade);
			trailGraphics.image(particleGraphics, 0, 0, width, height);
			image(trailGraphics, 0, 0, width, height);
		}
		else{
			image(trailGraphics, 0, 0, width, height);
		}
	}

	if (showVectorField) {
		displayVectorField(vg, vf, vfWidth, vfHeight, width, height);
	}

	//drawCursor
	line(mouseX, mouseY - 10, mouseX, mouseY + 10);
	line(mouseX - 10, mouseY, mouseX + 10, mouseY);

	//////////////////////////////
	if (mouseDrag) {
		// //show mouse direction
		push();
		noFill();
		ellipse(mouseX, mouseY, brushSize * 2, brushSize * 2);
		pop();
		paintVectorField(vf, vfWidth, vfHeight, currBrushType, brushSize, brushIntensity);
	}
}

//////////////////// events ////////////////////

function mouseDragged() {
	mouseDrag = mouseOverCanvas();
}

function mouseReleased() {
	mouseDrag = false;
}


function touchMoved() {
	mouseDrag = !mouseOverCanvas();
}

function mouseOverCanvas(){
	return mouseX >= 0 && mouseX < width && 
		   mouseY >= 0 && mouseY < height;
}

function keyPressed() {
	switch (key) {
		case ' ':
			showParticles = !showParticles;
			if (showParticles)
				addParticles(particleCount);
			break;
		case 'V':
			showVectorField = !showVectorField;
			break;
	}
}

function togglePlaySimulation(){
	if(simulationStarted){
		//stop simulation
		runSimulation = false;
		showParticles = false;
		simulationStarted = false;
		console.log("Stop Simulation");
	}else{
		//start simulation
		resetParticles();
		trailGraphics.clear();
		runSimulation = true;
		showParticles = true;
		simulationStarted = true;
		console.log("Start Simulation");
	}
}

function togglePauseSimulation(){
	if(simulationStarted){
		runSimulation = ! runSimulation	
		console.log(runSimulation ? "Unpause" : "Pause");
	}
}

function toggleVectorfieldDisplay() {
	showVectorField = !showVectorField;
}

function resetParticles(){
	if(particles.length != particleCount){
		particles = [];
		for (let i = 0; i < particleCount; i++) {
			particles.unshift(new Particle(random(width), random(height)));		
		}
	}
	else{
		for (let i = 0; i < particles.length; i++) {
			particles[i].respawn(random(width), random(height));		
		}
	}
}


//////////////////////// particles ///////////////////////////

class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.accX = 0;
		this.accY = 0;

		this.velX = 0;
		this.velY = 0;
		this.damping = particleFriction;

		this.lifeTime = random(2, 5);
	}

	addForce(forceX, forceY) {
		this.accX += forceX;
		this.accY += forceY;
	}

	update() {
		this.accX *= this.damping;
		this.accY *= this.damping;
		this.velX = this.accX;
		this.velY = this.accY;
		this.x += this.velX / frameRate();
		this.y += this.velY / frameRate();

		if ((abs(this.velX) + abs(this.velY)) < 5)
			this.lifeTime -= 1 / frameRate();
	}

	respawn(x, y) {
		this.x = x;
		this.y = y;

		this.lifeTime = random(2, 5);
		this.accX = 0;
		this.accY = 0;

		this.velX = 0;
		this.velY = 0;
	}
}


function addParticles(amount) {
	for (i = 0; i < amount; i++) {
		let p = new Particle(random(width), random(height));
		particles.unshift(p);
	}
}

function updateParticles(vf, vfWidth, vfHeight) {
	for (let i = particles.length - 1; i >= 0; i--) {
		let p = particles[i];

		if (p.x >= width || p.x < 0 || p.y < 0 || p.y >= height || p.lifeTime < 0) {
			p.respawn(random(width), random(height));
			continue;
		}

		let pX = p.x;
		let pY = p.y;

		//let id = floor(pX / width * vfWidth) + vfWidth * floor(pY / height * vfHeight);
		//update particle
		let force = getVectorInterpolated(pX, pY, vf, vfWidth, vfHeight);
		force.mult(particleSpeed);
		p.addForce(force.x, force.y);
		p.update();

		//get particle color
		let a = map(p.velX * p.velX + p.velY * p.velY, 0, 10000, 0, 1);
		let pC = lerpColor(color(particleColor1), color(particleColor2), a);

		//draw particle
		particleGraphics.stroke(pC);
		particleGraphics.line(pX, pY, p.x, p.y);
	}
}

function fadeGraphic(g, fadeAmount) {
	g.loadPixels();
	for (let i = 3; i < g.pixels.length; i += 4) {
		 g.pixels[i] = g.pixels[i] - fadeAmount;
	}
	g.updatePixels();
  }

//////////////////////// Vectorfield ///////////////////////////////

function setBrushType(type) {
	currBrushType = type;
	console.log("Brush Type: " + type);
}

function setBrushSize(val) {
	brushSize = map(val, 0, 100, brushSizeMin, brushSizeMax);
	console.log("Brush Size: " + brushSize);
}

function setBrushIntensity(val) {
	brushIntensity = map(val, 0, 100, 0, 1);
	console.log("Brush Intensity: " + brushIntensity);
}

function createVectorField(_width, _height) {
	let vf = [];
	for (let i = 0; i < _width * _height; i++) {
		vf.push(createVector(0, 0));
	}
	return vf;
}

function getVectorAnchor(vfWidth, vfHeight, vIndex, extX, extY) {
	let scaleX = float(extX) / vfWidth;
	let scaleY = float(extY) / vfHeight;
	let x = vIndex % vfWidth;
	let y = floor(vIndex / vfWidth);
	return createVector(x * scaleX + scaleX / 2, y * scaleY + scaleY / 2);
}

function displayVectorField(vg, vf, vfWidth, vfHeight, extX, extY) {
	vg.clear();
	let scaleX = extX / vfWidth;
	let scaleY = extY / vfHeight;
	let scale = min(scaleX, scaleY) / 3;
	for (let i = 0; i < vfWidth * vfHeight; i++) {
		let anchor = getVectorAnchor(vfWidth, vfHeight, i, extX, extY);
		let dir = vf[i];
		if (dir.magSq() > 0.001) {
			arrowGraphic(vg, anchor, dir, scale);
		} else {
			vg.point(anchor.x, anchor.y);
		}
	}
	image(vg, 0, 0, width, height);
}

function paintVectorField(vf, vfWidth, vfHeight, type, brushSize, intensity) {
	for (let i = 0; i < vfWidth * vfHeight; i++) {
		let anchor = getVectorAnchor(vfWidth, vfHeight, i, width, height);
		let dist = p5.Vector.sub(anchor, mouseVector).magSq();
		let amt = map(dist, 0, brushSize * brushSize, 1, 0);
		amt = constrain(amt, 0, 1);
		//amt = pow(amt, 20);
		if (amt == 0 || mouseAcc == 0)
			continue;
		amt *= intensity;
		let oldV = vf[i];
		let newV = oldV.copy();
		let vec;
		let perp;
		switch (type) {

			case brushType.PULL:
				newV = p5.Vector.lerp(oldV, smoothMouseDir, amt);
				break;

			case brushType.ORIENT:
				newV = p5.Vector.lerp(oldV, smoothMouseDir, amt);
				newV.normalize();
				newV.mult(oldV.mag());
				break;

			case brushType.ATTRACT:
				newV = p5.Vector.lerp(oldV, p5.Vector.sub(mouseVector, anchor).normalize(), amt);
				break;

			case brushType.REPULSE:
				newV = p5.Vector.lerp(oldV, p5.Vector.sub(anchor, mouseVector).normalize(), amt);
				break;

			case brushType.SWIRL_CW:
				vec = p5.Vector.sub(mouseVector, anchor).normalize();
				perp = createVector(vec.y, -vec.x);
				newV = p5.Vector.lerp(oldV, perp, amt);
				break;

			case brushType.SWIRL_CCW:
				vec = p5.Vector.sub(anchor, mouseVector).normalize();
				perp = createVector(vec.y, -vec.x);
				newV = p5.Vector.lerp(oldV, perp, amt);
				break;

			case brushType.ERASE:
				newV = p5.Vector.lerp(oldV, createVector(0, 0, 0), amt);
				break;
		}
		vf[i] = newV;
	}
}

function getVectorInterpolated(x, y, vf, vfWidth, vfHeight) {
	let xV = x / width * vfWidth;
	let yV = y / height * vfHeight;
	let xI = floor(xV);
	let yI = floor(yV);

	xI = constrain(xI, 0, vfWidth - 1);
	yI = constrain(yI, 0, vfHeight - 1);

	let id = xI + vfWidth * yI;

	let lerpX = xV - xI;
	let lerpY = yV - yI;

	lerpX = (lerpX - 0.5);
	lerpY = (lerpY - 0.5);

	let topBottom;
	let leftRight;
	let diagonal;

	//nw
	if (lerpX < 0 && lerpY < 0) {
		topBottom = id - vfWidth;
		leftRight = id - 1;
		diagonal = id - vfWidth - 1;
	}
	//ne
	else if (lerpX >= 0 && lerpY < 0) {
		topBottom = id - vfWidth;
		leftRight = id + 1;
		diagonal = id - vfWidth + 1;
	}
	//se
	else if (lerpX >= 0 && lerpY >= 0) {
		topBottom = id + vfWidth;
		leftRight = id + 1;
		diagonal = id + vfWidth + 1;
	}
	//sw
	else if (lerpX < 0 && lerpY >= 0) {
		topBottom = id + vfWidth;
		leftRight = id - 1;
		diagonal = id + vfWidth - 1;
	}

	if (topBottom < 0 || topBottom >= vf.length)
		topBottom = id;

	if (leftRight < 0 || leftRight >= vf.length)
		leftRight = id;

	if (diagonal < 0 || diagonal >= vf.length)
		diagonal = id;

	let allV;
	lerpX = abs(lerpX);
	lerpY = abs(lerpY);

	allV = vf[topBottom].copy().mult((1 - lerpX) * lerpY);
	allV = p5.Vector.add(allV, vf[leftRight].copy().mult((lerpX * (1 - lerpY))));
	allV = p5.Vector.add(allV, vf[diagonal].copy().mult((lerpX * lerpY)));
	allV = p5.Vector.add(allV, vf[id].copy().mult(((1 - lerpX) * (1 - lerpY))));

	return allV;

}

function createVectorFieldImage(_width, _height) {
	let vf = createImage(_width, _height);
	vf.loadPixels();
	let count = 4 * vf.width * vf.height;
	for (let i = 0; i < count; i += 4) {
		vf.pixels[i] = 127;
		vf.pixels[i + 1] = 127;
		vf.pixels[i + 2] = 127;
		vf.pixels[i + 3] = 255;
	}
	vf.updatePixels();
	return vf;
}

function colorToVector(r, g, b) {
	let x = map(r, 0, 255, -1.0, 1.0);
	let y = map(g, 0, 255, -1.0, 1.0);
	let z = map(b, 0, 255, -1.0, 1.0);
	return createVector(x, y, z);
}

function vectorToColor(v) {
	let r = round(map(v.x, -1.0, 1.0, 0, 255));
	let g = round(map(v.y, -1.0, 1.0, 0, 255));
	let b = round(map(v.z, -1.0, 1.0, 0, 255));
	return [r, g, b];
}


////////////////////////// arrow /////////////////////////////
/* draws an arrow to the screen */
function arrow(anchor, dir, size) {
	start = p5.Vector.add(anchor, p5.Vector.mult(dir, -size));
	end = p5.Vector.add(anchor, p5.Vector.mult(dir, size));
	line(start.x, start.y, end.x, end.y);
	let perp = createVector(dir.y, -dir.x);

	let arrowHeadSize = size / 5;
	let x1 = end.x - perp.x * arrowHeadSize;
	let y1 = end.y - perp.y * arrowHeadSize;
	let x2 = end.x + dir.x * arrowHeadSize * 2;
	let y2 = end.y + dir.y * arrowHeadSize * 2;
	let x3 = end.x + perp.x * arrowHeadSize;
	let y3 = end.y + perp.y * arrowHeadSize;
	triangle(x1, y1, x2, y2, x3, y3);
}

/* draws an arrow to the specified graphic */
function arrowGraphic(g, anchor, dir, size) {
	start = p5.Vector.add(anchor, p5.Vector.mult(dir, -size));
	end = p5.Vector.add(anchor, p5.Vector.mult(dir, size));
	g.line(start.x, start.y, end.x, end.y);
	let perp = createVector(dir.y, -dir.x);

	let arrowHeadSize = size / 5;
	let x1 = end.x - perp.x * arrowHeadSize;
	let y1 = end.y - perp.y * arrowHeadSize;
	let x2 = end.x + dir.x * arrowHeadSize * 2;
	let y2 = end.y + dir.y * arrowHeadSize * 2;
	let x3 = end.x + perp.x * arrowHeadSize;
	let y3 = end.y + perp.y * arrowHeadSize;
	g.triangle(x1, y1, x2, y2, x3, y3);
}