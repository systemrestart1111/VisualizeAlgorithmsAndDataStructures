import type { CMap, Panel, Pointer } from './types';
import { Rec, bars, vars } from './helpers';

export const ptrs = (o: Record<string, number | undefined> = {}): Pointer[] =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v >= 0)
    .map(([label, index]) => ({ label, index: index! }));

/** 排序用的追蹤器：記錄比較／交換次數，已排定位置自動標為綠色 */
export class SortTracer {
  r = new Rec();
  a: number[];
  done = new Set<number>();
  cmp = 0;
  swp = 0;
  extraVars: Record<string, unknown> = {};
  constructor(a: number[]) {
    this.a = [...a];
  }
  snap(msg: string, colors: CMap = {}, line?: number, p?: Record<string, number | undefined>, extra: Panel[] = [], ranges?: { from: number; to: number; color?: any; label?: string }[]) {
    const c: CMap = {};
    for (const i of this.done) c[i] = 'done';
    Object.assign(c, colors);
    this.r.snap(msg, [bars(this.a, c, { pointers: ptrs(p), ranges }), vars({ 比較: this.cmp, '交換/寫入': this.swp, ...this.extraVars }), ...extra], line);
  }
  less(i: number, j: number) {
    this.cmp++;
    return this.a[i] < this.a[j];
  }
  swap(i: number, j: number) {
    this.swp++;
    [this.a[i], this.a[j]] = [this.a[j], this.a[i]];
  }
  set(i: number, v: number) {
    this.swp++;
    this.a[i] = v;
  }
  finish(msg = '排序完成！') {
    for (let i = 0; i < this.a.length; i++) this.done.add(i);
    this.snap(msg);
    return this.r.frames;
  }
}
