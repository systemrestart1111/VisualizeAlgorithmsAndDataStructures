import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { highlight } from './highlight';
import { IconCheck, IconCode, IconCopy } from './icons';

// 各語言實作：impl/<語言>/<id>.<副檔名>，執行結果 impl/output/<id>.txt；全部以動態載入避免主程式變大
const files = import.meta.glob('../../impl/*/*', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

export const LANGS = [
  { id: 'python', label: 'Python', ext: 'py' },
  { id: 'c', label: 'C', ext: 'c' },
  { id: 'cpp', label: 'C++', ext: 'cpp' },
  { id: 'java', label: 'Java', ext: 'java' },
  { id: 'js', label: 'JavaScript', ext: 'js' },
];
const key = (lang: string, ext: string, id: string) => `../../impl/${lang}/${id}.${ext}`;
export const hasImpl = (id: string) => LANGS.some((l) => files[key(l.id, l.ext, id)]);

const loadPref = () => {
  try {
    return localStorage.getItem('viz-lang') ?? 'python';
  } catch {
    return 'python';
  }
};

export function CodeImpl({ id }: { id: string }) {
  const langs = useMemo(() => LANGS.filter((l) => files[key(l.id, l.ext, id)]), [id]);
  const [lang, setLang] = useState(() => {
    const p = loadPref();
    return langs.some((l) => l.id === p) ? p : langs[0]?.id;
  });
  const [src, setSrc] = useState<{ lang: string; text: string } | null>(null);
  const [out, setOut] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const l = LANGS.find((x) => x.id === lang);
    if (!l) return;
    let live = true;
    files[key(l.id, l.ext, id)]?.().then((text) => live && setSrc({ lang: l.id, text: text.replace(/\r\n/g, '\n').trimEnd() }));
    try {
      localStorage.setItem('viz-lang', lang);
    } catch {
      /* 忽略 */
    }
    return () => {
      live = false;
    };
  }, [id, lang]);
  useEffect(() => {
    const f = files[key('output', 'txt', id)];
    if (f) f().then((t) => setOut(t.replace(/\r\n/g, '\n').trimEnd()));
  }, [id]);
  // 分頁指示條：滑到目前選取的分頁
  useLayoutEffect(() => {
    const el = tabsRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [lang, langs.length]);

  const lines = useMemo(() => (src ? highlight(src.text, src.lang) : []), [src]);
  if (!langs.length) return null;

  const copy = async () => {
    if (!src) return;
    try {
      await navigator.clipboard.writeText(src.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 無法存取剪貼簿時忽略 */
    }
  };

  return (
    <div className="card impl">
      <div className="impl-head">
        <div className="card-title">
          <IconCode size={16} />
          程式實作
        </div>
        <div className="tabs" role="tablist" ref={tabsRef}>
          {langs.map((l) => (
            <button key={l.id} role="tab" aria-selected={l.id === lang} className={l.id === lang ? 'sel' : ''} onClick={() => setLang(l.id)}>
              {l.label}
            </button>
          ))}
          <span className="tab-ind" style={{ transform: `translateX(${ind.left}px)`, width: ind.width }} />
        </div>
        <button className={'ghost copy' + (copied ? ' done' : '')} onClick={copy} aria-label="複製程式碼">
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          {copied ? '已複製' : '複製'}
        </button>
      </div>
      <pre className="impl-code" key={src?.lang}>
        <code>
          {lines.map((ln, i) => (
            <div key={i} className="impl-line">
              <span className="ln">{i + 1}</span>
              <span>
                {ln.map((t, j) => (t.c ? <span key={j} className={'tk-' + t.c}>{t.t}</span> : t.t))}
              </span>
            </div>
          ))}
        </code>
      </pre>
      {out && (
        <div className="impl-out">
          <div className="impl-out-title">執行結果（五種語言輸出一致）</div>
          <pre>{out}</pre>
        </div>
      )}
    </div>
  );
}
