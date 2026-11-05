const MAX_LEVEL = 4;

// Park–Miller 亂數，讓每種語言都得到相同的層數（乘積 < 2^53，Number 可精確表示）
let state = 42;
const randInt = (k) => { state = (state * 48271) % 2147483647; return state % k; };

// 多層排序串列：每個節點以 1/2 機率往上多一層，搜尋時從最高層往下跳，期望 O(log n)
class SkipList {
  constructor() { this.head = { val: null, next: new Array(MAX_LEVEL).fill(null) }; this.level = 1; }
  randomLevel() {
    let lvl = 1;
    while (lvl < MAX_LEVEL && randInt(2) === 0) lvl++;
    return lvl;
  }
  // 回傳每一層「最後一個 < k 的節點」
  findUpdate(k) {
    const update = new Array(MAX_LEVEL).fill(this.head);
    let x = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (x.next[i] && x.next[i].val < k) x = x.next[i];
      update[i] = x;
    }
    return update;
  }
  insert(k) {
    const update = this.findUpdate(k), nxt = update[0].next[0];
    if (nxt && nxt.val === k) return 0;
    const lvl = this.randomLevel();
    this.level = Math.max(this.level, lvl);
    const n = { val: k, next: new Array(lvl).fill(null) };
    for (let i = 0; i < lvl; i++) { n.next[i] = update[i].next[i]; update[i].next[i] = n; }
    return lvl;
  }
  search(k) {
    const visited = [];
    let x = this.head;
    for (let i = this.level - 1; i >= 0; i--)
      while (x.next[i] && x.next[i].val < k) { x = x.next[i]; visited.push(x.val); }
    x = x.next[0];
    return [!!x && x.val === k, visited];
  }
  delete(k) {
    const update = this.findUpdate(k), x = update[0].next[0];
    if (!x || x.val !== k) return false;
    for (let i = 0; i < x.next.length; i++) update[i].next[i] = x.next[i];
    while (this.level > 1 && !this.head.next[this.level - 1]) this.level--;
    return true;
  }
  show() {
    for (let i = this.level - 1; i >= 0; i--) {
      const vals = [];
      for (let x = this.head.next[i]; x; x = x.next[i]) vals.push(x.val);
      console.log(`  L${i}: ${vals.join(' ')}`);
    }
  }
}

const s = new SkipList();
for (const k of [30, 10, 50, 20, 70, 40, 60, 80, 25]) console.log(`insert ${k} (level ${s.insert(k)})`);
s.show();
for (const k of [60, 45]) {
  const [found, visited] = s.search(k);
  console.log(`search ${k}: ${found ? 'found' : 'not found'}, visited ${visited.join(' ')}`);
}
console.log('delete 40 -> ' + (s.delete(40) ? 'True' : 'False'));
s.show();
