const {JSDraw, b2Vec2, wrapPointer, b2Color, b2Transform} = require('./box2d.js');
import MouseControl from './mouse.js';

function drawAxes(context) {
  context.strokeStyle = 'rgb(192,0,0)';
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(1, 0);
  context.stroke();
  context.strokeStyle = 'rgb(0,192,0)';
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, 1);
  context.stroke();
}

function drawGrid(canvas, context) {
  context.lineWidth = 0.1;

  context.strokeStyle = 'rgb(255,255,255, 0.8)';
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  context.moveTo(centerX, 0);
  context.lineTo(centerX, canvas.height);
  context.stroke();
  context.moveTo(0, centerY);
  context.lineTo(canvas.width, centerY);
  context.stroke();

  context.strokeStyle = 'rgb(255,255,255, 0.2)';
  const gridSize = 20;
  for (let x = 0; x < canvas.width; x += gridSize) {
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
  context.lineWidth = 2;
}

function copyVec2(vec) {
  return new b2Vec2(vec.get_x(), vec.get_y());
}

function scaledVec2(vec, scale) {
  return new b2Vec2(scale * vec.get_x(), scale * vec.get_y());
}

function setColorFromDebugDrawCallback(context, color) {
  const col = wrapPointer(color, b2Color);
  const red = (col.get_r() * 255) | 0;
  const green = (col.get_g() * 255) | 0;
  const blue = (col.get_b() * 255) | 0;
  const colStr = red + "," + green + "," + blue;
  context.fillStyle = "rgba(" + colStr + ",0.5)";
  context.strokeStyle = "rgb(" + colStr + ")";
}

function drawSegment(context, vert1, vert2) {
  const vert1V = wrapPointer(vert1, b2Vec2);
  const vert2V = wrapPointer(vert2, b2Vec2);
  context.beginPath();
  context.moveTo(vert1V.get_x(), vert1V.get_y());
  context.lineTo(vert2V.get_x(), vert2V.get_y());
  context.stroke();
}

function drawPolygon(context, vertices, vertexCount, fill) {
  context.beginPath();
  for (let tmpI = 0; tmpI < vertexCount; tmpI++) {
    const vert = wrapPointer(vertices + (tmpI * 8), b2Vec2);
    if (tmpI === 0)
      context.moveTo(vert.get_x(), vert.get_y());
    else
      context.lineTo(vert.get_x(), vert.get_y());
  }
  context.closePath();
  if (fill)
    context.fill();
  context.stroke();
}

function drawCircle(context, center, radius, axis, fill) {
  const centerV = wrapPointer(center, b2Vec2);
  const axisV = wrapPointer(axis, b2Vec2);

  context.beginPath();
  context.arc(centerV.get_x(), centerV.get_y(), radius, 0, 2 * Math.PI, false);
  if (fill)
    context.fill();
  context.stroke();

  if (fill) {
    //render axis marker
    const vert2V = copyVec2(centerV);
    vert2V.op_add(scaledVec2(axisV, radius));
    context.beginPath();
    context.moveTo(centerV.get_x(), centerV.get_y());
    context.lineTo(vert2V.get_x(), vert2V.get_y());
    context.stroke();
  }
}

function drawTransform(context, transform) {
  const trans = wrapPointer(transform, b2Transform);
  const pos = trans.get_p();
  const rot = trans.get_q();

  context.save();
  context.translate(pos.get_x(), pos.get_y());
  context.scale(0.5, 0.5);
  context.rotate(rot.GetAngle());
  context.lineWidth *= 2;
  drawAxes(context);
  context.restore();
}

/**
 *
 * @param (b2World) world
 * @param (HTMLCanvasElement) canvas
 * @param options
 */
export default (world, canvas, options = {}) => {
  world = world.instance || world;
  const context = canvas.getContext('2d');
  const debugDraw = new JSDraw();

  debugDraw.DrawSegment = (vert1, vert2, color) => {
    setColorFromDebugDrawCallback(context, color);
    drawSegment(context, vert1, vert2);
  };

  debugDraw.DrawPolygon = (vertices, vertexCount, color) => {
    setColorFromDebugDrawCallback(context, color);
    drawPolygon(context, vertices, vertexCount, false);
  };

  debugDraw.DrawSolidPolygon = (vertices, vertexCount, color) => {
    setColorFromDebugDrawCallback(context, color);
    drawPolygon(context, vertices, vertexCount, true);
  };

  debugDraw.DrawCircle = (center, radius, color) => {
    setColorFromDebugDrawCallback(context, color);
    const dummyAxis = b2Vec2(0, 0);
    drawCircle(context, center, radius, dummyAxis, false);
  };

  debugDraw.DrawSolidCircle = (center, radius, axis, color) => {
    setColorFromDebugDrawCallback(context, color);
    drawCircle(context, center, radius, axis, true);
  };

  debugDraw.DrawTransform = (transform) => drawTransform(context, transform);

  debugDraw._draw = () => {
    const PTM = options.ptm || 10;
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (options.grid) {
      drawGrid(canvas, context);
    }

    context.save();
    context.translate(canvas.width / 2, canvas.height / 2 + 100);
    context.scale(1, -1);
    context.scale(PTM, PTM);
    context.lineWidth /= PTM;


    context.fillStyle = 'rgb(255,255,0)';
    world.DrawDebugData();

    context.restore();
  };

  const shapeBit = 0x0001;
  const jointBit = 0x0002;
  const aabbBit = 0x0004;
  const pairBit = 0x0008;
  const centerOfMassBit = 0x0010;

  let flags = shapeBit;
  if (options.joint) {
    flags |= jointBit;
  }
  if (options.aabb) {
    flags |= aabbBit;
  }
  if (options.pair) {
    flags |= pairBit;
  }
  if (options.centerOfMass) {
    flags |= centerOfMassBit;
  }
  debugDraw.SetFlags(flags);

  world.SetDebugDraw(debugDraw);

  if (options.mouse) {
    new MouseControl(canvas, world);
  }

  return debugDraw;
};
