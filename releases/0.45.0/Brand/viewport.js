// CSS owns the dynamic viewport. Unity receives safe control bounds in CSS
// points without shrinking its canvas, so the world can reach every edge.
(() => {
  const game = document.getElementById('game');
  const probe = document.createElement('div');
  probe.id = 'highline-safe-area';
  probe.setAttribute('aria-hidden', 'true');
  game.appendChild(probe);
  const sync = () => {
    // Dynamic CSS viewport units follow browser chrome, rotation and fullscreen.
    // outerHeight can retain the previous orientation and must not size the game.
    const style = getComputedStyle(probe);
    window.highlineSafeInsets = ['paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom']
      .map(edge => Math.max(0, parseFloat(style[edge]) || 0));
  };
  const observer = new ResizeObserver(sync);
  observer.observe(probe);
  for (const event of ['resize', 'orientationchange', 'pageshow']) window.addEventListener(event, sync);
  window.visualViewport?.addEventListener('resize', sync);
  document.addEventListener('fullscreenchange', sync);
  sync();
})();
