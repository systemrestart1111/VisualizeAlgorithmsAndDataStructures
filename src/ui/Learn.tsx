import React, { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ITEMS, byId } from '../registry';
import { NEXT, REQ, STAGES, STAGE_OF, ancestors, levels, studyOrder } from '../learning';
import { IconArrow, IconCheck, IconChevron, IconSearch, IconStar, IconTree } from './icons';
import { SHAPE_CYCLE, Shape } from './shapes';

// ---------- 已學會的項目（存在瀏覽器裡，讀不到就當作空的） ----------
const KEY = 'learned';
let learned = new Set<string>();
try {
  learned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
} catch {}
const subs = new Set<() => void>();
const subscribe = (f: () => void) => (subs.add(f), () => subs.delete(f));
const snapshot = () => learned;

export function useLearned() {
  const set = useSyncExternalStore(subscribe, snapshot);
  const toggle = (id: string) => {
    learned = new Set(learned);
    if (!learned.delete(id)) learned.add(id);
    try {
      localStorage.setItem(KEY, JSON.stringify([...learned]));
    } catch {}
    subs.forEach((f) => f());
  };
  return { has: (id: string) => set.has(id), toggle };
}

const stagger = (i: number) => ({ '--i': i }) as React.CSSProperties;

// ---------- 學習路徑 ----------
export function LearningPath() {
  const L = useLearned();
  const done = (i: number) => STAGES[i].items.filter(L.has).length;
  const [cur, setCur] = useState(() => Math.max(0, STAGES.findIndex((s, i) => done(i) < s.items.length)));
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rail.current?.children[cur] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [cur]);
  const s = STAGES[cur];
  const n = done(cur);

  return (
    <section className="learn">
      <h2 className="sec-title">
        學習路徑
        <span>{STAGES.length} 個階段，每一階段的先備知識都在前面的階段學過</span>
      </h2>
      <div className="path-rail" ref={rail} role="tablist" aria-label="學習階段">
        {STAGES.map((st, i) => {
          const complete = done(i) === st.items.length;
          return (
            <button
              key={st.id}
              role="tab"
              aria-selected={i === cur}
              className={'path-step tone-' + (i % 3) + (i === cur ? ' cur' : '') + (complete ? ' complete' : '')}
              style={stagger(i)}
              onClick={() => setCur(i)}
            >
              <span className="path-dot">
                <Shape name={SHAPE_CYCLE[i % SHAPE_CYCLE.length]} />
                <b>{complete ? <IconCheck size={18} /> : i + 1}</b>
              </span>
              <span className="path-name">{st.name}</span>
              <span className="path-prog">{done(i)}/{st.items.length}</span>
            </button>
          );
        })}
      </div>
      <div className="card path-detail" key={s.id} role="tabpanel">
        <div className="path-head">
          <div>
            <div className="path-no">階段 {cur + 1}</div>
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
          </div>
          <div className="path-meter" title={`已學會 ${n} / ${s.items.length}`}>
            <div className="meter"><i style={{ width: (n / s.items.length) * 100 + '%' }} /></div>
            <span>已學會 {n} / {s.items.length}</span>
          </div>
        </div>
        <div className="chips">
          {s.items.map((id, i) => {
            const it = byId[id];
            const has = L.has(id);
            return (
              <a key={id} href={'#' + id} className={'chip path-chip' + (has ? ' learned' : '')} style={stagger(i)} title={it.en}>
                {has ? <IconCheck size={14} /> : it.star && <IconStar size={11} />}
                {it.name}
              </a>
            );
          })}
        </div>
        <div className="path-foot">
          <span className="muted">
            <IconStar size={11} /> 標星號的是重點項目；在項目頁按「標記為已學會」即可記錄進度
          </span>
          <div className="path-nav">
            <button className="ghost" disabled={cur === 0} onClick={() => setCur(cur - 1)}>上一階段</button>
            <button className="primary" disabled={cur === STAGES.length - 1} onClick={() => setCur(cur + 1)}>
              下一階段
              <IconArrow size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 先備知識樹 ----------
const NH = 44; // 節點高
const GY = 52; // 層間距
const PAD = 12;
/** 節點寬、同層間距、名稱最多字數；窄螢幕用緊湊尺寸 */
const SIZES = { wide: { NW: 156, GX: 20, max: 11 }, narrow: { NW: 112, GX: 10, max: 7 } };
type Size = (typeof SIZES)['wide'];
const short = (s: string, max: number) => (s.length > max ? s.slice(0, max - 1) + '…' : s);

function useNarrow() {
  const q = '(max-width: 780px)';
  const [n, setN] = useState(() => matchMedia(q).matches);
  useEffect(() => {
    const m = matchMedia(q);
    const on = () => setN(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return n;
}

/** 分層排版：同層內用重心法交替向下、向上掃描數輪以減少交叉 */
function layout(target: string, { NW, GX }: Size) {
  const ids = [...ancestors(target), target];
  const lv = levels(ids);
  const depth = Math.max(...Object.values(lv)) + 1;
  const rows: string[][] = Array.from({ length: depth }, () => []);
  const pos = (x: string) => STAGE_OF[x] * 100 + STAGES[STAGE_OF[x]].items.indexOf(x);
  ids.sort((a, b) => pos(a) - pos(b)).forEach((id) => rows[lv[id]].push(id));
  const inSet = new Set(ids);
  const kids: Record<string, string[]> = Object.fromEntries(ids.map((id) => [id, NEXT[id].filter((k) => inSet.has(k))]));
  const order = () => Object.fromEntries(rows.flatMap((r) => r.map((id, i) => [id, i - (r.length - 1) / 2])));
  const bary = (r: string[], nb: (x: string) => string[]) => {
    const o = order();
    const key = (x: string) => {
      const ns = nb(x);
      return ns.length ? ns.reduce((a, y) => a + o[y], 0) / ns.length : o[x];
    };
    const k = Object.fromEntries(r.map((x) => [x, key(x)]));
    r.sort((a, b) => k[a] - k[b]);
  };
  for (let t = 0; t < 4; t++) {
    for (let d = 1; d < depth; d++) bary(rows[d], (x) => REQ[x]);
    for (let d = depth - 2; d >= 0; d--) bary(rows[d], (x) => kids[x]);
  }
  const widest = Math.max(...rows.map((r) => r.length));
  const W = widest * NW + (widest - 1) * GX + PAD * 2;
  const H = depth * NH + (depth - 1) * GY + PAD * 2;
  const xy: Record<string, { x: number; y: number }> = {};
  rows.forEach((r, d) => {
    const rw = r.length * NW + (r.length - 1) * GX;
    r.forEach((id, i) => (xy[id] = { x: (W - rw) / 2 + i * (NW + GX), y: PAD + d * (NH + GY) }));
  });
  const edges = ids.flatMap((id) => REQ[id].map((p) => ({ from: p, to: id })));
  return { ids, lv, xy, edges, W, H };
}

const edgePath = (a: { x: number; y: number }, b: { x: number; y: number }, NW: number) => {
  const x1 = a.x + NW / 2, y1 = a.y + NH, x2 = b.x + NW / 2, y2 = b.y;
  const dy = (y2 - y1) / 2;
  return `M${x1} ${y1} C${x1} ${y1 + dy} ${x2} ${y2 - dy} ${x2} ${y2}`;
};

export function PrereqTree({ hash }: { hash: string }) {
  const L = useLearned();
  const fromHash = () => {
    const id = hash.startsWith('learn/') ? hash.slice(6) : '';
    return byId[id] ? id : 'dijkstra';
  };
  const [target, setTargetState] = useState(fromHash);
  const [hover, setHover] = useState<string | null>(null);
  const sec = useRef<HTMLElement>(null);

  // 從項目頁的「查看先備知識樹」連結進來時，跳到這一區（等外層捲回頂端之後再捲動）
  useEffect(() => {
    if (!hash.startsWith('learn/')) return;
    setTargetState(fromHash());
    const t = setTimeout(() => {
      // 進場動畫還在位移時算出的捲動位置會偏掉，先讓它直接結束
      sec.current?.getAnimations().forEach((a) => a.finish());
      sec.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  const setTarget = (id: string) => {
    setTargetState(id);
    setHover(null);
    history.replaceState(null, '', '#learn/' + id);
  };

  const size = SIZES[useNarrow() ? 'narrow' : 'wide'];
  const { NW } = size;
  const g = useMemo(() => layout(target, size), [target, size]);
  // 樹比畫面寬時（手機），把捲動位置置中，讓最後的主題落在中間
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ left: (el.scrollWidth - el.clientWidth) / 2, behavior: 'smooth' });
  }, [g]);
  const lit = useMemo(() => (hover ? new Set([hover, ...ancestors(hover)]) : null), [hover]);
  const order = useMemo(() => studyOrder(target), [target]);
  const pre = order.length - 1;
  const known = order.slice(0, -1).filter(L.has).length;
  const it = byId[target];

  return (
    <section className="learn" ref={sec}>
      <h2 className="sec-title">
        先備知識樹
        <span>選一個主題，看看學它之前需要先懂哪些；點樹上的節點可以改看它的先備知識</span>
      </h2>
      <div className="card tree-card">
        <div className="tree-head">
          <ItemPicker value={target} onChange={setTarget} />
          <p className="tree-sum">
            {pre ? (
              <>
                學「<b>{it.name}</b>」之前共有 <b>{pre}</b> 項先備知識，已學會 <b>{known}</b> 項
              </>
            ) : (
              <>「<b>{it.name}</b>」沒有先備知識，可以直接開始</>
            )}
          </p>
          <a className="btn primary" href={'#' + target}>
            開啟視覺化
            <IconArrow size={16} />
          </a>
        </div>
        <div className="tree-scroll" ref={scroller}>
          <svg className={'tree' + (lit ? ' dim' : '')} width={g.W} height={g.H} viewBox={`0 0 ${g.W} ${g.H}`} role="img" aria-label={`${it.name} 的先備知識樹`}>
            {g.edges.map(({ from, to }) => {
              const d = edgePath(g.xy[from], g.xy[to], NW);
              return (
                <path
                  key={from + '>' + to}
                  className={'tree-edge' + (lit?.has(from) && lit.has(to) ? ' lit' : '')}
                  d={d}
                  style={{ d: `path("${d}")`, ...stagger(g.lv[to]) } as React.CSSProperties}
                />
              );
            })}
            {g.ids.map((id) => {
              const { x, y } = g.xy[id];
              const node = byId[id];
              const cls = ['tree-node', node.kind, id === target && 'target', L.has(id) && 'learned', lit?.has(id) && 'lit'].filter(Boolean).join(' ');
              return (
                <g
                  key={id}
                  className={cls}
                  style={{ transform: `translate(${x}px, ${y}px)`, ...stagger(g.lv[id]) } as React.CSSProperties}
                  tabIndex={0}
                  role="button"
                  aria-label={node.name + (id === target ? '（目前主題）' : '：改看它的先備知識')}
                  onClick={() => id !== target && setTarget(id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), id !== target && setTarget(id))}
                  onPointerEnter={() => setHover(id)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(id)}
                  onBlur={() => setHover(null)}
                >
                  <title>{node.name + ' · ' + node.en}</title>
                  <g className="tree-node-in">
                    <rect width={NW} height={NH} rx={NH / 2} />
                    <text x={NW / 2} y={NH / 2 + 1}>{short(node.name, size.max)}</text>
                    {L.has(id) && (
                      <g className="tree-check" transform={`translate(${NW - 10} -4)`}>
                        <circle r="9" />
                        <path d="M-4 0.5 -1.3 3.2 4 -2.6" />
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="tree-legend">
          <span><i className="lg ds" />資料結構</span>
          <span><i className="lg algo" />演算法</span>
          <span><i className="lg target" />目前主題</span>
          <span><i className="lg learned" />已學會</span>
        </div>
        {pre > 0 && (
          <div className="tree-order">
            <div className="card-title">建議學習順序</div>
            <ol key={target}>
              {order.map((id, i) => (
                <li key={id} style={stagger(i)}>
                  <a href={'#' + id} className={'chip' + (L.has(id) ? ' learned' : '') + (id === target ? ' target' : '')}>
                    <span className="order-no">{L.has(id) ? <IconCheck size={13} /> : i + 1}</span>
                    {byId[id].name}
                  </a>
                  {i < order.length - 1 && <IconChevron size={14} />}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

/** 可輸入搜尋的項目選擇器，選單外觀與 Select 相同 */
function ItemPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const id = useId();
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? ITEMS.filter((it) => (it.name + ' ' + it.en + ' ' + it.id).toLowerCase().includes(s)) : ITEMS).slice(0, 8);
  }, [q]);

  const show = () => {
    setClosing(false);
    setOpen(true);
    setActive(0);
  };
  const hide = () => open && !closing && setClosing(true);
  const pick = (v: string) => {
    onChange(v);
    setQ('');
    hide();
    (document.activeElement as HTMLElement | null)?.blur();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && hide();
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  });

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return hide();
    if (!open) return e.key === 'ArrowDown' && show();
    if (e.key === 'ArrowDown') setActive((a) => Math.min(list.length - 1, a + 1));
    else if (e.key === 'ArrowUp') setActive((a) => Math.max(0, a - 1));
    else if (e.key === 'Enter' && list[active]) pick(list[active].id);
    else return;
    e.preventDefault();
  };

  return (
    <div className={'sel picker' + (open && !closing ? ' open' : '')} ref={wrap}>
      <label className="picker-field">
        <IconSearch size={18} />
        <input
          role="combobox"
          aria-expanded={open && !closing}
          aria-controls={id}
          aria-activedescendant={open && list[active] ? `${id}-${active}` : undefined}
          placeholder={byId[value].name}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            if (!open || closing) show();
          }}
          onFocus={show}
          onKeyDown={onKey}
        />
      </label>
      {open && (
        <ul
          id={id}
          role="listbox"
          className={'sel-menu' + (closing ? ' closing' : '')}
          onAnimationEnd={(e) => {
            if (closing && e.target === e.currentTarget) {
              setOpen(false);
              setClosing(false);
            }
          }}
        >
          {list.map((it, i) => (
            <li
              key={it.id}
              id={`${id}-${i}`}
              role="option"
              aria-selected={it.id === value}
              className={'sel-item' + (it.id === value ? ' selected' : '') + (i === active ? ' active' : '')}
              style={stagger(i)}
              onPointerEnter={() => setActive(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => pick(it.id)}
            >
              <span className="sel-check">{it.id === value && <IconCheck size={18} />}</span>
              <span className="picker-name">{it.name}</span>
              <span className="picker-en">{it.en}</span>
            </li>
          ))}
          {!list.length && <li className="sel-item picker-empty">找不到「{q}」</li>}
        </ul>
      )}
    </div>
  );
}

// ---------- 項目頁的學習脈絡 ----------
export function ItemContext({ id }: { id: string }) {
  const L = useLearned();
  const has = L.has(id);
  const row = (label: string, ids: string[], empty: string) => (
    <div className="ctx-row">
      <span className="ctx-label">{label}</span>
      <div className="chips">
        {ids.length ? (
          ids.map((x) => (
            <a key={x} href={'#' + x} className={'chip' + (L.has(x) ? ' learned' : '')} title={byId[x].en}>
              {L.has(x) && <IconCheck size={14} />}
              {byId[x].name}
            </a>
          ))
        ) : (
          <span className="muted">{empty}</span>
        )}
      </div>
    </div>
  );
  return (
    <div className="card ctx">
      <div className="ctx-rows">
        {row('先備知識', REQ[id], '沒有，可以直接開始')}
        {row('接著可以學', NEXT[id], '這是路線的終點之一')}
      </div>
      <div className="ctx-actions">
        <button className={'learn-toggle' + (has ? ' on' : '')} aria-pressed={has} onClick={() => L.toggle(id)}>
          <IconCheck size={16} />
          {has ? '已學會' : '標記為已學會'}
        </button>
        <a className="btn ghost" href={'#learn/' + id}>
          <IconTree size={16} />
          先備知識樹
        </a>
      </div>
    </div>
  );
}
