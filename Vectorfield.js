function createVectorField(_width, _height) {
  let vf = createImage(_width, _height, RGB);
  vf.loadPixels();
  let d = pixelDensity();
  let count = 4 * vf.width * d * vf.height * d;
  for (let i = 0; i < count; i += 4) {
    vf.pixels[i] = 127;
    vf.pixels[i + 1] = 127;
    vf.pixels[i + 2] = 127;
    vf.pixels[i + 3] = 255;
  }
  vf.updatePixels();
  return vf;
}

function colorToVector(c) {
  let x = map(red(c), 0, 255, -1.0, 1.0);
  let y = map(green(c), 0, 255, -1.0, 1.0);
  let z = map(blue(c), 0, 255, -1.0, 1.0);
  return createVector(x, y, z);
}

function vectorToColor(v) {
  let r = round(map(v.x, -1.0, 1.0, 0, 255));
  let g = round(map(v.y, -1.0, 1.0, 0, 255));
  let b = round(map(v.z, -1.0, 1.0, 0, 255));
  let c = color(r, g, b);
  return c;
}

function getVectorAnchor(vf, vIndex, extX, extY) {
  let scaleX = float(extX) / vf.width;
  let scaleY = float(extY) / vf.height;
  let x = vIndex % vf.width;
  let y = floor(vIndex / vf.width);
  return createVector(x * scaleX + scaleX / 2, y * scaleY + scaleY / 2);
}

function displayVectorField(vf, extX, extY) {
  let scaleX = float(extX) / vf.width;
  let scaleY = float(extY) / vf.height;
  vf.loadPixels();
  let d = pixelDensity();
  let count = 4 * vf.width * d * vf.height * d;
  for (let i = 0; i < count; i += 4) {
    let x = (i / 4) % vf.width;
    let y = floor((i / 4) / vf.width);
    anchor = getVectorAnchor(vf, i / 4, extX, extY);
    let c = color(vf.pixels[i], vf.pixels[i + 1], vf.pixels[i + 2]);
    dir = colorToVector(c);
    //line(anchor.x, anchor.y,  anchor.x + dir.x * 50, anchor.y + dir.y * 50);  
    arrow(anchor, dir, min(scaleX, scaleY) / 3);
  }
}

let brushType = {
  PULL: 'pull',
  ORIENT: 'orient',
  ATTRACT: 'attract',
  REPULSE: 'repulse',
  SWIRL_RIGHT: 'swirl_right',
  SWIRL_LEFT: 'swirl_left',
  ERASE: 'erase'
}

function paintVectorField(vf, type, brushSize, intensity, hardness) {
  vf.loadPixels();
  let d = pixelDensity();
  let count = 4 * vf.width * d * vf.height * d;
  for (let i = 0; i < count; i += 4) {

    let anchor = getVectorAnchor(vf, i / 4, width, height);
    let dist = p5.Vector.sub(anchor, mouseVector).magSq();
    let amt = map(dist, 0, brushSize * brushSize, 1, 0);
    amt = constrain(amt, 0, 1);
    if (amt == 0)
      continue;
    amt *= intensity;
    let c = color(vf.pixels[i], vf.pixels[i + 1], vf.pixels[i + 2], vf.pixels[i]);
    let oldV = colorToVector(c);
    let newV = oldV.copy();
    let v;
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
      case brushType.SWIRL_RIGHT:
        v = p5.Vector.sub(anchor, mouseVector).normalize();
        perp = createVector(v.y, -v.x);
        newV = p5.Vector.lerp(oldV, perp, amt);
        break;
      case brushType.SWIRL_LEFT:
        v = p5.Vector.sub(mouseVector, anchor).normalize();
        perp = createVector(v.y, -v.x);
        newV = p5.Vector.lerp(oldV, perp, amt);
        break;
      case brushType.ERASE:
        newV = p5.Vector.lerp(oldV, createVector(0, 0, 0), amt);
        break;
    }
    newC = vectorToColor(newV);
    vf.pixels[i] = red(newC);
    vf.pixels[i + 1] = green(newC);
    vf.pixels[i + 2] = blue(newC);
  }
  vf.updatePixels();
}