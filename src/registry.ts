import type { AlgoDef, DSDef, Item } from './core/types';
import dsLinear from './ds/linear';
import dsHash from './ds/hash';
import dsTrees from './ds/trees';
import dsAdv from './ds/advanced';
import dsProb from './ds/prob';
import dsExtra from './ds/extra';
import search from './algos/search';
import sortBasic from './algos/sortBasic';
import sortFast from './algos/sortFast';
import sortSpecial from './algos/sortSpecial';
import array from './algos/array';
import linked from './algos/linkedlist';
import stackq from './algos/stackqueue';
import tree from './algos/tree';
import graph from './algos/graph';
import shortest from './algos/shortest';
import mst from './algos/mst';
import flow from './algos/flow';
import greedy from './algos/greedy';
import dp from './algos/dp';
import backtrack from './algos/backtrack';
import string from './algos/string';
import math from './algos/math';
import geometry from './algos/geometry';
import random from './algos/random';
import other from './algos/other';
import concept from './algos/concept';
import crypto from './algos/crypto';
import extSort from './algos/ext-sort';
import technique from './algos/technique';
import graph2 from './algos/graph2';
import dp2 from './algos/dp2';
import string2 from './algos/string2';
import math2 from './algos/math2';
import numeric from './algos/numeric';
import geometry2 from './algos/geometry2';
import image from './algos/image';
import image2 from './algos/image2';
import ml from './algos/ml';

export const CATEGORIES = [
  { id: 'ds-linear', no: 'D1', name: '線性資料結構' },
  { id: 'ds-hash', no: 'D2', name: '雜湊表' },
  { id: 'ds-tree', no: 'D3', name: '樹狀資料結構' },
  { id: 'ds-adv', no: 'D4', name: '進階資料結構' },
  { id: 'ds-prob', no: 'D5', name: '機率與快取結構' },
  { id: 'concept', no: '0', name: '基礎概念' },
  { id: 'search', no: '1', name: '基礎搜尋' },
  { id: 'sort-basic', no: '2', name: '基礎排序' },
  { id: 'sort-fast', no: '3', name: '高效比較排序' },
  { id: 'sort-special', no: '4', name: '非比較與特殊排序' },
  { id: 'array', no: '5', name: '選擇與陣列處理' },
  { id: 'technique', no: '5.1', name: '陣列解題技巧' },
  { id: 'linked', no: '6', name: '鏈結串列操作' },
  { id: 'stackq', no: '7', name: '堆疊與佇列應用' },
  { id: 'tree', no: '8', name: '樹操作與走訪' },
  { id: 'graph', no: '9', name: '圖走訪與結構分析' },
  { id: 'path', no: '10', name: '最短路徑與路徑搜尋' },
  { id: 'mst', no: '11', name: '最小生成樹' },
  { id: 'flow', no: '12', name: '網路流與匹配' },
  { id: 'greedy', no: '13', name: '貪婪演算法' },
  { id: 'dp', no: '14', name: '動態規劃' },
  { id: 'backtrack', no: '15', name: '回溯與組合搜尋' },
  { id: 'string', no: '16', name: '字串演算法' },
  { id: 'math', no: '17', name: '數學與數論' },
  { id: 'numeric', no: '17.1', name: '線性代數與數值方法' },
  { id: 'geometry', no: '18', name: '計算幾何' },
  { id: 'crypto', no: '21', name: '密碼學' },
  { id: 'image', no: '22', name: '影像處理' },
  { id: 'ml', no: '23', name: '機器學習與隨機最佳化' },
  { id: 'random', no: '19', name: '隨機化與資料抽樣' },
  { id: 'other', no: '20', name: '其他應用領域' },
];

/** 側邊欄與首頁的大分區：每個分區包含數個分類 */
export const SECTIONS = [
  { id: 'foundations', name: '基礎概念', desc: '模運算、位元、矩陣、機率與導數：後面許多主題共用的數學工具', cats: ['concept'] },
  { id: 'ds', name: '資料結構', desc: '互動操作：插入、刪除、搜尋，每一步都有動畫', cats: ['ds-linear', 'ds-hash', 'ds-tree', 'ds-adv', 'ds-prob'] },
  { id: 'search-sort', name: '搜尋與排序', desc: '從線性搜尋到內省排序，比較各種策略的步數', cats: ['search', 'sort-basic', 'sort-fast', 'sort-special'] },
  { id: 'linear-ops', name: '線性結構操作', desc: '陣列技巧、鏈結串列指標操作、堆疊與佇列的應用', cats: ['array', 'technique', 'linked', 'stackq'] },
  { id: 'graph', name: '樹與圖論', desc: '走訪、最短路徑、生成樹、網路流與匹配', cats: ['tree', 'graph', 'path', 'mst', 'flow'] },
  { id: 'paradigm', name: '設計策略', desc: '貪婪、動態規劃、回溯：三種常見的解題思路', cats: ['greedy', 'dp', 'backtrack'] },
  { id: 'string', name: '字串處理', desc: '字串匹配、回文、後綴結構', cats: ['string'] },
  { id: 'math-geo', name: '數學與幾何', desc: '數論、數值方法、FFT、凸包與三角剖分', cats: ['math', 'numeric', 'geometry'] },
  { id: 'crypto', name: '密碼學', desc: '古典密碼、RSA 與 Diffie–Hellman、AES、SHA-256 與訊息驗證', cats: ['crypto'] },
  { id: 'vision-ml', name: '影像與機器學習', desc: '卷積、邊緣與角點偵測、影像分割，以及迴歸、分群與最佳化', cats: ['image', 'ml'] },
  { id: 'applied', name: '隨機化與應用', desc: '抽樣、壓縮與博弈樹搜尋', cats: ['random', 'other'] },
];

const DS: DSDef[] = [...dsLinear, ...dsHash, ...dsTrees, ...dsAdv, ...dsProb, ...dsExtra];
const ALGOS: AlgoDef[] = [...search, ...sortBasic, ...sortFast, ...sortSpecial, ...array, ...linked, ...stackq, ...tree, ...graph, ...shortest, ...mst, ...flow, ...greedy, ...dp, ...backtrack, ...string, ...math, ...geometry, ...random, ...other, ...concept, ...crypto, ...extSort, ...technique, ...graph2, ...dp2, ...string2, ...math2, ...numeric, ...geometry2, ...image, ...image2, ...ml];

const order = new Map(CATEGORIES.map((c, i) => [c.id, i]));
export const ITEMS: Item[] = [
  ...DS.map((d) => ({ ...d, kind: 'ds' as const })),
  ...ALGOS.map((a) => ({ ...a, kind: 'algo' as const })),
].sort((a, b) => (order.get(a.cat) ?? 99) - (order.get(b.cat) ?? 99));

export const byId: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
