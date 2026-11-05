import type { DSInstance, Frame, Panel } from '../core/types';
import { Rec } from '../core/helpers';

/** 資料結構的共用基底：每個操作重新建立記錄器，panels() 依目前狀態與高亮資訊產生畫面 */
export abstract class DSBase<H = any> implements DSInstance {
  r = new Rec();
  abstract panels(hl?: H): Panel[];
  abstract run(op: string, a?: any, b?: any): void;
  snap(msg: string, line?: number, hl?: H) {
    this.r.snap(msg, this.panels(hl), line);
  }
  apply(op: string, a?: any, b?: any): Frame[] {
    this.r = new Rec();
    this.run(op, a, b);
    if (!this.r.frames.length) this.snap('完成');
    return this.r.frames;
  }
  view(): Frame {
    return { msg: '目前狀態（選擇下方操作開始）', panels: structuredClone(this.panels()) };
  }
}

export const num = (x: any, def = 0) => (typeof x === 'number' && !Number.isNaN(x) ? x : Number.isNaN(Number(x)) ? def : Number(x));
