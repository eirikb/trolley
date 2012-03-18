trolley = (function() {
    var world;

    function exp(a, b) {
        var opt;
        for (opt in b) {
            if (b.hasOwnProperty(opt)) {
                a[opt] = b[opt];
            }
        }
        return a;
    }

    function init(w) {
        world = new b2World(new b2Vec2(0.0, - 9.81), true);
        world.SetWarmStarting(true);
        return world;
    }

    function body(x, y, isStatic) {
        var options;
        if (arguments.length < 2) throw 'body needs x and y';
        return (function() {
            var body, self = this,
            bodyDef = new b2BodyDef();

            if (typeof isStatic === 'boolean' && isStatic) {
                bodyDef.type = b2Body.b2_staticBody;
            } else {
                bodyDef.type = b2Body.b2_dynamicBody;
            }

            // If isStatic is actually a object of options
            if (typeof isStatic === 'object') exp(bodyDef, isStatic);
            bodyDef.position.Set(x, y);
            body = self.body = self.b = world.CreateBody(bodyDef);

            // Helpers
            body.width = 0;
            body.height = 0;

            function fixture(shape, options) {
                fixtureDef = new b2FixtureDef();
                exp(fixtureDef, {
                    density: 1
                });
                exp(fixtureDef, options);
                fixtureDef.shape = shape;
                var f = self.body.CreateFixture(fixtureDef);
                return self;
            }

            self.box = function(localX, localY, width, height, options) {
                var midW, midH, shape;
                if (arguments.length < 2) throw 'box must have width and height';
                if (arguments.length < 4) {
                    options = width;
                    width = localX;
                    height = localY;
                    localX = localY = 0;
                }

                if (localX + width > body.width) body.width = localX + width;
                if (localY + height > body.height) body.height = localY + height;

                midW = width / 2;
                midH = height / 2;
                localX += midW;
                localY += midH;
                shape = new b2PolygonShape.AsBox(midW, midH);
                shape.m_vertices.forEach(function(v) {
                    v.x += localX;
                    v.y += localY;
                });
                return fixture(shape, options);
            };

            // This is le bork
            self.polygon = function(localX, localY, polygons, options) {
                var midR, shape;
                if (arguments.length < 1) throw 'polygon must have an array of arrays';
                if (arguments.length < 3) {
                    options = localY;
                    polygons = localX;
                    localX = localY = 0;
                }
                polygons = polygons.map(function(p) {
                    return new b2Vec2(p[0], p[1]);
                });
                shape = new b2PolygonShape.AsArray(polygons, polygons.length);
                return fixture(shape, options);
            };

            self.circle = function(localX, localY, radius, options) {
                var midR, shape;
                if (arguments.length < 1) throw 'circle must have radius';
                if (arguments.length < 3) {
                    options = localY;
                    radius = localX;
                    localX = localY = 0;
                }

                if (localX + radius > body.width) body.width = localX + radius;
                if (localY + radius > body.height) body.height = localY + radius;

                midR = radius / 2;
                shape = new b2CircleShape(midR);
                localX += midR;
                localY += midR;
                shape.SetLocalPosition(new b2Vec2(localX, localY));
                return fixture(shape, options);
            };

            self.b = box;
            self.c = circle;
            return self;
        } ());
    }

    function joint() {
        return (function() {
            var self = this,
            bodies = [],
            jointDef = new b2DistanceJointDef();

            function addBody(b, bx, by) {
                var bp = b.GetPosition();
                if (arguments.length === 1) {
                    bx = by = 0;
                }
                bx += bp.x;
                by += bp.y;
                bodies.push([b, bx, by]);
                if (bodies.length === 2) {
                    self.joint = jointDef.Initialize(bodies[0][0], bodies[1][0], new b2Vec2(bodies[0][1], bodies[0][2]), new b2Vec2(bodies[1][1], bodies[1][2]));
                    world.CreateJoint(jointDef);
                }
                return self;
            }

            self.a = self.b = addBody;

            return self;
        } ());
    }

    return {
        init: init,
        body: body,
        b: body,
        joint: joint
    };
})();

