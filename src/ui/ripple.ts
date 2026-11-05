// Material 漣漪：在可點擊元素上，從按下的位置擴散一圈半透明波紋

const HOSTS = 'button, .nav-item, .chip, .acc-head, .swatch';

export function installRipple() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const host = (e.target as Element | null)?.closest?.(HOSTS) as HTMLElement | null;
    if (!host || (host as HTMLButtonElement).disabled) return;
    const r = host.getBoundingClientRect();
    const size = Math.hypot(r.width, r.height) * 2;
    const wave = document.createElement('span');
    wave.className = 'ripple-wave';
    wave.style.width = wave.style.height = size + 'px';
    wave.style.left = e.clientX - r.left - size / 2 + 'px';
    wave.style.top = e.clientY - r.top - size / 2 + 'px';
    host.appendChild(wave);
    const born = performance.now();
    const release = () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      // 至少讓擴散動畫跑一段時間再淡出
      const wait = Math.max(0, 220 - (performance.now() - born));
      window.setTimeout(() => {
        wave.classList.add('out');
        window.setTimeout(() => wave.remove(), 450);
      }, wait);
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
  });
}
