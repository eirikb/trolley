import WorldBuilder from './world-builder';
import Box2D from './box2d';
import debugDraw from './debug-draw';
import loop from './loop';
import serialize from './serialize';

export default {
  Box2D,
  debugDraw,
  loop,
  serialize,

  /**
   *
   * @returns {WorldBuilder}
   */
  world() {
    return new WorldBuilder();
  }
}
