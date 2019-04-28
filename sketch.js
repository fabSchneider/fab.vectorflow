let vf;

let currBrushType = brushType.SWIRL_LEFT;
let brushSize = 200;
let brushIntensity = 1;
let brushHardness = 0;

let mouseVector;
let pmouseVector;
let mouseDir;
let smoothMouseDir;
let mouseAcc;
let mouseRot;

let mouseDrag = false;

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(0);
	stroke(255);
	strokeWeight(1);

	mouseVector = createVector(0, 0);
	pmouseVector = createVector(0, 0);
	mouseDir = createVector(0, 0);
	smoothMouseDir = createVector(0, 0);
	mouseAcc = 0;
	mouseRot = 0;

	vf = createVectorField(16, 32);
}


function draw() {
	//mouse variables
	pmouseVector = createVector(pmouseX, pmouseY);
	mouseVector = createVector(mouseX, mouseY);
	mouseDir = p5.Vector.sub(mouseVector, pmouseVector);
	mouseAcc = map(mouseDir.mag(), 3, 35, 0, 1);
	mouseAcc = constrain(mouseAcc, 0, 1);
	mouseDir.normalize();
	smoothMouseDir = p5.Vector.lerp(smoothMouseDir, mouseDir, mouseAcc);
	mouseRot = atan2(smoothMouseDir.y, smoothMouseDir.x);

	background(0);

	displayVectorField(vf, width, height);

	if (mouseDrag) {
		//show mouse direction
		noCursor();
		push();
		noFill();
		circle(mouseX, mouseY, brushSize);
		let dirColor = vectorToColor(smoothMouseDir);
		stroke(dirColor);
		fill(dirColor);
		arrow(mouseVector, smoothMouseDir, 100 * mouseAcc);
		pop();

		paintVectorField(vf, currBrushType, brushSize, brushIntensity, brushHardness);
	}

	// image(vf, 0, 0, 512, 512);
}

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