import Box2D from './box2d.js';

const myQueryCallback = new Box2D.JSQueryCallback();

myQueryCallback.ReportFixture = function (fixturePtr) {
  var fixture = Box2D.wrapPointer(fixturePtr, Box2D.b2Fixture);
  if (fixture.GetBody().GetType() != Box2D.b2_dynamicBody) //mouse cannot drag static bodies around
    return true;
  if (!fixture.TestPoint(this.m_point))
    return true;
  this.m_fixture = fixture;
  return false;
};

export default class MouseControl {

  constructor(canvas, world) {
    this.canvas = canvas;
    this.world = world;
    this.mouseJointGroundBody = world.CreateBody(new Box2D.b2BodyDef());
    this.canvasOffset = {
      x: canvas.width / 2, y: canvas.height / 2 + 100
    };
    this.PTM = 20;

    canvas.addEventListener('mousemove', (evt) => {
      this.onMouseMove(canvas, evt);
    }, false);

    canvas.addEventListener('mousedown', (evt) => {
      this.onMouseDown(canvas, evt);
    }, false);

    canvas.addEventListener('mouseup', (evt) => {
      this.onMouseUp(canvas, evt);
    }, false);

    canvas.addEventListener('mouseout', (evt) => {
      this.onMouseOut(canvas, evt);
    }, false);
  }

  getWorldPointFromPixelPoint(pixelPoint) {
    return {
      x: (pixelPoint.x - this.canvasOffset.x) / this.PTM,
      y: (pixelPoint.y - (this.canvas.height - this.canvasOffset.y)) / this.PTM
    };
  }


  updateMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    this.mousePosPixel = {
      x: evt.clientX - rect.left,
      y: canvas.height - (evt.clientY - rect.top)
    };
    this.mousePosWorld = this.getWorldPointFromPixelPoint(this.mousePosPixel);
  }

  onMouseMove(canvas, evt) {
    this.prevMousePosPixel = this.mousePosPixel;
    this.updateMousePos(canvas, evt);
    // if (shiftDown) {
    //   this.canvasOffset.x += (this.mousePosPixel.x - prevMousePosPixel.x);
    //   this.canvasOffset.y -= (this.mousePosPixel.y - prevMousePosPixel.y);
    //   draw();
    // }
    // else if (mouseDown && mouseJoint != null) {
    if (this.mouseDown && this.mouseJoint != null) {
      this.mouseJoint.SetTarget(new Box2D.b2Vec2(this.mousePosWorld.x, this.mousePosWorld.y));
    }
  }

  startMouseJoint() {

    if (this.mouseJoint != null)
      return;

    // Make a small box.
    var aabb = new Box2D.b2AABB();
    var d = 0.001;
    aabb.set_lowerBound(new Box2D.b2Vec2(this.mousePosWorld.x - d, this.mousePosWorld.y - d));
    aabb.set_upperBound(new Box2D.b2Vec2(this.mousePosWorld.x + d, this.mousePosWorld.y + d));

    // Query the world for overlapping shapes.
    myQueryCallback.m_fixture = null;
    myQueryCallback.m_point = new Box2D.b2Vec2(this.mousePosWorld.x, this.mousePosWorld.y);
    this.world.QueryAABB(myQueryCallback, aabb);

    if (myQueryCallback.m_fixture) {
      var body = myQueryCallback.m_fixture.GetBody();
      var md = new Box2D.b2MouseJointDef();
      md.set_bodyA(this.mouseJointGroundBody);
      md.set_bodyB(body);
      md.set_target(new Box2D.b2Vec2(this.mousePosWorld.x, this.mousePosWorld.y));
      md.set_maxForce(1000 * body.GetMass());
      md.set_collideConnected(true);

      this.mouseJoint = Box2D.castObject(this.world.CreateJoint(md), Box2D.b2MouseJoint);
      body.SetAwake(true);
    }
  }

  onMouseDown(canvas, evt) {
    this.updateMousePos(canvas, evt);
    if (!this.mouseDown) {
      this.startMouseJoint();
    }
    this.mouseDown = true;
  }

  onMouseUp(canvas, evt) {
    this.mouseDown = false;
    this.updateMousePos(canvas, evt);
    if (this.mouseJoint != null) {
      this.world.DestroyJoint(this.mouseJoint);
      this.mouseJoint = null;
    }
  }

  onMouseOut(canvas, evt) {
    this.onMouseUp(canvas, evt);
  }
}

