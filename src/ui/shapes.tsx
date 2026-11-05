import React from 'react';

// Material 3 Expressive 造型：以極座標函數取樣成相同點數的路徑（0..100 方框），因此可互相變形

const N = 96;
type ShapeName = 'circle' | 'cookie9' | 'cookie12' | 'clover4' | 'flower' | 'sunny' | 'burst' | 'squircle' | 'gem' | 'puffy';

const scallop = (n: number, d: number) => (t: number) => 1 + d * Math.cos(n * t);
const RADIUS: Record<ShapeName, (t: number) => number> = {
  circle: () => 1,
  cookie9: scallop(9, 0.075),
  cookie12: scallop(12, 0.06),
  clover4: (t) => 0.78 + 0.22 * Math.pow(Math.abs(Math.cos(2 * t)), 0.6),
  flower: scallop(8, 0.14),
  sunny: (t) => 1 + 0.09 * (2 * Math.abs(((4 * t) / Math.PI) % 1 - 0.5) * 2 - 1),
  burst: scallop(10, 0.12),
  squircle: (t) => Math.pow(Math.pow(Math.abs(Math.cos(t)), 4) + Math.pow(Math.abs(Math.sin(t)), 4), -0.25),
  gem: (t) => Math.pow(Math.pow(Math.abs(Math.cos(t + Math.PI / 4)), 2.6) + Math.pow(Math.abs(Math.sin(t + Math.PI / 4)), 2.6), -1 / 2.6),
  puffy: scallop(6, 0.1),
};

const cache = new Map<ShapeName, string>();
export function shapePath(name: ShapeName): string {
  const hit = cache.get(name);
  if (hit) return hit;
  const f = RADIUS[name];
  const rs = Array.from({ length: N }, (_, i) => f((i / N) * Math.PI * 2 - Math.PI / 2));
  const k = 50 / Math.max(...rs);
  const pts = rs.map((r, i) => {
    const t = (i / N) * Math.PI * 2 - Math.PI / 2;
    return `${(50 + Math.cos(t) * r * k).toFixed(2)},${(50 + Math.sin(t) * r * k).toFixed(2)}`;
  });
  const d = 'M' + pts.join('L') + 'Z';
  cache.set(name, d);
  return d;
}

/** 分類編號等處依序輪替的造型 */
export const SHAPE_CYCLE: ShapeName[] = ['cookie9', 'clover4', 'sunny', 'squircle', 'flower', 'gem', 'burst', 'puffy', 'cookie12'];

export function Shape({ name, className, style }: { name: ShapeName; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={'shape ' + (className ?? '')} viewBox="0 0 100 100" style={style} aria-hidden="true">
      <path d={shapePath(name)} />
    </svg>
  );
}

/** 載入指示器：在數種造型間變形並旋轉（Material 3 Expressive loading indicator） */
export function LoadingIndicator({ size = 28 }: { size?: number }) {
  const seq: ShapeName[] = ['cookie9', 'sunny', 'clover4', 'burst', 'puffy', 'cookie9'];
  return (
    <svg className="loading-ind" width={size} height={size} viewBox="0 0 100 100" aria-label="播放中">
      <path d={shapePath(seq[0])}>
        <animate
          attributeName="d"
          dur="3s"
          repeatCount="indefinite"
          values={seq.map(shapePath).join(';')}
          calcMode="spline"
          keySplines={Array(seq.length - 1).fill('0.4 0 0.2 1').join(';')}
        />
      </path>
    </svg>
  );
}
