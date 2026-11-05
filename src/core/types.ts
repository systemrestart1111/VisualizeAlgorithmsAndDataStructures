// 視覺化核心型別：每個演算法輸出一連串 Frame，每個 Frame 由數個 Panel 組成。

export type Color =
  | 'default'
  | 'compare'
  | 'swap'
  | 'active'
  | 'done'
  | 'visited'
  | 'path'
  | 'muted'
  | 'special'
  | 'bad'
  | 'good'
  | 'frontier';

export type CMap = Record<number | string, Color | undefined>;

export interface Pointer {
  index: number;
  label: string;
  color?: Color;
}

interface PanelBase {
  title?: string;
  /** 'full'（預設）佔滿一列；'half' 與其他 half panel 並排 */
  w?: 'full' | 'half' | 'auto';
}

export interface BarsPanel extends PanelBase {
  type: 'bars';
  values: number[];
  colors: CMap;
  pointers?: Pointer[];
  labels?: string[];
  ranges?: { from: number; to: number; color?: Color; label?: string }[];
  height?: number;
}

export interface TablePanel extends PanelBase {
  type: 'table';
  rows: (string | number | null | undefined)[][];
  colors?: Record<string, Color | undefined>;
  rowHeaders?: (string | number)[];
  colHeaders?: (string | number)[];
  pointers?: { c: number; label: string; color?: Color }[];
  /** 迷宮等大型格子：不顯示文字、使用小格 */
  cell?: number;
  arrows?: Record<string, string>;
}

export interface GNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  color?: Color;
  sub?: string;
  badge?: string;
  shape?: 'circle' | 'rect';
  w?: number;
  h?: number;
  r?: number;
}

export interface GEdge {
  from: string;
  to: string;
  label?: string;
  color?: Color;
  directed?: boolean;
  curve?: number;
  dashed?: boolean;
  width?: number;
}

export interface GraphPanel extends PanelBase {
  type: 'graph';
  nodes: GNode[];
  edges: GEdge[];
  height?: number;
}

export interface PlotPanel extends PanelBase {
  type: 'plot';
  bounds?: [number, number, number, number];
  points?: { x: number; y: number; color?: Color; label?: string; r?: number }[];
  segments?: { x1: number; y1: number; x2: number; y2: number; color?: Color; dashed?: boolean; width?: number }[];
  polygons?: { pts: [number, number][]; color?: Color; fill?: boolean; dashed?: boolean }[];
  circles?: { x: number; y: number; r: number; color?: Color }[];
  curves?: { pts: [number, number][]; color?: Color; width?: number }[];
  axes?: boolean;
  height?: number;
  square?: boolean;
}

export interface VarsPanel extends PanelBase {
  type: 'vars';
  items: { k: string; v: string; color?: Color }[];
}

export interface TextPanel extends PanelBase {
  type: 'text';
  lines: string[];
}

export type Panel = BarsPanel | TablePanel | GraphPanel | PlotPanel | VarsPanel | TextPanel;

export interface Frame {
  msg: string;
  line?: number;
  panels: Panel[];
}

/** random(cur)：cur 為目前各欄位的值（同一次「全部隨機」中，前面欄位已換成新的隨機值） */
type RandomFn<T> = (cur: Record<string, any>) => T;

export type InputSpec =
  | { key: string; label: string; type: 'array'; default: number[]; random?: RandomFn<number[]> }
  | { key: string; label: string; type: 'number'; default: number; min?: number; max?: number; random?: RandomFn<number> }
  | { key: string; label: string; type: 'text'; default: string; multiline?: boolean; random?: RandomFn<string> }
  | { key: string; label: string; type: 'select'; default: string; options: { value: string; label: string }[] };

export interface AlgoDef {
  id: string;
  name: string;
  en: string;
  cat: string;
  desc: string;
  time?: string;
  space?: string;
  star?: boolean;
  code?: string[];
  inputs: InputSpec[];
  run: (input: any) => Frame[];
}

export interface DSOp {
  key: string;
  label: string;
  arg: 'none' | 'number' | 'text' | 'two';
  argLabel?: string;
  /** 隨機產生參數 */
  rand?: () => any;
}

export interface DSInstance {
  /** 回傳執行此操作的動畫畫格（最後一格為最終狀態） */
  apply(op: string, a?: any, b?: any): Frame[];
  view(): Frame;
}

export interface DSDef {
  id: string;
  name: string;
  en: string;
  cat: string;
  desc: string;
  star?: boolean;
  complexity: [string, string][];
  codes?: Record<string, string[]>;
  ops: DSOp[];
  create(): DSInstance;
  /** 初始化時自動執行的操作 */
  init?: [string, any?, any?][];
}

export type Item = (AlgoDef & { kind: 'algo' }) | (DSDef & { kind: 'ds' });
