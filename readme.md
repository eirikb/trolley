Kickstart your Box2D JavaScript experience!  

See the [builder demos](https://eirikb.github.io/trolley/docs/builder) for examples.

Trolley aims to find the _currently best direct_ port of Box2D and make it easier to use.
  * Easy install for browser, nodejs and bundler (e.g., webpack).
  * Helper function for debug draw to a given canvas.
  * Helper function for looping/running/stepping.
  * Get-started builder interface for world building.

Trolley have used several ports, the current one is [kripken/box2d.js](https://github.com/kripken/box2d.js), which is
an emscripten-based direct port.
This is the first time Trolley use a direct port from the original code.

## Install

```bash
npm install @eirikb/trolley
```
    
### Include
```javascript
// From nodejs:
const trolley = require('@eirikb/trolley');

// From bundler (e.g., webpack):
import trolley from '@eirikb/trolley';

// From direct reference (e.g., CDN):
const trolley = window.trolley;
```
    
The installed script includes Box2D.

## Builder

The world builder interface is available from `trolley.world`.
See the [builder demos](https://eirikb.github.io/trolley/docs/builder) for examples.

```javascript
const world = trolley.world();
const body = world.body({ x: 10, y: 10, static: true });
body.box({ width: 2, height: 2 });
body.create();
```

## Related

There are several 2D physics libraries for JavaScript today;
[PhysicsJS](https://github.com/wellcaffeinated/PhysicsJS),
[p2.js](https://github.com/schteppe/p2.js),
[matter-js](https://github.com/liabru/matter-js) and
[pas lanck.js](https://github.com/shakiba/planck.js)
to mention some.  
Of these planck.js is the most related one, as it's a from-scratch JavaScript rewrite of Box2D.

## License

zlib, same as box2d.js and Box2D.
