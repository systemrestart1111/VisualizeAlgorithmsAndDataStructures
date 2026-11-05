import { useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Blend, DynamicScheme, Hct, MaterialDynamicColors as MDC, SchemeVibrant, argbFromHex, hexFromArgb } from '@material/material-color-utilities';

// Material 3 動態配色：由種子色產生淺色與深色兩組色彩角色，寫成 CSS 變數 --md-*

export const SEEDS: { hex: string; name: string }[] = [
  { hex: '#6750A4', name: '紫羅蘭' },
  { hex: '#0B57D0', name: '海洋藍' },
  { hex: '#00696B', name: '青碧' },
  { hex: '#146C2E', name: '森林綠' },
  { hex: '#C25100', name: '琥珀橘' },
  { hex: '#B4387A', name: '玫瑰粉' },
];

const ROLES = [
  'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
  'surface', 'onSurface', 'onSurfaceVariant', 'surfaceDim', 'surfaceBright',
  'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh', 'surfaceContainerHighest',
  'outline', 'outlineVariant', 'inverseSurface', 'inverseOnSurface', 'inversePrimary',
] as const;

// 視覺化用的語意色：先與種子色調和，維持彼此可分辨
const DATA_COLORS: Record<string, string> = {
  compare: '#f0a400', swap: '#e5484d', active: '#4f5bd5', done: '#12a26a', visited: '#8b5cf6',
  path: '#f97316', special: '#e0478f', bad: '#dc3545', good: '#16a34a', frontier: '#0ea5c4',
};

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

function vars(scheme: DynamicScheme, seed: number, dark: boolean) {
  const out: string[] = [];
  for (const r of ROLES) out.push(`--md-${kebab(r)}: ${hexFromArgb((MDC as any)[r].getArgb(scheme))};`);
  for (const [k, hex] of Object.entries(DATA_COLORS)) out.push(`--c-${k}: ${hexFromArgb(Blend.harmonize(argbFromHex(hex), seed))};`);
  out.push(`--c-muted: ${hexFromArgb(scheme.neutralVariantPalette.tone(dark ? 30 : 85))};`);
  // 預設長條用彩度較低的 secondary 色調，讓比較／交換等語意色更突出
  out.push(`--bar: ${hexFromArgb((dark ? scheme.secondaryPalette : scheme.primaryPalette).tone(dark ? 45 : 80))};`);
  return out.join('');
}

export function applySeed(hex: string) {
  const seed = argbFromHex(hex);
  const hct = Hct.fromInt(seed);
  const light = vars(new SchemeVibrant(hct, false, 0), seed, false);
  const dark = vars(new SchemeVibrant(hct, true, 0), seed, true);
  let el = document.getElementById('m3-tokens') as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = 'm3-tokens';
    document.head.appendChild(el);
  }
  el.textContent =
    `:root{${light}color-scheme:light}` +
    `@media (prefers-color-scheme: dark){:root:not([data-theme='light']){${dark}color-scheme:dark}}` +
    `:root[data-theme='dark']{${dark}color-scheme:dark}`;
}

export type Mode = '' | 'light' | 'dark';

const load = (k: string, def: string) => {
  try {
    return localStorage.getItem('viz-' + k) ?? def;
  } catch {
    return def;
  }
};
const save = (k: string, v: string) => {
  try {
    localStorage.setItem('viz-' + k, v);
  } catch {
    /* 無法使用 localStorage 時忽略 */
  }
};

export const initialSeed = () => load('seed', SEEDS[0].hex);

/** 以 View Transition 從 (x, y) 擴散的圓形揭露切換主題；不支援時直接切換 */
export function revealFrom(x: number, y: number, update: () => void) {
  const d = document as any;
  if (!d.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }
  const t = d.startViewTransition(() => flushSync(update));
  t.ready.then(() => {
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.2, 0, 0, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}

export function useTheme() {
  const [mode, setMode] = useState<Mode>(() => load('theme', '') as Mode);
  const [seed, setSeed] = useState(initialSeed);
  useLayoutEffect(() => {
    if (mode) document.documentElement.dataset.theme = mode;
    else delete document.documentElement.dataset.theme;
    save('theme', mode);
  }, [mode]);
  useLayoutEffect(() => {
    applySeed(seed);
    save('seed', seed);
  }, [seed]);
  return { mode, setMode, seed, setSeed };
}
