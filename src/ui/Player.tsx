import React, { useEffect, useRef, useState } from 'react';
import type { Frame } from '../core/types';
import { Panels } from './Panels';
import { IconCode, IconFirst, IconGauge, IconLast, IconNext, IconPause, IconPlay, IconPrev } from './icons';
import { LoadingIndicator, Shape } from './shapes';

export function usePlayer(frames: Frame[], autoplay = false) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState(() => Number(localStorageGet('speed') ?? 5));
  const timer = useRef<number>();

  useEffect(() => {
    setIdx(0);
    setPlaying(autoplay && frames.length > 1);
  }, [frames, autoplay]);

  useEffect(() => {
    localStorageSet('speed', String(speed));
  }, [speed]);

  useEffect(() => {
    if (!playing) return;
    const delay = Math.round(1400 / Math.pow(1.7, speed - 1));
    timer.current = window.setTimeout(() => {
      setIdx((i) => {
        if (i >= frames.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, delay);
    return () => window.clearTimeout(timer.current);
  }, [playing, idx, speed, frames.length]);

  useEffect(() => {
    if (playing && idx >= frames.length - 1) setPlaying(false);
  }, [idx, playing, frames.length]);

  return { idx: Math.min(idx, Math.max(0, frames.length - 1)), setIdx, playing, setPlaying, speed, setSpeed };
}

function localStorageGet(k: string) {
  try {
    return localStorage.getItem('viz-' + k);
  } catch {
    return null;
  }
}
function localStorageSet(k: string, v: string) {
  try {
    localStorage.setItem('viz-' + k, v);
  } catch {
    /* 無法使用 localStorage 時忽略 */
  }
}

export function Controls({ p, n }: { p: ReturnType<typeof usePlayer>; n: number }) {
  const { idx, setIdx, playing, setPlaying, speed, setSpeed } = p;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      if (e.key === ' ') {
        e.preventDefault();
        if (idx >= n - 1) setIdx(0);
        setPlaying(!playing);
      } else if (e.key === 'ArrowRight') {
        setPlaying(false);
        setIdx(Math.min(n - 1, idx + 1));
      } else if (e.key === 'ArrowLeft') {
        setPlaying(false);
        setIdx(Math.max(0, idx - 1));
      } else if (e.key === 'Home') setIdx(0);
      else if (e.key === 'End') setIdx(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, n, playing, setIdx, setPlaying]);

  const pct = (v: number, max: number) => ({ '--pct': max > 0 ? `${(v / max) * 100}%` : '0%' }) as React.CSSProperties;
  return (
    <div className="controls">
      <div className="btn-group" role="group" aria-label="播放控制">
        <button className="icon-btn" title="第一步 (Home)" aria-label="第一步" onClick={() => { setPlaying(false); setIdx(0); }}><IconFirst size={18} /></button>
        <button className="icon-btn" title="上一步 (←)" aria-label="上一步" onClick={() => { setPlaying(false); setIdx(Math.max(0, idx - 1)); }}><IconPrev size={18} /></button>
        <button
          className={'play' + (playing ? ' on' : '')}
          title="播放／暫停 (空白鍵)"
          aria-label={playing ? '暫停' : '播放'}
          aria-pressed={playing}
          onClick={() => {
            if (idx >= n - 1) setIdx(0);
            setPlaying(!playing);
          }}
        >
          <span className="play-icon" key={playing ? 'pause' : 'play'}>{playing ? <IconPause size={22} /> : <IconPlay size={22} />}</span>
        </button>
        <button className="icon-btn" title="下一步 (→)" aria-label="下一步" onClick={() => { setPlaying(false); setIdx(Math.min(n - 1, idx + 1)); }}><IconNext size={18} /></button>
        <button className="icon-btn" title="最後一步 (End)" aria-label="最後一步" onClick={() => { setPlaying(false); setIdx(n - 1); }}><IconLast size={18} /></button>
      </div>
      <input className="scrub range" type="range" aria-label="步驟" min={0} max={Math.max(0, n - 1)} value={idx} style={pct(idx, n - 1)} onChange={(e) => { setPlaying(false); setIdx(+e.target.value); }} />
      <span className="step">
        <span className={'ind-slot' + (playing ? ' on' : '')}>{playing && <LoadingIndicator size={22} />}</span>
        <b>{n ? idx + 1 : 0}</b>
        <span>/ {n}</span>
      </span>
      <label className="speed" title="播放速度">
        <IconGauge size={18} />
        <input className="range range-sm" type="range" aria-label="播放速度" min={1} max={10} value={speed} style={pct(speed - 1, 9)} onChange={(e) => setSpeed(+e.target.value)} />
      </label>
    </div>
  );
}

/** 虛擬碼每行高度（與 CSS .code-line 一致），用來移動高亮指示條 */
const LINE_H = 24;

export function Stage({ frame, code, line }: { frame?: Frame; code?: string[]; line?: number }) {
  const msg = frame?.msg ?? '按下「執行」開始';
  const hasLine = !!line && !!code && line >= 1 && line <= code.length;
  return (
    <div className="stage">
      <div className="stage-main">
        <div className="msg" aria-live="polite">
          <Shape name="burst" className="msg-shape" />
          <span className="msg-text" key={msg}>{msg}</span>
        </div>
        {frame && <Panels panels={frame.panels} />}
      </div>
      {code && code.length > 0 && (
        <div className="code">
          <div className="code-title"><IconCode size={16} />虛擬碼</div>
          <div className="code-lines">
            <div className={'code-ind' + (hasLine ? '' : ' hide')} style={{ transform: `translateY(${((hasLine ? line! : 1) - 1) * LINE_H}px)` }} />
            {code.map((c, i) => (
              <div key={i} className={'code-line' + (line === i + 1 ? ' hl' : '')}>
                <span className="ln">{i + 1}</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
