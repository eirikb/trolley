trolley = (function() {
    var world;

    // Helper functions
    function extend(a, b) {
        var opt;
        for (opt in b) {
            if (b.hasOwnProperty(opt)) {
                a[opt] = b[opt];
            }
        }
        return a;
    }

    function extendDefaults(a, b) {
        var opt;
        for (opt in b) {
            if (b.hasOwnProperty(opt)) {
                if (typeof a[opt] === 'undefined') a[opt] = b[opt];
            }
        }
        return a;
    }

    // Array.prototype.forEach ish
    function each(arr, cb) {
        var i, count = 0;

        arr = [].concat(arr);
        for (i = 0; i < arr.length; i++) {
            if (typeof arr[i] !== 'undefined') {
                cb(arr[i], count);
                count++;
            }
        }
    }

    function calcPosition(xOrY, size, totalSize) {
        return xOrY + size / 2 - totalSize / 2;
    }

    function init(w) {
        world = w;
        // Create a new world if not given
        if (!world) {
            world = new b2World(new b2Vec2(0.0, - 9.81), true);
            world.SetWarmStarting(true);
        }
        return world;
    }

    function body(x, y, isStatic) {
        var wrapper = {
            boxes: [],
            circles: [],
            width: 0,
            height: 0,
            bodyDef: new b2BodyDef()
        };

        // If it's an object
        if (arguments.length === 1) {
            isStatic = x.isStatic;
            y = x.y;
            x = x.x;
        }

        if (typeof isStatic === 'boolean' && isStatic) {
            wrapper.bodyDef.type = b2Body.b2_staticBody;
        } else {
            wrapper.bodyDef.type = b2Body.b2_dynamicBody;
        }

        // If isStatic is actually an object of options
        if (typeof isStatic === 'object') extend(wrapper.bodyDef, isStatic);

        function updateExpand(obj) {
            obj.x = Math.abs(obj.x);
            obj.y = Math.abs(obj.y);
            if (obj.x + obj.width > wrapper.width) wrapper.width = obj.x + obj.width;
            if (obj.y + obj.height > wrapper.height) wrapper.height = obj.y + obj.height;
        }

        wrapper.box = function(x, y, width, height, options) {
            var box;
            if (arguments.length < 1) throw 'box must have arguments, at least object or width, height';
            if (arguments.length === 1) box = x;
            if (arguments.length < 4) {
                options = width;
                width = x;
                height = y;
                x = y = 0;
            }
            if (!box) {
                box = {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    options: options
                };
            }
            wrapper.boxes.push(box);
            updateExpand(box);
            return wrapper;
        };

        wrapper.circle = function(x, y, size, options) {
            var circle;
            if (arguments.length < 1) throw 'circle must have arguments, at least object or size';
            // First argument was an object, set that as circle
            if (arguments.length === 1 && typeof x !== 'number') circle = x;
            if (arguments.length < 3) {
                options = y;
                size = x;
                x = y = 0;
            }
            if (!circle) {
                circle = {
                    x: x,
                    y: y,
                    size: size,
                    options: options
                };
            }
            wrapper.circles.push(circle);
            updateExpand(circle);
            return wrapper;
        };

        wrapper.create = function() {
            var body, w = wrapper.width / 2,
            h = wrapper.height / 2;

            wrapper.bodyDef.position.Set(x + w, y + h);
            body = world.CreateBody(wrapper.bodyDef);

            function createFixture(shape, options) {
                fixtureDef = new b2FixtureDef();
                extend(fixtureDef, {
                    density: 1
                });
                extend(fixtureDef, options);
                fixtureDef.shape = shape;
                body.CreateFixture(fixtureDef);
            }

            each(wrapper.boxes, function(box) {
                var shape = new b2PolygonShape.AsBox(box.width / 2, box.height / 2),
                diffX = calcPosition(box.x, box.width, wrapper.width),
                diffY = calcPosition(box.y, box.height, wrapper.height);

                shape.m_vertices.forEach(function(v) {
                    v.x += diffX;
                    v.y += diffY;
                });
                createFixture(shape, box.options);
            });

            each(wrapper.circles, function(circle) {
                var shape = new b2CircleShape(circle.size / 2),
                cx = calcPosition(circle.x, circle.size, wrapper.width),
                cy = calcPosition(circle.y, circle.size, wrapper.height);

                shape.SetLocalPosition(new b2Vec2(cx, cy));
                createFixture(shape, circle.options);
            });

            // TODO: Don't augment, cache with Array can be too slow
            body.width = wrapper.width;
            body.height = wrapper.height;
            return body;
        };

        wrapper.b = wrapper.box;
        wrapper.c = wrapper.circle;
        return wrapper;
    }

    function joint() {
        var wrapper = {},
        bodies = [],
        jointDef = new b2DistanceJointDef();

        function addBody(b, bx, by) {
            var b1vec, b2vec, bp = b.GetPosition();
            if (arguments.length === 1) {
                bx = by = 0;
            }
            bx = calcPosition(bx, 0, b.width);
            by = calcPosition(by, 0, b.width);
            bx += bp.x;
            by += bp.y;
            bodies.push([b, bx, by]);
            if (bodies.length === 2) {
                b1vec = new b2Vec2(bodies[0][1], bodies[0][2]);
                b2vec = new b2Vec2(bodies[1][1], bodies[1][2]);
                wrapper.joint = jointDef.Initialize(bodies[0][0], bodies[1][0], b1vec, b2vec);
                world.CreateJoint(jointDef);
            }
            return wrapper;
        }

        wrapper.a = wrapper.b = addBody;

        return wrapper;
    }

    function position(b) {
        // Get the actual position and ref (contains width and height of body)
        var origoVec = b.GetPosition();
        if (typeof b.width === 'undefined' || typeof b.height === 'undefined') {
            // TODO: Calclulate width and height
            b.width = 0;
            b.height = 0;
        }
        return {
            x: origoVec.x - b.width / 2,
            y: origoVec.y - b.height / 2,
            origo: {
                x: origoVec.x,
                y: origoVec.y
            },
            width: b.width,
            height: b.height
        };
    }

    // [{x:0,y:0,isStatic:false,options:{},boxes:[{x:0,y:0,width:1,height:1,options{}],circles:...}]
    function build(objs) {
        var wrapper = {
            bodyWraps: []
        };

        wrapper.create = function() {
            each(wrapper.bodyWraps, function(bwrap) {
                bwrap.create();
            });
        };

        each(objs, function(b) {
            var bwrap;

            b = extendDefaults(b, {
                x: 0,
                y: 0,
                isStatic: false,
                options: {}
            });
            bwrap = body(b);
            each(b.boxes, function(box) {
                box = extendDefaults(box, {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1,
                    options: {}
                });
                bwrap.box(box);
            });
            each(b.circles, function(circle) {
                circle = extendDefaults(circle, {
                    x: 0,
                    y: 0,
                    size: 1,
                    options: {}
                });
                bwrap.circle(circle);
            });
            wrapper.bodyWraps.push(bwrap);
        });
        return wrapper;
    }

    return {
        init: init,
        body: body,
        b: body,
        joint: joint,
        position: position,
        pos: position,
        build: build
    };
})();

