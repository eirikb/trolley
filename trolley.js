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
        if (arguments.length < 2) throw 'body needs x and y';
        return (function() {
            var self = this,
            bodyDef = new b2BodyDef();

            if (isStatic) {
                bodyDef.type = b2Body.b2_staticBody;
            } else {
                bodyDef.type = b2Body.b2_dynamicBody;
            }
            bodyDef.position.Set(x, y);
            self.body = self.b = world.CreateBody(bodyDef);

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
                if (arguments.length < 2) throw 'box must have width and height';
                if (arguments.length < 4) {
                    options = width;
                    width = localX;
                    height = localY;
                    localX = localY = 0;
                }
                var shape = new b2PolygonShape.AsBox(width, height);
                shape.m_vertices.forEach(function(v) {
                    v.x += localX;
                    v.y += localY;
                });
                return fixture(shape, options);
            };
            self.circle = function(localX, localY, radius, options) {
                if (arguments.length < 1) throw 'circle must have radius';
                if (arguments.length < 3) {
                    options = localY;
                    radius = localX;
                    localX = localY = 0;
                }
                var shape = new b2CircleShape(radius);
                shape.SetLocalPosition(new b2Vec2(localX, localY));
                return fixture(shape, options);
            };

            return self;
        } ());
    }

    return {
        init: init,
        body: body,
        b: body
    };
})();

