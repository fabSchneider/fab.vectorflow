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

let brushType = {
  PULL: 'pull',
  ORIENT: 'orient',
  ATTRACT: 'attract',
  REPULSE: 'repulse',
  SWIRL_RIGHT: 'swirl_right',
  SWIRL_LEFT: 'swirl_left',
  ERASE: 'erase'
}

function displayVectorField(vf, vfWidth, vfHeight, extX, extY) {
  let scaleX = extX / vfWidth;
  let scaleY = extY / vfHeight;
  let scale = min(scaleX, scaleY) / 3;
  for (let i = 0; i < vfWidth * vfHeight; i++) {
    let anchor = getVectorAnchor(vfWidth, vfHeight, i, extX, extY);
    let dir = vf[i];
    if (dir.magSq() > 0.001) {
      arrow(anchor, dir, scale);
    } else {
      point(anchor.x, anchor.y);
    }
  }
}


function paintVectorField(vf, vfWidth, vfHeight, type, brushSize, intensity, hardness) {
  for (let i = 0; i < vfWidth * vfHeight; i++) {
    let anchor = getVectorAnchor(vfWidth, vfHeight, i, width, height);
    let dist = p5.Vector.sub(anchor, mouseVector).magSq();
    let amt = map(dist, 0, brushSize * brushSize, 1, 0);
    amt = constrain(amt, 0, 1);
    if (amt == 0)
      continue;
    amt *= intensity;
    let oldV = vf[i]
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
    vf[i] = newV;
  }
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