const {b2DistanceJointDef, b2FixtureDef, b2World, b2PolygonShape, b2CircleShape, b2BodyDef, b2Vec2, b2_dynamicBody} = require('./box2d');

import EventEmitter from 'events';

import BodyBuilder from './body-builder';
import debugDraw from './debug-draw';
import loop from './loop';

function calcPosition(xOrY, size, totalSize) {
  return xOrY + size / 2 - totalSize / 2;
}

export default class WorldBuilder extends EventEmitter {

  constructor() {
    super();
    this.world = new b2World(new b2Vec2(0, -10));
  }

  /**
   *
   * @param [options] optional Options object
   * @param {number} x
   * @param {number} y
   * @param {boolean} [options.static]
   * @param {boolean} [options.fixedRotation]
   * @param {boolean} [options.bullet]
   * @returns {BodyBuilder}
   */
  body(options = {}) {
    return new BodyBuilder(this, options);
  }

  createBody(def) {
    const boxes = def.boxes || [];
    const circles = def.circles || [];

    let bodyWidth = 0;
    let bodyHeight = 0;
    boxes.forEach(box => {
      bodyWidth = Math.max(bodyWidth, (box.x || 0) + box.width);
      bodyHeight = Math.max(bodyHeight, (box.x || 0) + box.height);
    });
    circles.forEach(circle => {
      bodyWidth = Math.max(bodyWidth, (circle.x || 0) + circle.size);
      bodyHeight = Math.max(bodyHeight, (circle.y || 0) + circle.size);
    });

    const bodyDef = new b2BodyDef();
    const x = (def.x || 0) + bodyWidth / 2;
    const y = (def.y || 0) + bodyHeight / 2;
    bodyDef.set_position(new b2Vec2(x, y));

    if (!def.static) {
      bodyDef.set_type(b2_dynamicBody);
    }
    if (def.fixedRotation) {
      bodyDef.set_fixedRotation(true);
    }
    if (def.bullet) {
      bodyDef.set_bullet(true);
    }
    const body = this.world.CreateBody(bodyDef);

    function createFixture(subDef, shape) {
      const fixtureDef = new b2FixtureDef();
      fixtureDef.set_density(subDef.density || 1);
      fixtureDef.set_shape(shape);
      body.CreateFixture(fixtureDef);
    }

    boxes.forEach(box => {
      const shape = new b2PolygonShape();
      shape.SetAsBox(box.width / 2, box.height / 2);
      for (let i = 0; i < shape.GetVertexCount(); i++) {
        const vertex = shape.GetVertex(i);
        const diffX = calcPosition((box.x || 0), box.width, bodyWidth);
        const diffY = calcPosition((box.y || 0), box.height, bodyHeight);
        vertex.set_x(vertex.get_x() + diffX);
        vertex.set_y(vertex.get_y() + diffY);
      }
      createFixture(box, shape);
    });

    circles.forEach(circle => {
      const shape = new b2CircleShape();
      shape.set_m_radius(circle.size / 2);
      const x = calcPosition((circle.x || 0), circle.size, bodyWidth);
      const y = calcPosition((circle.y || 0), circle.size, bodyHeight);
      shape.get_m_p().set_x(x);
      shape.get_m_p().set_y(y);
      createFixture(circle, shape);
    });

    return body;
  }

  createJoint(a, ax, ay, b, bx, by) {
    const jointDef = new b2DistanceJointDef();
    jointDef.set_bodyA(a);
    jointDef.set_bodyB(b);
    jointDef.set_localAnchorB(new b2Vec2(ax, ay));
    jointDef.set_localAnchorA(new b2Vec2(bx, by));
    this.world.CreateJoint(jointDef);
  }

  debugDraw(canvas, options) {
    this._debugDraw = debugDraw(this.world, canvas, options);
  }

  loop(fps = 60) {
    loop((delta, velocityIterations, positionIteration) => {
      this.world.Step(delta, velocityIterations, positionIteration);
      this.world.ClearForces();
      if (this._debugDraw) {
        this._debugDraw._draw();
      }
    }, fps);
  }
}
