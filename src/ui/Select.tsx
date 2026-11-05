import { useEffect, useId, useRef, useState } from 'react';
import { IconCheck, IconChevron } from './icons';

interface Opt { value: string; label: string }

/** M3 下拉選單：填色欄位 + 浮起的選單面板，開關都有彈簧動畫；支援鍵盤操作 */
export function Select({ value, options, onChange }: { value: string; options: Opt[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const id = useId();
  const cur = options.find((o) => o.value === value) ?? options[0];

  const show = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setClosing(false);
    setOpen(true);
  };
  const hide = () => {
    if (!open || closing) return;
    setClosing(true);
  };
  const pick = (v: string) => {
    if (v !== value) onChange(v);
    hide();
  };

  // 點擊外部關閉
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) hide(); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  });

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); show(); }
      return;
    }
    if (e.key === 'Escape' || e.key === 'Tab') { hide(); return; }
    e.preventDefault();
    if (e.key === 'ArrowDown') setActive((a) => (a + 1) % options.length);
    else if (e.key === 'ArrowUp') setActive((a) => (a - 1 + options.length) % options.length);
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(options.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') pick(options[active].value);
  };

  return (
    <div className={'sel' + (open && !closing ? ' open' : '')} ref={wrap}>
      <button
        type="button"
        className="sel-field"
        role="combobox"
        aria-expanded={open && !closing}
        aria-controls={id}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => (open && !closing ? hide() : show())}
        onKeyDown={onKey}
      >
        <span className="sel-value">{cur?.label}</span>
        <span className="sel-arrow"><IconChevron size={18} /></span>
      </button>
      {open && (
        <ul
          id={id}
          role="listbox"
          className={'sel-menu' + (closing ? ' closing' : '')}
          onAnimationEnd={(e) => { if (closing && e.target === e.currentTarget) { setOpen(false); setClosing(false); } }}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={'sel-item' + (o.value === value ? ' selected' : '') + (i === active ? ' active' : '')}
              style={{ '--i': i } as React.CSSProperties}
              onPointerEnter={() => setActive(i)}
              onClick={(e) => { e.preventDefault(); pick(o.value); }} // 阻止外層 <label> 把點擊轉給欄位按鈕
            >
              <span className="sel-check">{o.value === value && <IconCheck size={18} />}</span>
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
