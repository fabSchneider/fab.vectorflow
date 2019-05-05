let vf;
let vfWidth;
let vfHeight;

let maxSize = 1000;

let currBrushType = brushType.PULL;
let brushSize = 450;
let brushIntensity = 1;
let brushHardness = 0;

let mouseVector;
let pmouseVector;
let mouseDir;
let smoothMouseDir;
let mouseAcc;
let mouseRot;

let mouseDrag = false;

let particles = [];
let particleCount = 500;
let particleFade = 10;
let particleSize = 2;
let particleSpeed = 10;
let particleFriction = 0.9;

let particleGraphics;

let showVectorField = true;
let showParticles = false;

function setup() {
	document.getElementById("toggleVectorfield").onclick = toggleVectorfieldDisplay;
	document.getElementById("spawnParticles").onclick = spawnParticles;

	pixelDensity(1);
	noCursor();

	let cvn = createCanvas(windowWidth, windowHeight - 40);
	cvn.position(0, 50);
	background(0);
	stroke(255);
	strokeWeight(1);

	mouseVector = createVector(0, 0);
	pmouseVector = createVector(0, 0);
	mouseDir = createVector(0, 0);
	smoothMouseDir = createVector(0, 0);
	mouseAcc = 0;
	mouseRot = 0;

	vfWidth = round(width / 32);
	vfHeight = round(height / 32);
	vf = createVectorField(vfWidth, vfHeight);

	particleGraphics = createGraphics(width, height);
	particleGraphics.pixelDensity(1);
	particleGraphics.strokeWeight(0.1);
	particleGraphics.stroke(0);
}


function draw() {
	//mouse variables
	pmouseVector = createVector(pmouseX, pmouseY);
	mouseVector = createVector(mouseX, mouseY);
	mouseDir = p5.Vector.sub(mouseVector, pmouseVector);
	mouseAcc = 20;
	mouseAcc = map(mouseDir.mag(), 3, 35, 0, 1);
	mouseAcc = constrain(mouseAcc, 0, 1);
	mouseDir.normalize();
	smoothMouseDir = p5.Vector.lerp(smoothMouseDir, mouseDir, mouseAcc);
	mouseRot = atan2(smoothMouseDir.y, smoothMouseDir.x);

	background(0);

	if (showParticles) {
		if (!showVectorField) {
			particleGraphics.fill(0, particleFade);
			particleGraphics.noStroke();
			particleGraphics.strokeWeight(particleSize);
			particleGraphics.rect(0, 0, width, height);
			updateParticles(vf, vfWidth, vfHeight);
		}

		image(particleGraphics, 0, 0, width, height);
	}

	if (showVectorField)
		displayVectorField(vf, vfWidth, vfHeight, width, height);

	//drawCursor
	line(mouseX, mouseY - 10, mouseX, mouseY + 10);
	line(mouseX - 10, mouseY, mouseX + 10, mouseY);

	if (mouseDrag) {
		//show mouse direction
		noCursor();
		push();
		noFill();
		ellipse(mouseX, mouseY, brushSize, brushSize);
		let dirColor = vectorToColor(smoothMouseDir);
		stroke(dirColor);
		fill(dirColor);
		arrow(mouseVector, smoothMouseDir, 100 * mouseAcc);
		pop();
		paintVectorField(vf, vfWidth, vfHeight, currBrushType, brushSize, brushIntensity, brushHardness);
	}
}

//////////////////// events ////////////////////

function mouseDragged() {
	mouseDrag = true;
}

function mouseReleased() {
	mouseDrag = false;
}

function touchMoved() {
	mouseDrag = true;
	return false;
}

function touchStarted() {
	if (touches.length == 2) {
		vf = createVectorField(vf.width, vf.height);
	}
}

function keyPressed() {
	switch (key) {
		case ' ':
			showParticles = !showParticles;
			if (showParticles)
				randomParticles(particleCount);
			break;
		case 'V':
			showVectorField = !showVectorField;
			break;
		case 'D':
			console.log(`Pixel count: ${vf.pixels.length}\nWidth: ${vf.width}\nHeight: ${vf.height}`);
			break;
	}
}

function toggleVectorfieldDisplay() {
	showVectorField = !showVectorField;
}

function spawnParticles() {
	showParticles = !showParticles;
	if (showParticles)
		randomParticles(particleCount);

}

//////////////////////// particles ///////////////////////////

function randomParticles(amount) {
	for (i = 0; i < amount; i++) {
		let p = new Particle(random(width), random(height));
		particles.unshift(p);
	}
}

function updateParticles(vf, vfWidth, vfHeight) {
	let remove = [];
	for (let i = particles.length - 1; i >= 0; i--) {
		let p = particles[i];
		if (p.x >= width || p.x <= 0 || p.y >= height || p.y <= 0) {
			particles[i] = new Particle(random(width), random(height));
			continue;
		}
		let pX = p.x;
		let pY = p.y;

		let id = floor(pX / width * vfWidth) + vfWidth * floor(pY / height * vfHeight);
		//update particle
		let force = vf[id].copy();
		force.mult(particleSpeed);
		p.addForce(force.x, force.y);
		p.update();

		//get particle color
		let a = map(p.velX * p.velX + p.velY * p.velY, 0, 10000, 0, 1);
		let pC = lerpColor(color(`#EA93B7`), color(`#26FAF5`), a);

		//draw particle
		particleGraphics.stroke(pC);
		particleGraphics.line(pX, pY, p.x, p.y);
	}
}