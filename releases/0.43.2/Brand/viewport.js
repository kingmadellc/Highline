// CSS owns the dynamic viewport. Unity receives safe control bounds in CSS
// points without shrinking its canvas, so the world can reach every edge.
(() => {
  const game = document.getElementById('game');
  const standaloneIPhone = /iPhone/.test(navigator.userAgent) &&
    (navigator.standalone === true || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches);
  const probe = document.createElement('div');
  probe.id = 'highline-safe-area';
  probe.setAttribute('aria-hidden', 'true');
  game.appendChild(probe);
  const sync = () => {
    // iOS standalone can report a layout/visual viewport shortened by the
    // status-bar inset while still painting from the physical window's top.
    // outerHeight includes that missing strip. Restrict this to iPhone web apps;
    // Safari tabs and resizable desktop/iPad windows keep ordinary fixed bounds.
    game.style.height = standaloneIPhone ? Math.max(innerHeight, outerHeight) + 'px' : '';
    const style = getComputedStyle(probe);
    window.highlineSafeInsets = ['paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom']
      .map(edge => Math.max(0, parseFloat(style[edge]) || 0));
  };
  const observer = new ResizeObserver(sync);
  observer.observe(probe);
  for (const event of ['resize', 'orientationchange', 'pageshow']) window.addEventListener(event, sync);
  window.visualViewport?.addEventListener('resize', sync);
  sync();
})();
