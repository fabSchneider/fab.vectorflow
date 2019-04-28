/* draws an arrow to the screen */
function arrow(anchor, dir, size) {
  start = p5.Vector.add(anchor, p5.Vector.mult(dir, -size));
  end = p5.Vector.add(anchor, p5.Vector.mult(dir, size));
  line(start.x, start.y, end.x, end.y);
  perp = createVector(dir.y, -dir.x);

  let arrowHeadSize = size / 5;
  let x1 = end.x - perp.x * arrowHeadSize;
  let y1 = end.y - perp.y * arrowHeadSize;
  let x2 = end.x + dir.x * arrowHeadSize * 2;
  let y2 = end.y + dir.y * arrowHeadSize * 2;
  let x3 = end.x + perp.x * arrowHeadSize;
  let y3 = end.y + perp.y * arrowHeadSize;
  triangle(x1, y1, x2, y2, x3, y3);
}