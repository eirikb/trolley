$(function() {
    var lastUpdate, worlds = [],
    fps = 200,
    velocityIterationsPerSecond = 300,
    positionIterationsPerSecond = 200;

    $('.play').click(function() {
        var ctx, $ex = $(this).parent().parent(),
        code = $ex.find('pre').text(),
        $draw = $ex.find('canvas'),
        dbgDraw = new b2DebugDraw();

        // Dirty hack just for the sake of this demo
        eval('world=' + code);

        dbgDraw.m_drawScale = 10;
        dbgDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);
        ctx = $draw.get(0).getContext('2d');
        dbgDraw.SetSprite(ctx);
        world.SetDebugDraw(dbgDraw);
        worlds.push(world);

        $(this).hide();
    });

    prettyPrint();

    update();

    function update() {
        var time = new Date().getTime();
        delta = (time - lastUpdate) / 1000;
        lastUpdate = time;
        if (delta > 10) delta = 1 / fps;

        $.each(worlds, function(i, w) {
            step(w, delta);
            w.DrawDebugData();
        });

        updateTimeout = window.setTimeout(function() {
            update();
        });
    }

    function step(w, delta) {
        w.ClearForces();
        delta = (typeof delta === 'undefined') ? 1 / fps: delta;
        w.Step(delta, delta * velocityIterationsPerSecond, delta * positionIterationsPerSecond);
    }
});

