export default (cb, fps = 60) => {
  let lastStamp = null;

  function step(stamp) {
    if (!lastStamp) {
      lastStamp = stamp;
      return;
    }

    let delta = (stamp - lastStamp);
    // fps under 25 will be forced to {set} fps, guessing boot
    if (delta >= 100 / 25) {
      delta = 1000 / fps;
    }
    delta /= 1000;
    lastStamp = stamp;
    const velocityIterations = delta * fps * 10;
    const positionIteration = delta * fps * 8;

    cb(delta, velocityIterations, positionIteration);
  }

  if (typeof requestAnimationFrame !== 'undefined') {
    function loop(stamp) {
      requestAnimationFrame(loop);
      step(stamp);
    }

    loop(0);
  } else {
    const start = Date.now();
    setInterval(() => {
      loop(Date.now() - start);
    }, 1000 / fps);
  }
};
