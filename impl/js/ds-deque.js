// 雙端佇列：用環狀陣列實作，兩端都能 O(1) 加入與移除；滿了就把容量加倍
class Deque {
  constructor() { this.buf = new Array(4); this.head = 0; this.size = 0; }
  grow() {
    const nb = new Array(this.buf.length * 2);
    for (let i = 0; i < this.size; i++) nb[i] = this.buf[(this.head + i) % this.buf.length];
    this.buf = nb;
    this.head = 0;
  }
  pushFront(v) {
    if (this.size === this.buf.length) this.grow();
    this.head = (this.head - 1 + this.buf.length) % this.buf.length;
    this.buf[this.head] = v;
    this.size++;
  }
  pushBack(v) {
    if (this.size === this.buf.length) this.grow();
    this.buf[(this.head + this.size) % this.buf.length] = v;
    this.size++;
  }
  popFront() {
    const v = this.buf[this.head];
    this.head = (this.head + 1) % this.buf.length;
    this.size--;
    return v;
  }
  popBack() { this.size--; return this.buf[(this.head + this.size) % this.buf.length]; }
  toString() {
    const items = [];
    for (let i = 0; i < this.size; i++) items.push(this.buf[(this.head + i) % this.buf.length]);
    return `[${items.join(' ')}] cap=${this.buf.length}`;
  }
}

const d = new Deque();
d.pushBack(1); d.pushBack(2); d.pushFront(0);
console.log('push_back 1, push_back 2, push_front 0: ' + d);
d.pushFront(-1); d.pushBack(3);
console.log('push_front -1, push_back 3: ' + d);
const a = d.popFront(), b = d.popBack();
console.log(`pop_front -> ${a}  pop_back -> ${b}  ${d}`);
