import test from 'ava';
import trolley from './dist/trolley.min'
import fs from 'fs';

test('imported proeprties', t => {
  t.deepEqual('object', typeof trolley.Box2D);
  t.deepEqual('function', typeof trolley.debugDraw);
  t.deepEqual('function', typeof trolley.loop);
  t.deepEqual('function', typeof trolley.world);
});

test('required proeprties', t => {
  const trolley2 = require('./dist/trolley.min');
  t.deepEqual('object', typeof trolley2.Box2D);
  t.deepEqual('function', typeof trolley2.debugDraw);
  t.deepEqual('function', typeof trolley2.loop);
  t.deepEqual('function', typeof trolley2.world);
});

test('Create a body with a box', t => {
  const world = trolley.world();
  world.body().box({width: 1, height: 1}).create();
  t.true(true);
});

test('Serialize world', t => {
  const world = trolley.world();
  // console.log('...');
  // console.log(require('util').inspect(world.world, {showHidden: true, colors: true, depth: 2, showProxy: true}));
  //console.log(trolley.serialize(world.world));
  t.true(true);
});

test('Run all demos in builder.md', t => {
  const buildermd = fs.readFileSync('./docs/builder.md', 'utf8');

  const scripts = buildermd.split('```javascript').slice(1).map(part =>
    part.split('```')[0]
  );

  const dummyCanvas = {
    getContext() {
      return {};
    }
  };

  t.plan(scripts.length);
  for (let script of scripts) {
    // Remove the loop, it will cause havoc
    script = script.replace(/world\.loop\(\)/, '');
    new Function('trolley', 'canvas', script)(trolley, dummyCanvas);
    t.pass();
  }
});
