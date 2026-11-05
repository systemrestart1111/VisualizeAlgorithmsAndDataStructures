import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AlgoDef, DSDef, DSInstance, Frame, InputSpec, Item } from '../core/types';
import { CATEGORIES, ITEMS, SECTIONS, byId } from '../registry';
import { Controls, Stage, usePlayer } from './Player';
import { LEGEND } from './Panels';
import { IconAuto, IconCheck, IconChevron, IconDice, IconMenu, IconMoon, IconPalette, IconReset, IconRun, IconSearch, IconStar, IconSun } from './icons';
import { SHAPE_CYCLE, Shape } from './shapes';
import { CodeImpl } from './CodeImpl';
import { Select } from './Select';
import { SEEDS, revealFrom, useTheme, type Mode } from './theme';

function useHash() {
  const [h, setH] = useState(() => decodeURIComponent(location.hash.slice(1)));
  useEffect(() => {
    const on = () => setH(decodeURIComponent(location.hash.slice(1)));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return h;
}

const CAT_INDEX: Record<string, number> = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i]));
const CAT_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const stagger = (i: number) => ({ '--i': i }) as React.CSSProperties;

/** 分類編號：每個分類一種造型，容器色在 primary / secondary / tertiary 間輪替 */
function CatNo({ id, no, big }: { id: string; no: string; big?: boolean }) {
  const i = CAT_INDEX[id] ?? 0;
  return (
    <span className={'cat-no tone-' + (i % 3) + (big ? ' big' : '')}>
      <Shape name={SHAPE_CYCLE[i % SHAPE_CYCLE.length]} />
      <b>{no}</b>
    </span>
  );
}

/** 從按鈕中心做主題切換的圓形揭露 */
const revealAt = (e: React.MouseEvent<HTMLElement>, update: () => void) => {
  const r = e.currentTarget.getBoundingClientRect();
  revealFrom(r.left + r.width / 2, r.top + r.height / 2, update);
};

function ThemeMenu({ theme }: { theme: ReturnType<typeof useTheme> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const modes: [Mode, string, React.FC<{ size?: number }>][] = [
    ['light', '淺色', IconSun],
    ['', '系統', IconAuto],
    ['dark', '深色', IconMoon],
  ];
  return (
    <div className="menu-wrap" ref={ref}>
      <button className={'icon-btn' + (open ? ' on' : '')} aria-label="主題設定" aria-expanded={open} title="主題設定" onClick={() => setOpen(!open)}>
        <IconPalette size={20} />
      </button>
      <div className={'menu' + (open ? ' open' : '')} role="dialog" aria-label="主題設定" {...(!open && { inert: '' })}>
        <div className="menu-title">主題色</div>
        <div className="swatches">
          {SEEDS.map((s) => {
            const sel = s.hex.toLowerCase() === theme.seed.toLowerCase();
            return (
              <button
                key={s.hex}
                className={'swatch' + (sel ? ' sel' : '')}
                style={{ '--sw': s.hex } as React.CSSProperties}
                title={s.name}
                aria-label={s.name}
                aria-pressed={sel}
                onClick={(e) => !sel && revealAt(e, () => theme.setSeed(s.hex))}
              >
                {sel && <IconCheck size={18} />}
              </button>
            );
          })}
        </div>
        <div className="menu-title">外觀</div>
        <div className="segmented" role="group" aria-label="外觀">
          {modes.map(([v, label, Icon]) => {
            const sel = theme.mode === v;
            return (
              <button key={v || 'auto'} className={sel ? 'sel' : ''} aria-pressed={sel} onClick={(e) => !sel && revealAt(e, () => theme.setMode(v))}>
                {sel ? <IconCheck size={16} /> : <Icon size={16} />}
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const hash = useHash();
  const theme = useTheme();
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);
  const [opened, setOpened] = useState<Record<string, boolean>>({});

  const item = byId[hash];
  useEffect(() => {
    setMenu(false);
    document.querySelector('.main')?.scrollTo({ top: 0 });
    if (item) setOpened((o) => ({ ...o, [item.cat]: true }));
  }, [hash, item]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ITEMS;
    return ITEMS.filter((it) => (it.name + ' ' + it.en + ' ' + it.id).toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="app">
      <header className="top">
        <button className="icon-btn menu-btn" aria-label="選單" onClick={() => setMenu(!menu)}>
          <IconMenu size={20} />
        </button>
        <a href="#" className="brand">
          <span className="logo">
            <Shape name="cookie9" />
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="12" width="3.2" height="6" rx="1.6" />
              <rect x="10.4" y="8" width="3.2" height="10" rx="1.6" />
              <rect x="15.8" y="5" width="3.2" height="13" rx="1.6" />
            </svg>
          </span>
          <span className="brand-text">
            <b>演算法視覺化</b>
            <small>Algorithms &amp; Data Structures</small>
          </span>
        </a>
        <div className="spacer" />
        <span className="count-pill">{ITEMS.length} 項</span>
        <ThemeMenu theme={theme} />
      </header>
      <div className="body">
        <div className={'scrim' + (menu ? ' open' : '')} onClick={() => setMenu(false)} />
        <nav className={'side' + (menu ? ' open' : '')}>
          <label className="search">
            <IconSearch size={18} />
            <input placeholder="搜尋（中文／英文）" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          {SECTIONS.map((sec) => {
            const cats = sec.cats.map((id) => CAT_BY_ID[id]).filter((c) => filtered.some((it) => it.cat === c.id));
            if (!cats.length) return null;
            return (
              <div key={sec.id} className="side-sec">
                <div className="side-group">
                  <span>{sec.name}</span>
                  <span className="cat-count">{filtered.filter((it) => sec.cats.includes(it.cat)).length}</span>
                </div>
                {cats.map((c) => {
                  const list = filtered.filter((it) => it.cat === c.id);
                  const open = !!q || !!opened[c.id];
                  return (
                    <div key={c.id} className={'acc' + (open ? ' open' : '')}>
                      <button className="acc-head" aria-expanded={open} onClick={() => setOpened((o) => ({ ...o, [c.id]: !open }))}>
                        <IconChevron size={16} />
                        <CatNo id={c.id} no={c.no} />
                        <span className="cat-name">{c.name}</span>
                        <span className="cat-count">{list.length}</span>
                      </button>
                      <div className="acc-body">
                        <div className="acc-inner" {...(!open && { inert: '' })}>
                          {list.map((it) => (
                            <a key={it.id} href={'#' + it.id} className={'nav-item' + (it.id === hash ? ' cur' : '')}>
                              <span>{it.name}</span>
                              {it.star && (
                                <span className="star" title="重點">
                                  <IconStar size={11} />
                                </span>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {!filtered.length && <div className="side-empty">找不到「{q}」</div>}
        </nav>
        <main className="main">
          {item ? item.kind === 'ds' ? <DSView key={item.id} d={item} /> : <AlgoView key={item.id} a={item} /> : <Home q={q} setQ={setQ} list={filtered} />}
        </main>
      </div>
    </div>
  );
}

function Home({ q, setQ, list }: { q: string; setQ: (s: string) => void; list: Item[] }) {
  const nDS = ITEMS.filter((i) => i.kind === 'ds').length;
  const stats: [Parameters<typeof Shape>[0]['name'], number, string][] = [
    ['cookie12', nDS, '資料結構'],
    ['sunny', ITEMS.length - nDS, '演算法'],
    ['clover4', CATEGORIES.length, '分類'],
  ];
  let k = 0;
  const section = (sec: (typeof SECTIONS)[number]) => {
    const cats = sec.cats.map((id) => CAT_BY_ID[id]).filter((c) => list.some((it) => it.cat === c.id));
    if (!cats.length) return null;
    return (
      <section key={sec.id}>
        <h2 className="sec-title">
          {sec.name}
          <span>{sec.desc}</span>
        </h2>
        <div className="cat-grid">
          {cats.map((c) => {
            const items = list.filter((it) => it.cat === c.id);
            return (
              <div key={c.id} className="cat-card" style={stagger(Math.min(k++, 12))}>
                <h3>
                  <CatNo id={c.id} no={c.no} big />
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-count">{items.length}</span>
                </h3>
                <div className="chips">
                  {items.map((it) => (
                    <a key={it.id} href={'#' + it.id} className="chip" title={it.en}>
                      {it.star && <IconStar size={11} />}
                      {it.name}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };
  return (
    <div className="home">
      <div className="hero">
        <Shape name="cookie12" className="deco deco-1" />
        <Shape name="flower" className="deco deco-2" />
        <Shape name="gem" className="deco deco-3" />
        <div className="hero-text">
          <h1>
            一步一步看懂
            <br />
            <em>演算法與資料結構</em>
          </h1>
          <p>選擇一項、輸入資料（或按骰子隨機產生），就能逐步播放執行過程，並同步對照虛擬碼。</p>
          <label className="hero-search">
            <IconSearch size={20} />
            <input placeholder="搜尋，例如：Dijkstra、紅黑樹、KMP" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="kbd-hint">
            <span><kbd>空白鍵</kbd> 播放／暫停</span>
            <span><kbd>←</kbd><kbd>→</kbd> 單步</span>
            <span><kbd>Home</kbd><kbd>End</kbd> 跳到頭尾</span>
          </div>
        </div>
        <div className="stats">
          {stats.map(([shape, n, label], i) => (
            <div key={label} className={'stat tone-' + i} style={stagger(i + 2)}>
              <div className="stat-shape">
                <Shape name={shape} />
                <b>{n}</b>
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
      {SECTIONS.map(section)}
      {!list.length && <div className="side-empty">找不到「{q}」</div>}
    </div>
  );
}

function Header({ it, extra }: { it: Item; extra?: React.ReactNode }) {
  const cat = CATEGORIES.find((c) => c.id === it.cat);
  return (
    <div className="head">
      <div className="crumb">
        {cat && <CatNo id={cat.id} no={cat.no} />}
        <span>{cat?.name}</span>
        <span className="kind-tag">{it.kind === 'ds' ? '資料結構' : '演算法'}</span>
      </div>
      <h2>
        {it.name}
        {it.star && (
          <span className="star" title="重點">
            <IconStar size={20} />
          </span>
        )}
        <span className="en">{it.en}</span>
      </h2>
      <p className="desc">{it.desc}</p>
      {extra}
    </div>
  );
}

function Legend() {
  return (
    <div className="legend">
      <span className="legend-title">顏色說明</span>
      {LEGEND.map(([c, t]) => (
        <span key={c} className="legend-item">
          <i style={{ background: `var(--c-${c})` }} />
          {t}
        </span>
      ))}
    </div>
  );
}

const showVal = (spec: InputSpec, v: any) => (spec.type === 'array' ? (v as number[]).join(', ') : String(v));
const parseVal = (spec: InputSpec, s: string) => {
  if (spec.type === 'array')
    return s
      .split(/[\s,，]+/)
      .filter(Boolean)
      .map(Number)
      .filter((x) => !Number.isNaN(x));
  if (spec.type === 'number') {
    let n = Number(s);
    if (Number.isNaN(n)) n = spec.default;
    if (spec.min !== undefined) n = Math.max(spec.min, n);
    if (spec.max !== undefined) n = Math.min(spec.max, n);
    return n;
  }
  return s;
};

function AlgoView({ a }: { a: AlgoDef & { kind: 'algo' } }) {
  const initial = () => Object.fromEntries(a.inputs.map((s) => [s.key, showVal(s, s.default)]));
  const [raw, setRaw] = useState<Record<string, string>>(initial);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [err, setErr] = useState('');
  const [auto, setAuto] = useState(false);
  const player = usePlayer(frames, auto);

  const run = (r = raw, autoplay = true) => {
    try {
      const input = Object.fromEntries(a.inputs.map((s) => [s.key, parseVal(s, r[s.key] ?? '')]));
      const f = a.run(input);
      setErr('');
      setAuto(autoplay);
      setFrames(f.length ? f : [{ msg: '（沒有步驟）', panels: [] }]);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
      console.error(e);
    }
  };
  useEffect(() => {
    run(raw, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 依欄位順序產生隨機值；後面的欄位（如搜尋目標）可參考前面欄位目前的值
  const randomize = (key?: string) => {
    const r = { ...raw };
    const cur = Object.fromEntries(a.inputs.map((s) => [s.key, parseVal(s, r[s.key] ?? '')]));
    for (const s of a.inputs)
      if ((!key || s.key === key) && 'random' in s && s.random) {
        cur[s.key] = s.random(cur);
        r[s.key] = showVal(s, cur[s.key]);
      }
    setRaw(r);
    run(r);
  };
  const hasRandom = a.inputs.some((s) => 'random' in s && s.random);
  const frame = frames[player.idx];

  return (
    <div className="view">
      <Header
        it={a}
        extra={
          (a.time || a.space) && (
            <div className="badges">
              {a.time && <span className="badge"><i>時間</i>{a.time}</span>}
              {a.space && <span className="badge"><i>空間</i>{a.space}</span>}
            </div>
          )
        }
      />
      <div className="card inputs">
        <div className="card-title">輸入</div>
        <div className="inputs-body">
          {a.inputs.map((s) => (
            <label key={s.key} className={'inp' + (s.type === 'text' && s.multiline ? ' inp-multi' : '') + (s.type === 'array' ? ' inp-wide' : '')}>
              <span>{s.label}</span>
              <div className="inp-row">
                {s.type === 'select' ? (
                  <Select value={raw[s.key]} options={s.options} onChange={(v) => { const r = { ...raw, [s.key]: v }; setRaw(r); run(r); }} />
                ) : s.type === 'text' && s.multiline ? (
                  <textarea rows={Math.min(10, Math.max(3, raw[s.key].split('\n').length))} value={raw[s.key]} onChange={(e) => setRaw({ ...raw, [s.key]: e.target.value })} />
                ) : (
                  <input value={raw[s.key]} onChange={(e) => setRaw({ ...raw, [s.key]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && run()} />
                )}
                {'random' in s && s.random && (
                  <button className="icon-btn dice" title="隨機產生" aria-label={'隨機產生' + s.label} onClick={() => randomize(s.key)}>
                    <IconDice size={18} />
                  </button>
                )}
              </div>
            </label>
          ))}
          <div className="inp-actions">
            <button className="primary" onClick={() => run()}><IconRun size={16} />執行</button>
            {hasRandom && <button onClick={() => randomize()}><IconDice size={16} />全部隨機</button>}
            <button className="ghost" onClick={() => { const r = initial(); setRaw(r); run(r); }}><IconReset size={16} />預設值</button>
          </div>
        </div>
      </div>
      {err && <div className="err">輸入錯誤：{err}</div>}
      <Controls p={player} n={frames.length} />
      <Stage frame={frame} code={a.code} line={frame?.line} />
      <Legend />
      <CodeImpl id={a.id} />
    </div>
  );
}

function DSView({ d }: { d: DSDef & { kind: 'ds' } }) {
  const [inst, setInst] = useState<DSInstance>(() => build(d));
  const [frames, setFrames] = useState<Frame[]>(() => [inst.view()]);
  const [args, setArgs] = useState<Record<string, string>>({});
  const [log, setLog] = useState<string[]>([]);
  const [code, setCode] = useState<string[] | undefined>(undefined);
  const [auto, setAuto] = useState(false);
  const player = usePlayer(frames, auto);

  const exec = (op: string, label: string, kind: string) => {
    const opDef = d.ops.find((o) => o.key === op)!;
    let s = args[op] ?? '';
    if (!s.trim() && opDef.rand && kind !== 'none') {
      const v = opDef.rand();
      s = Array.isArray(v) ? v.join(' ') : String(v);
      setArgs({ ...args, [op]: s });
    }
    const parts = s.split(/[\s,，]+/).filter(Boolean);
    const num = (x: string | undefined) => (x === undefined || Number.isNaN(Number(x)) ? x : Number(x));
    const a = kind === 'text' ? s.trim() : num(parts[0]);
    const b = kind === 'two' ? num(parts[1]) : undefined;
    if (kind !== 'none' && (a === undefined || a === '')) return;
    try {
      const f = inst.apply(op, a, b);
      setCode(d.codes?.[op]);
      setAuto(true);
      setFrames(f.length ? f : [inst.view()]);
      setLog((l) => [`${label}${kind === 'none' ? '' : ' ' + [a, b].filter((x) => x !== undefined).join(', ')}`, ...l].slice(0, 30));
    } catch (e: any) {
      setLog((l) => ['錯誤：' + (e?.message ?? e), ...l]);
    }
  };
  const reset = () => {
    const i = build(d);
    setInst(i);
    setAuto(false);
    setFrames([i.view()]);
    setLog([]);
    setCode(undefined);
  };
  const frame = frames[player.idx];

  return (
    <div className="view">
      <Header
        it={d}
        extra={
          <div className="badges">
            {d.complexity.map(([k, v]) => (
              <span key={k} className="badge"><i>{k}</i>{v}</span>
            ))}
          </div>
        }
      />
      <div className="card ops">
        <div className="card-title">操作</div>
        <div className="ops-body">
          {d.ops.map((o) => (
            <div key={o.key} className={'op' + (o.arg === 'none' ? ' op-solo' : '')}>
              {o.arg !== 'none' && (
                <input
                  placeholder={o.argLabel ?? (o.arg === 'two' ? 'a b' : '值')}
                  value={args[o.key] ?? ''}
                  onChange={(e) => setArgs({ ...args, [o.key]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && exec(o.key, o.label, o.arg)}
                />
              )}
              {o.rand && o.arg !== 'none' && (
                <button
                  className="icon-btn dice"
                  title="隨機值"
                  aria-label={o.label + '：隨機值'}
                  onClick={() => {
                    const v = o.rand!();
                    setArgs({ ...args, [o.key]: Array.isArray(v) ? v.join(' ') : String(v) });
                  }}
                >
                  <IconDice size={16} />
                </button>
              )}
              <button className="op-go" onClick={() => exec(o.key, o.label, o.arg)}>{o.label}</button>
            </div>
          ))}
          <button className="ghost op-reset" onClick={reset}><IconReset size={16} />重置</button>
        </div>
      </div>
      <Controls p={player} n={frames.length} />
      <Stage frame={frame} code={code} line={frame?.line} />
      {log.length > 0 && (
        <div className="card oplog">
          <div className="card-title">操作紀錄</div>
          <ol>
            {log.map((l, i) => (
              <li key={log.length - i}>{l}</li>
            ))}
          </ol>
        </div>
      )}
      <Legend />
      <CodeImpl id={d.id} />
    </div>
  );
}

function build(d: DSDef) {
  const i = d.create();
  for (const [op, a, b] of d.init ?? []) i.apply(op, a, b);
  return i;
}
