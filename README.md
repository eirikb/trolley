Trolley
===

Utility for [Box2D.js](https://github.com/HBehrens/box2d.js).  
The main idea of Trolley is to interface the _current and seemingly best_ port of Box2D and making it easier for developers to create objects in a Box2D world.

There seems to be [a bunch](http://gamedev.stackexchange.com/questions/7765/are-there-any-alternative-js-ports-of-box2d) of different ports of Box2D to JS.
Trolley is currently using [HBehrens/box2d.js](https://github.com/HBehrens/box2d.js), it is a decent version, including [compiler scripts](https://github.com/HBehrens/box2d.js/blob/master/build.sh).  
Another version that could have been used is [thinkpixellab/box2d](https://github.com/thinkpixellab/pl/tree/master/src/box2d)(pl/scr/box2d now), but it is lacking build scripts.

Usage
---

```trolley.body(x, y, isStatic)``` returns a Box2D body, every function under this returns this body for chaining.  
```.box(width, height, options)``` creates a box within the body with a given width and height.  
```.box(localPositionX, localPositionY, width, height, options)``` creates a body within the body at a given position.  
```.circle(radius, options)``` creates a circle within the body.   
```.circle(localPostionX, localPositionY, radius, options)``` creates a circle within the body at given position.  

_options_ can contain Box2D-specific values such as density and friction.

Examples
---

Create a static 'ground', a box and a 'player':

```JavaScript
// world
trolley.init();
// static 'ground'
trolley.body(0, 0, true).box(50, 1);
// just a box
trolley.body(10, 10).box(1, 1);
// player
trolley.body(15, 10).box(1, 2, {
    density: 2,
    rotate: false
}).circle(0, 2, 1);
```

References to normal Box2D objects:

```JavaScript
var world = trolley.init();
var body = trolley.body(0, 0).box(1, 1).body;

world.DestroyBody(body);
```
