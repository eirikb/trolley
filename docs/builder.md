
## Hello world
```javascript
const world = trolley.world();
world.body({ static: true }).box({ width: 15, height: 1 }).create();
world.body({ x: 5, y: 1 }).box({ width: 4, height: 2 }).create();
world.body({ x: 7, y: 3 }).box({ width: 2, height: 2 }).create();
world.body({ x: 5, y: 3 }).box({ width: 2, height: 2 }).create();
world.body({ x: 6, y: 8 }).box({ width: 2, height: 2 }).create();
world.debugDraw(canvas);
world.loop();
```

## Multiple parts of same body
```javascript
const world = trolley.world();
world.body({ static: true }).box({ width: 15, height: 1 }).create();
world.body({ x: 1, y: 1 }).box({ width: 1, height: 3 }).create();
world.body({ x: 1, y: 10 })
  .box({ x: 2, y: 2, width: 2, height: 2 })
  .circle({ size: 2 })
  .circle({ y: 4, size: 2 })
  .circle({ x: 4, size: 2 })
  .circle({ x: 4, y: 4, size: 2 }).create();
world.debugDraw(canvas);
world.loop();
```

## Body and body part options
```javascript
const world = trolley.world();
world.body({
  static: true,
  fixedRotation: true
}).box({ width: 15, height: 1 }).create();
for (let y = 1; y < 8; y += 2) {
  world.body({ x: 5, y }).box({ width: 2, height: 2 }).create();
}
world.body({ x: 4.5, y: 15 }).box({
  width: 2,
  height: 2,
  density: 150
}).create();
world.debugDraw(canvas);
world.loop();
```

<script src="../dist/trolley.min.js"></script>
<script src="main.js"></script>
